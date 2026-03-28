// config/agenda.js
import Agenda from "agenda";
import dotenv from "dotenv";

dotenv.config();

const agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "agendaJobs" },
  processEvery: "1 minute", // how often Agenda checks for jobs
});

// Note: The "send-dose-reminder" job is defined in jobs/sendReminder.js
// This file only sets up the Agenda instance
// agenda.start() should be called in worker.js, not here

export default agenda;
