// Dosage validation utility
// Valid formats include:
// - "1 tablet", "2 tablets", "1 capsule", "3 capsules"
// - "5ml", "10ml", "500mg", "1000mg"
// - "1 tablet (500mg)", "2 capsules (10mg each)"
// - Numbers with units (mg, g, ml, tablet, tablets, capsule, capsules, pill, pills, drop, drops, etc.)

export const isValidDosage = (dosage: string): boolean => {
  if (!dosage || dosage.trim() === "") return false;

  const trimmedDosage = dosage.trim();

  // Basic pattern: should contain at least one number and valid characters
  // Allow: numbers, letters, spaces, parentheses, forward slashes, hyphens, commas, periods
  // Disallow: special characters like ], [, ;, etc.
  const validPattern = /^[a-zA-Z0-9\s()\/\-,.]+$/;

  if (!validPattern.test(trimmedDosage)) {
    return false;
  }

  // Must contain at least one number
  if (!/\d/.test(trimmedDosage)) {
    return false;
  }

  // Must contain at least one letter (for unit)
  if (!/[a-zA-Z]/.test(trimmedDosage)) {
    return false;
  }

  // Common valid dosage patterns
  const validDosagePatterns = [
    // Number + unit (e.g., "500mg", "10ml", "5g")
    /^\d+(\.\d+)?\s*(mg|g|ml|mcg|µg|iu|units?|tablets?|capsules?|pills?|drops?|sprays?|patches?|injections?)$/i,
    
    // Number + space + unit (e.g., "500 mg", "10 ml", "1 tablet")
    /^\d+(\.\d+)?\s+(mg|g|ml|mcg|µg|iu|units?|tablets?|capsules?|pills?|drops?|sprays?|patches?|injections?)$/i,
    
    // Number + unit + additional info in parentheses (e.g., "1 tablet (500mg)")
    /^\d+(\.\d+)?\s*(mg|g|ml|mcg|µg|iu|units?|tablets?|capsules?|pills?|drops?|sprays?|patches?|injections?)\s*\([^)]+\)$/i,
    
    // Number + space + unit + additional info (e.g., "1 tablet 500mg")
    /^\d+(\.\d+)?\s+(tablet|capsule|pill|drop|spray|patch|injection|unit)s?\s+\d+(\.\d+)?\s*(mg|g|ml|mcg|µg)$/i,
    
    // Complex formats like "1-2 tablets", "5-10ml"
    /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\s*(mg|g|ml|mcg|µg|iu|units?|tablets?|capsules?|pills?|drops?|sprays?|patches?|injections?)$/i,
    
    // With "each" (e.g., "2 tablets (10mg each)")
    /^\d+(\.\d+)?\s+(tablets?|capsules?|pills?)\s*\([^)]+\s+each\)$/i,
  ];

  // Check if it matches any valid pattern
  const matchesPattern = validDosagePatterns.some((pattern) =>
    pattern.test(trimmedDosage)
  );

  // If it matches a pattern, it's valid
  if (matchesPattern) {
    return true;
  }

  // Additional check: if it contains numbers and common medical units, allow it
  // This is more lenient but still prevents gibberish
  const hasNumber = /\d/.test(trimmedDosage);
  const hasValidUnit = /(mg|g|ml|mcg|µg|iu|unit|tablet|capsule|pill|drop|spray|patch|injection)/i.test(
    trimmedDosage
  );

  // Must have both number and a valid unit
  if (hasNumber && hasValidUnit) {
    // Check that it doesn't contain obviously invalid characters
    const invalidChars = /[\[\];<>{}|\\`~!@#$%^&*_=+?]/;
    if (!invalidChars.test(trimmedDosage)) {
      return true;
    }
  }

  return false;
};

// Get a helpful error message for invalid dosage
export const getDosageErrorMessage = (): string => {
  return "Please enter a valid dosage format (e.g., '1 tablet', '500mg', '5ml', '2 capsules (10mg each)')";
};

