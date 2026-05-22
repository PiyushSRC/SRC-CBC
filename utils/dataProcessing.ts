import * as XLSX from 'xlsx';
import { Sample, ReportSeries, PARAMETERS } from '../types';

export const parseExcelData = async (file: File): Promise<Sample[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
            reject(new Error("File appears to be empty or invalid format."));
            return;
        }

        let headerRowIndex = -1;
        let idIndex = -1;
        let headers: string[] = [];

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            const candidates = row.map(h => String(h !== null && h !== undefined ? h : '').trim());
            const idx = candidates.findIndex(h => /ID|Sample|Name/i.test(h));
            if (idx !== -1) {
                headerRowIndex = i;
                idIndex = idx;
                headers = candidates;
                break;
            }
        }
        
        if (headerRowIndex === -1 || idIndex === -1) {
            reject(new Error("Could not find a 'ID' or 'Sample' column."));
            return;
        }

        const paramIndices: Record<string, number> = {};
        
        // Robust header matching
        PARAMETERS.forEach(p => {
            // Exact match preferred, then partial match
            let idx = headers.findIndex(h => h.toUpperCase() === p.key);
            if (idx === -1) {
                // Try removing symbols for fuzzy match if exact match fails
                // e.g. "LYMPH#" in config matching "LYMPH" header
                idx = headers.findIndex(h => h.toUpperCase().includes(p.key));
            }
            if (idx !== -1) paramIndices[p.key] = idx;
        });

        const samples: Sample[] = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const id = String(row[idIndex] || '').trim();
            if (!id) continue;

            const sampleData: Record<string, number> = {};
            
            Object.entries(paramIndices).forEach(([key, idx]) => {
                const val = row[idx];
                // Handle cases where cell might be text with units or symbols
                let cleanVal = String(val).replace(/[^\d.-]/g, '');
                
                // Keep decimal points but handle potential parsing issues
                const num = parseFloat(cleanVal);
                if (!isNaN(num)) {
                    sampleData[key] = num;
                }
            });

            samples.push({
                id: id,
                date: new Date().toISOString().split('T')[0],
                data: sampleData
            });
        }
        resolve(samples);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

export const generateSeries = (samples: Sample[]): ReportSeries[] => {
  const series: ReportSeries[] = [];
  const sampleMap = new Map(samples.map(s => [s.id, s]));

  // Helper to find main sample with fuzzy ID matching (handles P102 vs P-102)
  const findMainSample = (rawId: string): Sample | undefined => {
      // 1. Direct Exact Match
      if (sampleMap.has(rawId)) return sampleMap.get(rawId);
      
      // 2. Try inserting hyphen (e.g. SRC extracts P102, but file has P-102)
      const pNumMatch = rawId.match(/^(P)(\d+)$/i);
      if (pNumMatch) {
          const hyphenated = `${pNumMatch[1]}-${pNumMatch[2]}`;
          if (sampleMap.has(hyphenated)) return sampleMap.get(hyphenated);
          
          const hyphenatedUpper = `${pNumMatch[1].toUpperCase()}-${pNumMatch[2]}`;
          if (sampleMap.has(hyphenatedUpper)) return sampleMap.get(hyphenatedUpper);
      }
      
      // 3. Try removing hyphen (e.g. P-102 -> P102)
      const pHyphenMatch = rawId.match(/^(P)-(\d+)$/i);
      if (pHyphenMatch) {
          const normalized = `${pHyphenMatch[1]}${pHyphenMatch[2]}`;
          if (sampleMap.has(normalized)) return sampleMap.get(normalized);
      }
      
      return undefined;
  };

  samples.forEach(compSample => {
    const id = compSample.id;
    let mainSample: Sample | undefined;
    let seriesType: string = "";

    // STRATEGY 1: NEW FORMAT (SRC{Series}-{MainID})
    // Example: SRC11-P102 -> Series "11", Main "P102" (links to P-102 via finder)
    const srcMatch = id.match(/^SRC([^-]+)-(.+)$/i);
    if (srcMatch) {
        const potentialSeries = srcMatch[1].trim();
        const potentialMainId = srcMatch[2].trim();
        
        mainSample = findMainSample(potentialMainId);
        if (mainSample) {
            seriesType = potentialSeries;
        }
    }

    // STRATEGY 2: OLD FORMAT ({MainID}-{Series})
    // Example: P1-3 -> Main "P1", Series "3"
    // Executed if Strategy 1 didn't yield a valid pair
    if (!mainSample) {
        const suffixMatch = id.match(/^(.+)-([^-]+)$/);
        if (suffixMatch) {
            const potentialMainId = suffixMatch[1].trim();
            const potentialSeries = suffixMatch[2].trim();

            mainSample = findMainSample(potentialMainId);
            if (mainSample) {
                seriesType = potentialSeries;
            }
        }
    }

    if (mainSample && seriesType) {
        series.push({
            id: compSample.id, // Use comparison ID as the unique ID for the pair
            seriesType: seriesType, 
            mainSample: mainSample,
            comparisonSample: compSample
        });
    }
  });

  return series;
};

export const generateInterpretation = (main: Sample, comp: Sample): string => {
  const decreases: string[] = [];
  const increases: string[] = [];
  
  // Track RDW specifically for anisocytosis logic
  let rdwChanged = false;

  PARAMETERS.forEach(param => {
      const v1 = main.data[param.key];
      const v2 = comp.data[param.key];
      
      if (v1 !== undefined && v2 !== undefined && v1 !== 0) {
          const diff = ((v2 - v1) / v1) * 100;
          
          // Specific Anisocytosis Check for RDW
          if (param.key.includes('RDW') && Math.abs(diff) > 10) {
              rdwChanged = true;
          }

          if (diff <= -10) {
              // Format: "White Blood Cell count (WBC)"
              decreases.push(`${param.label} (${param.key})`);
          } else if (diff >= 10) {
              increases.push(`${param.label} (${param.key})`);
          }
      }
  });

  const parts: string[] = [];

  if (decreases.length > 0) {
      const text = decreases.join(', ');
      // Replace last comma with 'and' if multiple
      const finalText = text.replace(/,([^,]*)$/, ' and$1');
      parts.push(`exhibits a decrease in ${finalText}`);
  }

  if (increases.length > 0) {
      const text = increases.join(', ');
      const finalText = text.replace(/,([^,]*)$/, ' and$1');
      parts.push(`shows an elevation in ${finalText}`);
  }

  let baseText = "";
  if (parts.length === 0) {
      baseText = `Compared to ${main.id} (Main), ${comp.id} demonstrates a stable hematological profile with no significant deviations (>10%) in key parameters.`;
  } else {
      baseText = `Compared to ${main.id} (Main), ${comp.id} ${parts.join(', and ')}.`;
  }

  // Append clinical note if RDW changed or other red cell indices are volatile
  if (rdwChanged) {
      baseText += " Red cell parameters also show evolving anisocytosis.";
  }

  return baseText;
};