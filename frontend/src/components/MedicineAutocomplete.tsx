import React, { useState, useRef, useEffect } from "react";
import { Search, X, AlertCircle } from "lucide-react";
import { searchMedicines, isValidMedicineName } from "../data/medicineNames";

interface MedicineAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  required?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  showError?: boolean;
}

export function MedicineAutocomplete({
  value,
  onChange,
  onValidationChange,
  required = false,
  placeholder = "e.g., Metformin, Aspirin",
  id,
  name,
  showError = false,
}: MedicineAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Validate medicine name
  const isValid = value.trim() === "" || isValidMedicineName(value);

  // Notify parent of validation state
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid || value.trim() === "");
    }
  }, [value, isValid, onValidationChange]);

  // Search for medicines when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = searchMedicines(inputValue);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setHighlightedIndex(-1);
  };

  // Handle selection from dropdown
  const handleSelect = (medicineName: string) => {
    onChange(medicineName);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          required={required}
          className={`pl-10 pr-10 input-field w-full ${
            showError && value.trim() !== "" && !isValid
              ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500"
              : ""
          }`}
          placeholder={placeholder}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear input"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((medicine, index) => (
            <button
              key={medicine}
              type="button"
              onClick={() => handleSelect(medicine)}
              className={`w-full text-left px-4 py-2 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none ${
                index === highlightedIndex
                  ? "bg-primary-100 text-primary-900"
                  : "text-gray-900"
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {medicine}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {value &&
        showSuggestions &&
        suggestions.length === 0 &&
        value.trim() !== "" && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-gray-500">
            No matching medicines found. Please select from the list.
          </div>
        )}

      {/* Validation error message */}
      {showError && value.trim() !== "" && !isValid && (
        <div className="mt-1 flex items-center text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Please select a valid medicine name from the dropdown.</span>
        </div>
      )}
    </div>
  );
}

