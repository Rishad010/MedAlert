// Common medicine names list for autocomplete
export const commonMedicineNames = [
  // Pain Relievers & Anti-inflammatories
  "Aspirin",
  "Ibuprofen",
  "Acetaminophen",
  "Paracetamol",
  "Naproxen",
  "Diclofenac",
  "Celecoxib",
  "Meloxicam",
  
  // Antibiotics
  "Amoxicillin",
  "Penicillin",
  "Azithromycin",
  "Ciprofloxacin",
  "Doxycycline",
  "Cephalexin",
  "Clindamycin",
  "Metronidazole",
  "Trimethoprim",
  "Sulfamethoxazole",
  
  // Diabetes Medications
  "Metformin",
  "Insulin",
  "Glipizide",
  "Glyburide",
  "Pioglitazone",
  "Sitagliptin",
  "Gliclazide",
  
  // Blood Pressure & Heart
  "Lisinopril",
  "Amlodipine",
  "Atenolol",
  "Metoprolol",
  "Losartan",
  "Valsartan",
  "Hydrochlorothiazide",
  "Furosemide",
  "Digoxin",
  "Warfarin",
  
  // Cholesterol
  "Atorvastatin",
  "Simvastatin",
  "Rosuvastatin",
  "Pravastatin",
  
  // Antidepressants & Mental Health
  "Sertraline",
  "Fluoxetine",
  "Citalopram",
  "Escitalopram",
  "Paroxetine",
  "Venlafaxine",
  "Amitriptyline",
  "Bupropion",
  
  // Antihistamines & Allergy
  "Loratadine",
  "Cetirizine",
  "Fexofenadine",
  "Diphenhydramine",
  "Chlorpheniramine",
  
  // Gastrointestinal
  "Omeprazole",
  "Pantoprazole",
  "Lansoprazole",
  "Ranitidine",
  "Famotidine",
  "Metoclopramide",
  "Domperidone",
  
  // Respiratory
  "Albuterol",
  "Salbutamol",
  "Budesonide",
  "Fluticasone",
  "Montelukast",
  "Theophylline",
  
  // Thyroid
  "Levothyroxine",
  "Methimazole",
  "Propylthiouracil",
  
  // Vitamins & Supplements
  "Vitamin D",
  "Vitamin C",
  "Vitamin B12",
  "Folic Acid",
  "Calcium",
  "Iron",
  "Magnesium",
  "Zinc",
  
  // Antifungal
  "Fluconazole",
  "Clotrimazole",
  "Miconazole",
  "Terbinafine",
  
  // Antiviral
  "Acyclovir",
  "Valacyclovir",
  "Oseltamivir",
  
  // Muscle Relaxants
  "Baclofen",
  "Cyclobenzaprine",
  "Methocarbamol",
  
  // Sleep & Anxiety
  "Zolpidem",
  "Trazodone",
  "Diazepam",
  "Alprazolam",
  "Clonazepam",
  
  // Other Common Medications
  "Prednisone",
  "Prednisolone",
  "Hydrocortisone",
  "Allopurinol",
  "Colchicine",
  "Gabapentin",
  "Pregabalin",
  "Tramadol",
  "Codeine",
  "Morphine",
  "Oxycodone",
  "Hydrocodone",
  "Tylenol",
  "Advil",
  "Aleve",
  "Motrin",
  "Benadryl",
  "Claritin",
  "Zyrtec",
  "Prilosec",
  "Nexium",
  "Prevacid",
  "Lipitor",
  "Zocor",
  "Crestor",
  "Prozac",
  "Zoloft",
  "Lexapro",
  "Xanax",
  "Valium",
  "Ambien",
  "Synthroid",
  "Glucophage",
  "Lasix",
  "Norvasc",
  "Toprol",
  "Cozaar",
  "Diovan",
  "Zestril",
  "Prinivil",
];

// Function to search medicines (case-insensitive, partial match)
export const searchMedicines = (query: string): string[] => {
  if (!query || query.trim() === "") return [];
  
  const lowerQuery = query.toLowerCase().trim();
  return commonMedicineNames.filter((name) =>
    name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
};

// Function to check if a medicine name is valid (exact match, case-insensitive)
export const isValidMedicineName = (name: string): boolean => {
  if (!name || name.trim() === "") return false;
  
  const trimmedName = name.trim();
  return commonMedicineNames.some(
    (validName) => validName.toLowerCase() === trimmedName.toLowerCase()
  );
};

