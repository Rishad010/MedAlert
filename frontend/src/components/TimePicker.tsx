import { useState, useEffect, useRef } from "react";
import { Clock, Plus, X } from "lucide-react";

interface TimePickerProps {
  value: string; // Comma-separated string like "8:00 AM, 2:00 PM, 8:00 PM"
  onChange: (value: string) => void;
  required?: boolean;
}

export function TimePicker({ value, onChange, required = false }: TimePickerProps) {
  // Parse the comma-separated string into an array of time strings
  const parseSchedule = (schedule: string): string[] => {
    if (!schedule || schedule.trim() === "") return [];
    return schedule.split(",").map((time) => time.trim()).filter(Boolean);
  };

  // Convert 12-hour format to 24-hour format for the input
  const convertTo24Hour = (time12: string): string => {
    if (!time12 || time12.trim() === "") return "";
    
    // Handle formats like "8:00 AM", "8:00AM", "8:00 am", etc.
    const match = time12.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      // Try to parse if it's already in 24-hour format
      const time24Match = time12.trim().match(/(\d{1,2}):(\d{2})/);
      if (time24Match) {
        return time12.trim();
      }
      return "";
    }
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return "";
    
    const [hours, minutes] = time24.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const [times, setTimes] = useState<string[]>([]);
  const isInternalUpdate = useRef(false);

  // Initialize times from value prop and sync when value changes externally
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    const parsed = parseSchedule(value || "");
    setTimes(parsed);
  }, [value]);

  // Update parent when times change
  const updateSchedule = (newTimes: string[]) => {
    isInternalUpdate.current = true;
    setTimes(newTimes);
    const scheduleString = newTimes.join(", ");
    onChange(scheduleString);
  };

  const addTimeSlot = () => {
    const defaultTime = "08:00"; // 8:00 AM in 24-hour format
    const newTime = convertTo12Hour(defaultTime);
    updateSchedule([...times, newTime]);
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    updateSchedule(newTimes);
  };

  const updateTimeSlot = (index: number, time24: string) => {
    const time12 = convertTo12Hour(time24);
    const newTimes = [...times];
    newTimes[index] = time12;
    updateSchedule(newTimes);
  };

  return (
    <div>
      <div className="space-y-2">
        {times.map((time, index) => {
          const time24 = convertTo24Hour(time);
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  value={time24}
                  onChange={(e) => updateTimeSlot(index, e.target.value)}
                  className="pl-10 input-field w-full"
                  required={required && index === 0}
                />
              </div>
              <button
                type="button"
                onClick={() => removeTimeSlot(index)}
                className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                aria-label="Remove time"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          );
        })}
        
        {times.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No times added. Click "Add Time" to add a schedule time.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={addTimeSlot}
        className="mt-3 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        <Plus className="h-4 w-4" />
        Add Time
      </button>

      {times.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Schedule: {times.join(", ")}
        </p>
      )}
    </div>
  );
}

