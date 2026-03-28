import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";
import { medicinesAPI } from "../services/api";
import { TimePicker } from "../components/TimePicker";
import { MedicineAutocomplete } from "../components/MedicineAutocomplete";
import { isValidMedicineName } from "../data/medicineNames";
import {
  isValidDosage,
  getDosageErrorMessage,
} from "../utils/dosageValidation";
import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  schedule: z.string().min(1, "Schedule is required"),
  stock: z
    .number({ error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(1, "Stock must be at least 1"),
  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .refine((val) => new Date(val) > new Date(), {
      message: "Expiry date must be in the future",
    }),
  storageNotes: z.string().optional(),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

export function AddMedicine() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    schedule: "",
    stock: "",
    expiryDate: "",
    storageNotes: "",
  });
  const [error, setError] = useState("");
  const [showMedicineNameError, setShowMedicineNameError] = useState(false);
  const [showDosageError, setShowDosageError] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: MedicineFormData) => medicinesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      navigate("/medicines");
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to create medicine");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowMedicineNameError(false);
    setShowDosageError(false);

    // Validate medicine name against approved list first
    if (!isValidMedicineName(formData.name)) {
      setError("Please select a valid medicine name from the dropdown list.");
      setShowMedicineNameError(true);
      return;
    }

    // Validate dosage format
    if (!isValidDosage(formData.dosage)) {
      setError(getDosageErrorMessage());
      setShowDosageError(true);
      return;
    }

    // Zod validates everything else
    const result = medicineSchema.safeParse({
      ...formData,
      stock: Number(formData.stock),
    });

    if (!result.success) {
      // Show the first validation error
      const firstError = result.error.issues[0];
      setError(firstError.message);
      return;
    }

    createMutation.mutate(result.data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/medicines")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Medicines
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Medicine</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the details for your new medication
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="text-sm text-danger-700">{error}</div>
          </div>
        )}

        <div className="card">
          <div className="space-y-6">
            {/* Medicine Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Medicine Name *
              </label>
              <div className="mt-1">
                <MedicineAutocomplete
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(value) => {
                    setFormData({ ...formData, name: value });
                    setShowMedicineNameError(false);
                  }}
                  required
                  showError={showMedicineNameError}
                  placeholder="Start typing to see suggestions (e.g., Metformin, Aspirin)"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Please select a medicine name from the dropdown list
              </p>
            </div>

            {/* Dosage */}
            <div>
              <label
                htmlFor="dosage"
                className="block text-sm font-medium text-gray-700"
              >
                Dosage *
              </label>
              <input
                type="text"
                name="dosage"
                id="dosage"
                required
                className={`mt-1 input-field ${
                  showDosageError &&
                  formData.dosage.trim() !== "" &&
                  !isValidDosage(formData.dosage)
                    ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500"
                    : ""
                }`}
                placeholder="e.g., 1 tablet, 5ml, 500mg"
                value={formData.dosage}
                onChange={(e) => {
                  handleChange(e);
                  setShowDosageError(false);
                }}
              />
              {showDosageError &&
                formData.dosage.trim() !== "" &&
                !isValidDosage(formData.dosage) && (
                  <div className="mt-1 flex items-center text-sm text-danger-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{getDosageErrorMessage()}</span>
                  </div>
                )}
              <p className="mt-1 text-sm text-gray-500">
                Enter dosage with number and unit (e.g., "1 tablet", "500mg",
                "5ml")
              </p>
            </div>

            {/* Schedule */}
            <div>
              <label
                htmlFor="schedule"
                className="block text-sm font-medium text-gray-700"
              >
                Medication Schedules *
              </label>
              <div className="mt-1">
                <TimePicker
                  value={formData.schedule}
                  onChange={(value) =>
                    setFormData({ ...formData, schedule: value })
                  }
                  required
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700"
              >
                Current Stock (Number of units remaining) *
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                required
                min="1"
                className="mt-1 input-field"
                placeholder="e.g., 30"
                value={formData.stock}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of doses/units remaining
              </p>
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-gray-700"
              >
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                required
                className="mt-1 input-field"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            {/* Storage Notes */}
            <div>
              <label
                htmlFor="storageNotes"
                className="block text-sm font-medium text-gray-700"
              >
                Storage Notes
              </label>
              <textarea
                name="storageNotes"
                id="storageNotes"
                rows={3}
                className="mt-1 input-field"
                placeholder="e.g., Store in refrigerator, Keep away from light"
                value={formData.storageNotes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/medicines")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary flex items-center"
          >
            {createMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            Add Medicine
          </button>
        </div>
      </form>
    </div>
  );
}
