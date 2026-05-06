import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { medicinesAPI } from "../services/api";
import { TimePicker } from "../components/TimePicker";
import { MedicineAutocomplete } from "../components/MedicineAutocomplete";
import { isValidMedicineName } from "../data/medicineNames";
import {
  isValidDosage,
  getDosageErrorMessage,
} from "../utils/dosageValidation";

export function EditMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const { data: medicine, isLoading } = useQuery({
    queryKey: ["medicine", id],
    queryFn: () => medicinesAPI.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => medicinesAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      navigate("/medicines");
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to update medicine");
    },
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || "",
        dosage: medicine.dosage || "",
        schedule: medicine.schedule || "",
        stock: medicine.stock?.toString() || "",
        expiryDate: medicine.expiryDate
          ? new Date(medicine.expiryDate).toISOString().split("T")[0]
          : "",
        storageNotes: medicine.storageNotes || "",
      });
    }
  }, [medicine]);

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

    // Validate required fields
    if (
      !formData.name ||
      !formData.dosage ||
      !formData.schedule ||
      !formData.stock ||
      !formData.expiryDate
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate medicine name is in the approved list
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

    // Validate stock is a positive number
    if (isNaN(Number(formData.stock)) || Number(formData.stock) <= 0) {
      setError("Stock must be a positive number");
      return;
    }

    // Validate expiry date is in the future
    const expiryDate = new Date(formData.expiryDate);
    const today = new Date();
    if (expiryDate <= today) {
      setError("Expiry date must be in the future");
      return;
    }

    updateMutation.mutate({
      ...formData,
      stock: Number(formData.stock),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Medicine not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The medicine you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/medicines")}
          className="mt-4 btn-primary"
        >
          Back to Medicines
        </button>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Medicine</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the details for {medicine.name}
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
                Schedule *
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
                Current Stock *
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
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center"
          >
            {updateMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
