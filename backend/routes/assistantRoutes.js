// backend/routes/assistantRoutes.js
import express from "express";
import {
  GoogleGenerativeAI,
  SchemaType,
  FunctionCallingMode,
} from "@google/generative-ai";
import { protect } from "../middleware/authMiddleware.js";
import Medicine from "../models/Medicine.js";
import logger from "../utils/logger.js";
import { dispatchMedicineTool } from "../utils/assistantMedicineActions.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const medicineToolDeclarations = [
  {
    name: "create_medicine",
    description:
      "Add a new medicine to the user's MedAlert list and schedule dose reminders. Only call when the user wants to register a new medication and you have all required fields (or after asking for missing fields like expiry date).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description:
            "Exact medicine name matching the app's approved list (same spelling as in the UI dropdown).",
        },
        dosage: {
          type: SchemaType.STRING,
          description: 'Dose form, e.g. "1 tablet", "500 mg", "5 ml".',
        },
        schedule: {
          type: SchemaType.STRING,
          description:
            'Comma-separated times in 12-hour form, e.g. "8:00 AM, 8:00 PM".',
        },
        stock: {
          type: SchemaType.INTEGER,
          description: "Whole number of units left (must be at least 1).",
        },
        expiryDate: {
          type: SchemaType.STRING,
          description: "ISO 8601 date string; must be in the future.",
        },
        storageNotes: {
          type: SchemaType.STRING,
          description: "Optional storage notes.",
        },
      },
      required: ["name", "dosage", "schedule", "stock", "expiryDate"],
    },
  },
  {
    name: "update_medicine_schedule",
    description:
      "Update dose times (and optionally dosage or stock) for an existing medicine. Prefer medicineId from the user's medicine list when known.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        medicineId: {
          type: SchemaType.STRING,
          description: "MongoDB id from the user's medicine list.",
        },
        medicineName: {
          type: SchemaType.STRING,
          description:
            "Medicine name if id is unknown (must match an existing entry).",
        },
        schedule: {
          type: SchemaType.STRING,
          description:
            'Comma-separated times, e.g. "7:00 AM, 2:00 PM, 9:00 PM".',
        },
        dosage: {
          type: SchemaType.STRING,
          description: "Optional new dosage text.",
        },
        stock: {
          type: SchemaType.INTEGER,
          description: "Optional new stock count.",
        },
      },
      required: ["schedule"],
    },
  },
];

const tools = [{ functionDeclarations: medicineToolDeclarations }];

const toolConfig = {
  functionCallingConfig: {
    mode: FunctionCallingMode.AUTO,
  },
};

function buildSystemPrompt(medicineLines) {
  return `You are MedBot, a helpful medicine assistant inside the MedAlert app.
You help users understand their medications, check for interactions, clarify dosage questions, explain side effects, and manage schedules.

The user's current medicines (use id for updates when possible):
${medicineLines}

You have tools to create a new medicine entry or update an existing medicine's schedule. Use them only when the user clearly wants to add a medication to their list or change reminder times.

Rules for tools:
- For create_medicine: the name must exactly match one of the app's allowed medicine names (same as the manual Add Medicine form). Ask for expiry date and stock if missing before calling.
- Schedule times must be comma-separated 12-hour times like "8:00 AM, 6:00 PM" so reminders work.
- For update_medicine_schedule: pass medicineId from the list above, or medicineName if the user refers to a medicine by name.

General rules:
- Only answer questions related to medicines, health, or the user's medication schedule
- Always recommend consulting a doctor or pharmacist for serious medical decisions
- Never diagnose conditions or prescribe medications
- Keep answers concise and easy to understand
- If asked something unrelated to health or medicines, politely redirect the conversation`;
}

function streamTextToClient(res, text) {
  if (!text) return;
  const chunkSize = 48;
  for (let i = 0; i < text.length; i += chunkSize) {
    const slice = text.slice(i, i + chunkSize);
    res.write(`data: ${JSON.stringify({ text: slice })}\n\n`);
  }
}

router.post("/chat", protect, async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const medicines = await Medicine.find({ user: req.user._id })
      .select("name dosage schedule stock expiryDate")
      .sort({ createdAt: -1 });

    const medicineContextLines =
      medicines.length > 0
        ? medicines
            .map(
              (m) =>
                `- id: ${m._id} | ${m.name} (${m.dosage}) | schedule: ${m.schedule} | stock: ${m.stock}`
            )
            .join("\n")
        : "No medicines logged yet.";

    const systemPrompt = buildSystemPrompt(medicineContextLines);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const geminiHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-1.5-pro-latest",
    ].filter(Boolean);

    let lastErr;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          tools,
          toolConfig,
        });

        const chat = model.startChat({ history: geminiHistory });

        let result = await chat.sendMessage(message.trim());
        let medicinesChanged = false;
        let guard = 0;

        while (guard++ < 10) {
          const calls = result.response.functionCalls?.();
          if (calls?.length) {
            const parts = [];
            for (const call of calls) {
              const out = await dispatchMedicineTool(
                req.user._id,
                call.name,
                call.args
              );
              if (out.success) medicinesChanged = true;
              parts.push({
                functionResponse: {
                  name: call.name,
                  response: out,
                },
              });
            }
            result = await chat.sendMessage(parts);
            continue;
          }

          let replyText = "";
          try {
            replyText = result.response.text() || "";
          } catch (e) {
            logger.warn(`Assistant text() error: ${e.message}`);
          }
          if (!replyText.trim()) {
            replyText =
              "I couldn't produce a reply. Try rephrasing, or check that your request is about medicines.";
          }
          streamTextToClient(res, replyText);
          break;
        }

        if (medicinesChanged) {
          res.write(
            `data: ${JSON.stringify({ invalidateMedicines: true })}\n\n`
          );
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      } catch (err) {
        lastErr = err;
        const msg = String(err?.message || err);

        if (
          msg.includes("404") ||
          msg.includes("not found") ||
          msg.includes("models/")
        ) {
          logger.error(`Assistant model "${modelName}" failed: ${msg}`);
          continue;
        }

        throw err;
      }
    }

    throw lastErr;
  } catch (err) {
    logger.error(`Assistant error: ${err.message}`);
    if (!res.headersSent) {
      next(err);
    } else {
      try {
        res.write(
          `data: ${JSON.stringify({
            text: "\n\nSomething went wrong. Please try again.",
          })}\n\n`
        );
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch {
        /* ignore */
      }
    }
  }
});

export default router;
