import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Pill,
  Calendar,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { medicinesAPI } from "../services/api";
import { format, isBefore, addDays } from "date-fns";

export function Medicines() {
  const queryClient = useQueryClient();

  const { data: medicines, isLoading } = useQuery({
    queryKey: ["medicines"],
    queryFn: () => medicinesAPI.getAll().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicinesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 3)
      return {
        status: "low",
        color: "text-danger-600",
        bgColor: "bg-danger-100",
      };
    if (stock <= 7)
      return {
        status: "medium",
        color: "text-warning-600",
        bgColor: "bg-warning-100",
      };
    return {
      status: "good",
      color: "text-success-600",
      bgColor: "bg-success-100",
    };
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const weekFromNow = addDays(now, 7);

    if (isBefore(expiry, now))
      return {
        status: "expired",
        color: "text-danger-600",
        bgColor: "bg-danger-100",
      };
    if (isBefore(expiry, weekFromNow))
      return {
        status: "expiring",
        color: "text-warning-600",
        bgColor: "bg-warning-100",
      };
    return {
      status: "good",
      color: "text-success-600",
      bgColor: "bg-success-100",
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your medication inventory and schedules
          </p>
        </div>
        <Link to="/medicines/add" className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Medicine
        </Link>
      </div>

      {/* Medicines Grid */}
      {medicines && medicines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine: any) => {
            const stockStatus = getStockStatus(medicine.stock);
            const expiryStatus = getExpiryStatus(medicine.expiryDate);

            return (
              <div
                key={medicine._id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Pill className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {medicine.name}
                      </h3>
                      <p className="text-sm text-gray-500">{medicine.dosage}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/medicines/${medicine._id}/edit`}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(medicine._id)}
                      className="text-gray-400 hover:text-danger-600"
                      disabled={deleteMutation.isPending}
                      aria-label={`Delete ${medicine.name}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Schedule */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{medicine.schedule}</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                    >
                      {medicine.stock} remaining
                    </span>
                  </div>

                  {/* Expiry Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expiryStatus.bgColor} ${expiryStatus.color}`}
                    >
                      {format(new Date(medicine.expiryDate), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* Storage Notes */}
                  {medicine.storageNotes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Storage:</span>{" "}
                      {medicine.storageNotes}
                    </div>
                  )}
                </div>

                {/* Alerts */}
                <div className="mt-4 space-y-2">
                  {stockStatus.status === "low" && (
                    <div className="flex items-center text-sm text-danger-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Low stock alert
                    </div>
                  )}
                  {expiryStatus.status === "expiring" && (
                    <div className="flex items-center text-sm text-warning-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Expiring soon
                    </div>
                  )}
                  {expiryStatus.status === "expired" && (
                    <div className="flex items-center text-sm text-danger-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Expired
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Pill className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No medicines
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first medicine.
          </p>
          <div className="mt-6">
            <Link
              to="/medicines/add"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Medicine
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
