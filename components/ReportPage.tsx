import React from 'react';
import { ReportSeries, PARAMETERS } from '../types';
import { Activity } from 'lucide-react';

interface ReportPageProps {
  series: ReportSeries;
  globalDate: string;
  customHeaders: {
      mainHeader: string;
      compHeader: string;
  };
  customBadges: {
      left: string;
      right: string;
  };
  logoSrc: string | null;
  logoWidth: number;
  dateFontSize: number;
  dateXPosition: number;
  id?: string; // NEW: Allow ID for PDF targeting
  className?: string; // Allow overrides
}

// Fallback Logo if none uploaded
const SRCLogo = () => (
  <svg viewBox="0 0 200 80" className="w-full h-full text-slate-900 fill-current">
    <path d="M40 20 C 20 20, 10 30, 10 40 C 10 50, 20 50, 25 50 C 35 50, 35 60, 25 60 C 15 60, 10 50, 5 55 C 5 70, 20 80, 40 80 C 60 80, 70 70, 70 60 C 70 50, 60 50, 55 50 C 45 50, 45 40, 55 40 C 65 40, 70 50, 75 45 C 75 30, 60 20, 40 20 Z" />
    <path d="M85 20 L 85 80 L 100 80 L 100 60 L 115 80 L 135 80 L 115 55 C 130 50, 135 30, 115 20 Z M 100 35 L 110 35 C 115 35, 115 45, 110 45 L 100 45 Z" />
    <path d="M145 50 C 145 30, 160 20, 175 20 C 185 20, 195 25, 195 35 L 180 35 C 180 32, 178 30, 175 30 C 165 30, 160 40, 160 50 C 160 60, 165 70, 175 70 C 178 70, 180 68, 180 65 L 195 65 C 195 75, 185 80, 175 80 C 160 80, 145 70, 145 50 Z" />
  </svg>
);

const cleanId = (id: string) => {
    // Strips the leading 'P' or 'p' and optional hyphen from the ID.
    // e.g. P102 -> 102, P-102 -> 102
    return id.replace(/^P-?/i, '');
};

