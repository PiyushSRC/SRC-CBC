export interface HematologyData {
  [key: string]: number;
}

export interface Sample {
  id: string;
  date?: string; // e.g. "2023-10-27"
  data: HematologyData;
}

export interface ReportSeries {
  id: string; // Unique ID for the report pair
  seriesType: string; // Dynamic suffix (e.g. "3", "4", "105")
  mainSample: Sample;
  comparisonSample: Sample;
}

export interface ParameterConfig {
  key: string;
  label: string;
  unit: string;
}

// Full hematology panel based on standard analyzers (Sysmex/Mindray)
export const PARAMETERS: ParameterConfig[] = [
  { key: 'WBC', label: 'White Blood Cell Count', unit: '10^9/L' },
  { key: 'LYMPH#', label: 'Lymphocyte Count', unit: '10^9/L' },
  { key: 'MID#', label: 'Mid Cell Count', unit: '10^9/L' },
  { key: 'GRAN#', label: 'Granulocyte Count', unit: '10^9/L' },
  { key: 'LYMPH%', label: 'Lymphocyte %', unit: '%' },
  { key: 'MID%', label: 'Mid Cell %', unit: '%' },
  { key: 'GRAN%', label: 'Granulocyte %', unit: '%' },
  { key: 'HGB', label: 'Hemoglobin', unit: 'g/dL' },
  { key: 'RBC', label: 'Red Blood Cell Count', unit: '10^12/L' },
  { key: 'HCT', label: 'Hematocrit', unit: '%' },
  { key: 'MCV', label: 'Mean Corpuscular Volume', unit: 'fL' },
  { key: 'MCH', label: 'Mean Corpuscular Hemoglobin', unit: 'pg' },
  { key: 'MCHC', label: 'M.C.H. Concentration', unit: 'g/dL' },
  { key: 'RDW-CV', label: 'RBC Dist. Width CV', unit: '%' },
  { key: 'RDW-SD', label: 'RBC Dist. Width SD', unit: 'fL' },
  { key: 'PLT', label: 'Platelet Count', unit: '10^9/L' },
  { key: 'MPV', label: 'Mean Platelet Volume', unit: 'fL' },
  { key: 'PDW', label: 'Platelet Dist. Width', unit: '' },
  { key: 'PCT', label: 'Plateletcrit', unit: '%' },
];