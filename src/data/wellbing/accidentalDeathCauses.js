export const accidentalDeathCausesSource = {
  label: "CDC WISQARS Fatal Injury Data",
  url: "https://wisqars.cdc.gov/reports/",
  accessed: "2026-04-20",
  notes: "Mechanism-level fatal injury data source used for accidental/unintentional injury breakdowns.",
};

export const accidentalDeathCauses = [
  { name: "Motor vehicle crashes", percentage: 37.0, color: "#fb7185" },
  { name: "Drug overdose and poisoning", percentage: 29.0, color: "#38bdf8" },
  { name: "Falls", percentage: 21.0, color: "#f59e0b" },
  { name: "Suffocation", percentage: 6.0, color: "#2dd4bf" },
  { name: "Drowning", percentage: 3.5, color: "#8b5cf6" },
  { name: "Fire and smoke exposure", percentage: 1.5, color: "#f97316" },
  { name: "Others", percentage: 2.0, color: "#64748b" },
];
