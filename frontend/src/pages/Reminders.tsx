import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Pill,
} from "lucide-react";
import { remindersAPI } from "../services/api";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";

export function Reminders() {
  const queryClient = useQueryClient();

  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      try {
        const response = await remindersAPI.getAll();
        return response.data || [];
      } catch (err: any) {
        console.error("Error fetching reminders:", err);
        throw err;
      }
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => remindersAPI.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id);
  };

  const getDateLabel = (date: string) => {
    const reminderDate = new Date(date);
    if (isToday(reminderDate)) return "Today";
    if (isYesterday(reminderDate)) return "Yesterday";
    if (isTomorrow(reminderDate)) return "Tomorrow";
    return format(reminderDate, "MMM dd, yyyy");
  };

  const getTimeLabel = (date: string) => {
    return format(new Date(date), "h:mm a");
  };

  const getStatusIcon = (acknowledged: boolean, sentAt: string) => {
    const now = new Date();
    const reminderTime = new Date(sentAt);
    const isOverdue = now > reminderTime && !acknowledged;

    if (acknowledged) {
      return <CheckCircle className="h-5 w-5 text-success-500" />;
    } else if (isOverdue) {
      return <AlertCircle className="h-5 w-5 text-danger-500" />;
    } else {
      return <Clock className="h-5 w-5 text-warning-500" />;
    }
  };

  const getStatusText = (acknowledged: boolean, sentAt: string) => {
    const now = new Date();
    const reminderTime = new Date(sentAt);
    const isOverdue = now > reminderTime && !acknowledged;

    if (acknowledged) {
      return { text: "Taken", color: "bg-success-100 text-success-800" };
    } else if (isOverdue) {
      return { text: "Overdue", color: "bg-danger-100 text-danger-800" };
    } else {
      return { text: "Pending", color: "bg-warning-100 text-warning-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your medication reminders and adherence
          </p>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Error loading reminders
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : "Failed to load reminders"}
          </p>
        </div>
      </div>
    );
  }

  // Group reminders by date
  const groupedReminders =
    reminders?.reduce((groups: any, reminder: any) => {
      const date = new Date(reminder.sentAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(reminder);
      return groups;
    }, {}) || {};

  const sortedDates = Object.keys(groupedReminders).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your medication reminders and adherence
        </p>
      </div>

      {/* Summary Stats - Show at the top */}
      {reminders && Array.isArray(reminders) && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taken Today
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reminders.length > 0
                      ? reminders.filter(
                          (r: any) =>
                            isToday(new Date(r.sentAt)) && r.acknowledged
                        ).length
                      : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Today
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reminders.length > 0
                      ? reminders.filter(
                          (r: any) =>
                            isToday(new Date(r.sentAt)) && !r.acknowledged
                        ).length
                      : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reminders.length > 0
                      ? reminders.filter((r: any) => {
                          const now = new Date();
                          const reminderTime = new Date(r.sentAt);
                          return now > reminderTime && !r.acknowledged;
                        }).length
                      : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {reminders && Array.isArray(reminders) && reminders.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="card">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {getDateLabel(date)}
                </h3>
              </div>

              <div className="space-y-3">
                {groupedReminders[date]
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.sentAt).getTime() -
                      new Date(a.sentAt).getTime()
                  )
                  .map((reminder: any) => {
                    const status = getStatusText(
                      reminder.acknowledged,
                      reminder.sentAt
                    );

                    return (
                      <div
                        key={reminder._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0 mr-4">
                            {getStatusIcon(
                              reminder.acknowledged,
                              reminder.sentAt
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center">
                              <Pill className="h-4 w-4 text-primary-600 mr-2" />
                              <h4 className="text-sm font-medium text-gray-900">
                                {reminder.medicine?.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-500">
                              {reminder.medicine?.dosage} •{" "}
                              {getTimeLabel(reminder.sentAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.text}
                          </span>

                          {!reminder.acknowledged && (
                            <button
                              onClick={() => handleAcknowledge(reminder._id)}
                              disabled={acknowledgeMutation.isPending}
                              className="btn-primary text-sm py-1 px-3"
                            >
                              Mark Taken
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No reminder logs yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Reminder logs will appear here after your scheduled medicine reminders are sent. 
            Make sure you have medicines with schedules set up, and wait for the scheduled time.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            API Status: {reminders === undefined ? "Loading..." : `Loaded (${Array.isArray(reminders) ? reminders.length : 0} reminders)`}
          </div>
        </div>
      )}
    </div>
  );
}