const ReportPage: React.FC<ReportPageProps> = ({ 
    series, 
    globalDate, 
    customHeaders, 
    customBadges,
    logoSrc, 
    logoWidth,
    dateFontSize,
    dateXPosition,
    id,
    className = ""
}) => {
  // Guard and clamp styling inputs to prevent layout breaks
  const safeLogoWidth = Math.max(20, Math.min(logoWidth || 120, 500));
  const safeDateFontSize = Math.max(8, Math.min(dateFontSize || 14, 32));
  const safeDateXPosition = Math.max(0, Math.min(dateXPosition || 0, 200));

  // Determine Badge Text: Prefer Global Custom Text > Cleaned Sample ID
  const displayMainBadge = customBadges.left ? customBadges.left : cleanId(series.mainSample.id);
  const displayCompBadge = customBadges.right ? customBadges.right : cleanId(series.comparisonSample.id);

  return (
    // Explicit A4 Dimensions (210mm x 297mm) enforced here for both screen and print consistency
    <div 
        id={id}
        className={`printable-page bg-white text-slate-900 mx-auto flex flex-col box-border relative overflow-hidden ${className}`}
        style={{ width: '210mm', height: '297mm' }}
    >
      {/* 
        Padding Logic:
        - 10mm Standard padding
        - Left padding increased to 25mm for Hole Punching/Filing
      */}
      <div className="w-full h-full p-[10mm] pl-[25mm] flex flex-col relative">
        
        {/* Visual Guide line for filing margin (Screen only) */}
        <div className="absolute left-[12mm] top-0 bottom-0 w-px border-l border-dashed border-slate-300 print:hidden opacity-50 pointer-events-none" title="Filing Punch Line"></div>

        {/* HEADER SECTION */}
        <header className="flex justify-between items-start border-b-2 border-slate-800 pb-2 mb-4 min-h-[100px]">
            {/* Left: Title and Badges */}
            <div className="flex flex-col pt-2 w-[60%]">
                <div className="flex items-center gap-2 mb-3">
                    <Activity size={24} className="text-blue-900" />
                    <h1 className="text-xl font-bold tracking-widest text-blue-900 uppercase font-sans">SRC CBC</h1>
                </div>
                
                {/* Comparison Badges - Controlled by Settings Bar */}
                <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md text-lg text-center min-w-[3.5rem] tracking-tight print:bg-slate-100 print:text-slate-500">
                        {displayMainBadge}
                    </div>
                    
                    <span className="text-sm text-slate-400 font-serif italic">vs</span>
                    
                    <div className="font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md text-lg text-center min-w-[3.5rem] tracking-tight print:bg-blue-50 print:text-blue-600">
                         {displayCompBadge}
                    </div>
                </div>
            </div>
            
            {/* Right: Date and Logo */}
            <div className="flex flex-col items-end gap-1 w-[40%]">
                {/* Date Row - Moved to top right with X Position Control */}
                <div 
                    className="flex items-baseline gap-2 mb-4 justify-end relative"
                    style={{ marginRight: `${safeDateXPosition}px` }} 
                >
                    <label className="font-bold text-slate-900" style={{ fontSize: `${safeDateFontSize}px` }}>Date :</label>
                    <span className="font-mono text-slate-800" style={{ fontSize: `${safeDateFontSize}px` }}>
                        {globalDate || ""}
                    </span>
                </div>

                {/* Logo Row - Directly below Date */}
                <div 
                    className="mt-1 flex justify-end" 
                    style={{ width: '100%', marginRight: `${safeDateXPosition}px` }}
                >
                    {logoSrc ? (
                        <img 
                            src={logoSrc} 
                            alt="Logo" 
                            style={{ width: `${safeLogoWidth}px`, maxHeight: '55px', height: 'auto' }} 
                            className="object-contain"
                        />
                    ) : (
                        <div style={{ width: `${safeLogoWidth}px`, height: '50px' }}>
                            <SRCLogo />
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* TABLE SECTION - Bordered Card Style */}
        <div className="mb-2">
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full border-collapse table-fixed">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="py-2 px-4 w-[24%] text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                        Parameter
                    </th>
                    <th className="py-1.5 px-4 w-[38%] border-r border-slate-200 relative group">
                        {/* Editable Main Header - Directly from Props */}
                        <div className="w-full bg-transparent font-bold text-sm text-slate-500 break-words">
                            {customHeaders.mainHeader}
                        </div>
                    </th>
                    <th className="py-1.5 px-4 w-[38%] relative group">
                         {/* Editable Comp Header - Directly from Props */}
                         <div className="w-full bg-transparent font-bold text-sm text-blue-600 break-words">
                            {customHeaders.compHeader}
                        </div>
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {PARAMETERS.map((param, index) => {
                    const mainVal = series.mainSample.data[param.key];
                    const compVal = series.comparisonSample.data[param.key];
                    
                    return (
                    <tr key={param.key} className="hover:bg-slate-50/50 transition-colors">
                        {/* Parameter Name */}
                        <td className="py-1 px-4 border-r border-slate-100">
                            <div className="font-bold text-slate-700 text-sm leading-tight">{param.key}</div>
                        </td>
                        
                        {/* Main Value */}
                        <td className="py-1 px-4 border-r border-slate-100 font-mono text-sm text-slate-600">
                            {mainVal !== undefined ? mainVal : '-'}
                        </td>
                        
                        {/* Comparison Value */}
                        <td className="py-1 px-4 font-mono text-sm font-bold text-blue-700">
                            {compVal !== undefined ? compVal : '-'}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>

        {/* TARGETED STATUS INDICATORS (RBC, HGB, LYMPH#) */}
        <div className="mb-2 mt-4">
             <div className="grid grid-cols-3 gap-4">
                 {['RBC', 'HGB', 'LYMPH#'].map(targetKey => {
                     const mainVal = series.mainSample.data[targetKey];
                     const compVal = series.comparisonSample.data[targetKey];
                     
                     let status = "NORMAL";
                     let colorClass = "bg-green-50 text-green-800 border-green-200";
                     let labelColor = "text-green-900";
                     
                     if (mainVal !== undefined && compVal !== undefined && mainVal !== 0) {
                         const percentChange = ((compVal - mainVal) / mainVal) * 100;
                         if (percentChange >= 20) {
                             status = "HIGH";
                             colorClass = "bg-red-50 text-red-800 border-red-200";
                             labelColor = "text-red-900";
                         } else if (percentChange <= -20) {
                             status = "LOW";
                             colorClass = "bg-red-50 text-red-800 border-red-200";
                             labelColor = "text-red-900";
                         }
                     } else if (mainVal === undefined || compVal === undefined || mainVal === 0) {
                        status = "N/A";
                        colorClass = "bg-slate-50 text-slate-400 border-slate-200";
                        labelColor = "text-slate-500";
                     }

                     return (
                         <div key={targetKey} className={`border rounded-lg p-3 text-center flex flex-col items-center justify-center ${colorClass}`}>
                             <div className={`text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 ${labelColor}`}>{targetKey}</div>
                             <div className={`text-xl font-black tracking-wide ${labelColor}`}>{status}</div>
                         </div>
                     );
                 })}
             </div>
        </div>

        {/* FOOTER - Moved close to table */}
        <footer className="mt-auto pt-4 flex justify-between items-end border-t border-slate-100">
            <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">SRC CBC</span>
            </div>
            <div>
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group {cleanId(series.mainSample.id)}</span>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default ReportPage;