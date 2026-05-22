import React, { useState, useMemo, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import ReportPage from './components/ReportPage';
import { generateSeries } from './utils/dataProcessing';
import { Sample } from './types';
import { Printer, ChevronLeft, ChevronRight, FileSpreadsheet, ZoomIn, ZoomOut, RotateCcw, Edit3, Image, Type, Upload, ArrowLeftRight, Type as TypeIcon, Download, Loader2 } from 'lucide-react';

// --- GENERATION MODAL COMPONENT ---
const GenerationModal = ({
  isOpen,
  current,
  total,
  status
}: {
  isOpen: boolean;
  current: number;
  total: number;
  status: string;
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-blue-600 p-4 flex items-center gap-3 shadow-md">
          <Loader2 className="text-white animate-spin" size={24} />
          <h3 className="text-white font-bold text-lg tracking-wide">Generating Batch PDF</h3>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner border border-slate-200">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

          <h4 className="text-2xl font-bold text-slate-800 mb-2 font-mono">
            Page {current} <span className="text-slate-400 text-lg">/ {total}</span>
          </h4>
          <p className="text-slate-500 text-sm animate-pulse font-medium">{status}</p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">Please do not close this window.</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [samples, setSamples] = useState<Sample[]>(() => {
    try {
      const saved = localStorage.getItem('cbc_samples');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [fileName, setFileName] = useState<string>(() => {
    return localStorage.getItem('cbc_fileName') || "";
  });

  const [activeSeriesType, setActiveSeriesType] = useState<string>(() => {
    return localStorage.getItem('cbc_activeSeriesType') || "";
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('cbc_currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem('cbc_zoom');
    return saved ? parseFloat(saved) : 0.85;
  });

  const [viewState, setViewState] = useState<'UPLOAD' | 'PREVIEW' | 'REPORT'>(() => {
    const saved = localStorage.getItem('cbc_viewState');
    return (saved as 'UPLOAD' | 'PREVIEW' | 'REPORT') || 'UPLOAD';
  });

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genCurrent, setGenCurrent] = useState(0);
  const [genTotal, setGenTotal] = useState(0);
  const [genStatus, setGenStatus] = useState("");

  // GLOBAL REPORT STATE
  const [globalDate, setGlobalDate] = useState<string>(() => {
    return localStorage.getItem('cbc_globalDate') || "";
  });

  const [customHeaders, setCustomHeaders] = useState(() => {
    try {
      const saved = localStorage.getItem('cbc_customHeaders');
      return saved ? JSON.parse(saved) : { mainHeader: "Main", compHeader: "Comparison" };
    } catch {
      return { mainHeader: "Main", compHeader: "Comparison" };
    }
  });

  // NEW: Custom Text for Badges (overrides IDs)
  const [customBadges, setCustomBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('cbc_customBadges');
      return saved ? JSON.parse(saved) : { left: "", right: "" };
    } catch {
      return { left: "", right: "" };
    }
  });

  // NEW STATE FOR LOGO, FONTS, AND POSITIONING
  const [logoSrc, setLogoSrc] = useState<string | null>(() => {
    return localStorage.getItem('cbc_logoSrc') || "/src-logo-main.png";
  });

  const [logoWidth, setLogoWidth] = useState<number>(() => {
    const saved = localStorage.getItem('cbc_logoWidth');
    return saved ? parseInt(saved, 10) : 120;
  });

  const [dateFontSize, setDateFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('cbc_dateFontSize');
    return saved ? parseInt(saved, 10) : 14;
  });

  const [dateXPosition, setDateXPosition] = useState<number>(() => {
    const saved = localStorage.getItem('cbc_dateXPosition');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Sync to localStorage Effects
  useEffect(() => {
    try {
      localStorage.setItem('cbc_samples', JSON.stringify(samples));
    } catch (e) {
      console.warn("Failed to save samples to localStorage", e);
    }
  }, [samples]);

  useEffect(() => {
    localStorage.setItem('cbc_fileName', fileName);
  }, [fileName]);

  useEffect(() => {
    localStorage.setItem('cbc_activeSeriesType', activeSeriesType);
  }, [activeSeriesType]);

  useEffect(() => {
    localStorage.setItem('cbc_currentIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('cbc_zoom', zoom.toString());
  }, [zoom]);

  useEffect(() => {
    localStorage.setItem('cbc_viewState', viewState);
  }, [viewState]);

  useEffect(() => {
    localStorage.setItem('cbc_globalDate', globalDate);
  }, [globalDate]);

  useEffect(() => {
    try {
      localStorage.setItem('cbc_customHeaders', JSON.stringify(customHeaders));
    } catch (e) {
      console.warn("Failed to save customHeaders to localStorage", e);
    }
  }, [customHeaders]);

  useEffect(() => {
    try {
      localStorage.setItem('cbc_customBadges', JSON.stringify(customBadges));
    } catch (e) {
      console.warn("Failed to save customBadges to localStorage", e);
    }
  }, [customBadges]);

  useEffect(() => {
    if (logoSrc) {
      try {
        localStorage.setItem('cbc_logoSrc', logoSrc);
      } catch (e) {
        console.warn("Failed to save logoSrc to localStorage (likely size quota exceeded)", e);
      }
    } else {
      localStorage.removeItem('cbc_logoSrc');
    }
  }, [logoSrc]);

  useEffect(() => {
    localStorage.setItem('cbc_logoWidth', logoWidth.toString());
  }, [logoWidth]);

  useEffect(() => {
    localStorage.setItem('cbc_dateFontSize', dateFontSize.toString());
  }, [dateFontSize]);

  useEffect(() => {
    localStorage.setItem('cbc_dateXPosition', dateXPosition.toString());
  }, [dateXPosition]);

  // Prevent browser default drop behavior globally to avoid navigating away
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  // handleNewUpload helper to reset state completely
  const handleNewUpload = () => {
    setSamples([]);
    setFileName("");
    setActiveSeriesType("");
    setCurrentIndex(0);
    setViewState('UPLOAD');
    setCustomBadges({ left: "", right: "" });

    // Clear localStorage
    localStorage.removeItem('cbc_samples');
    localStorage.removeItem('cbc_fileName');
    localStorage.removeItem('cbc_activeSeriesType');
    localStorage.removeItem('cbc_currentIndex');
    localStorage.removeItem('cbc_viewState');
    localStorage.removeItem('cbc_customBadges');
  };

  // Computed series based on uploaded samples
  const allSeries = useMemo(() => generateSeries(samples), [samples]);

  // Dynamically calculate distinct series types found in the data
  const distinctSeriesTypes = useMemo(() => {
    const types = new Set(allSeries.map(s => s.seriesType));
    // Sort numerically if valid numbers, otherwise alphabetical
    return Array.from(types).sort((a, b) => {
      const strA = String(a);
      const strB = String(b);
      const numA = parseInt(strA, 10);
      const numB = parseInt(strB, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return strA.localeCompare(strB);
    });
  }, [allSeries]);

  // Ensure activeSeriesType is always valid if types change
  useEffect(() => {
    if (distinctSeriesTypes.length > 0 && !distinctSeriesTypes.includes(activeSeriesType)) {
      setActiveSeriesType(distinctSeriesTypes[0]);
    } else if (distinctSeriesTypes.length === 0) {
      setActiveSeriesType("");
    }
  }, [distinctSeriesTypes, activeSeriesType]);

  // Filter series based on active tab
  const activeSeriesList = useMemo(() =>
    allSeries.filter(s => s.seriesType === activeSeriesType),
    [allSeries, activeSeriesType]);

  // Safe current index to prevent out-of-bounds access
  const safeCurrentIndex = activeSeriesList.length > 0
    ? Math.min(Math.max(0, currentIndex), activeSeriesList.length - 1)
    : 0;

  // The active report to display
  const currentReport = activeSeriesList[safeCurrentIndex];

  // Prevent resetting page index to 0 on initial mount
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentIndex(0);
  }, [activeSeriesType]);

  // Keyboard navigation for paging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewState !== 'REPORT' || activeSeriesList.length === 0) return;
      
      // Ignore keypresses if the user is typing in an input or textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => {
          const safePrev = Math.min(Math.max(0, prev), activeSeriesList.length - 1);
          return Math.max(0, safePrev - 1);
        });
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => {
          const safePrev = Math.min(Math.max(0, prev), activeSeriesList.length - 1);
          return Math.min(activeSeriesList.length - 1, safePrev + 1);
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, activeSeriesList]);

  const handleDataLoaded = (data: Sample[], name: string) => {
    setSamples(data);
    setFileName(name);
    // Auto-select first available series
    const generated = generateSeries(data);
    const types = Array.from(new Set(generated.map(s => s.seriesType))).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    if (types.length > 0) {
      setActiveSeriesType(types[0]);
    }
    setViewState('PREVIEW'); // Go to intermediate "File Ready" state
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!currentReport) return;
    const element = document.getElementById('active-report-node');
    if (!element) return;

    // Using html2pdf from window global (loaded via CDN)
    if ((window as any).html2pdf) {
      const opt = {
        margin: 0,
        filename: `${fileName}_${currentReport.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      (window as any).html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF generator not loaded. Please try Print > Save as PDF.");
    }
  };

  const handleBatchDownload = async () => {
    const container = document.getElementById('batch-report-container');
    if (!container) return;

    // Select all pages inside the batch container
    const reportElements = container.querySelectorAll('.batch-page-wrapper');
    if (reportElements.length === 0) return;

    setIsGenerating(true);
    setGenTotal(reportElements.length);
    setGenCurrent(0);
    setGenStatus("Initializing PDF Engine...");

    // Force a small delay to ensure DOM is ready and state updates
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      // @ts-ignore
      const html2canvas = window.html2canvas;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const total = reportElements.length;
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;

      for (let i = 0; i < total; i++) {
        setGenCurrent(i + 1);
        setGenStatus(`Capturing Report ${i + 1}...`);

        const element = reportElements[i] as HTMLElement;

        // Render each page individually with high quality
        const canvas = await html2canvas(element, {
          scale: 2, // 2x scale for crisp text
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: element.offsetWidth,
          height: element.offsetHeight,
          windowWidth: 1200
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          doc.addPage();
        }

        // Add image to PDF - exact A4 fit
        doc.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

        // CRITICAL: Yield to main thread to allow UI/Modal update
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      setGenStatus("Finalizing PDF file...");
      await new Promise(resolve => setTimeout(resolve, 200));
      doc.save(`${fileName}_Series-${activeSeriesType}_Batch.pdf`);

    } catch (e) {
      console.error("Batch PDF Generation Error", e);
      alert("Error generating PDF. Please check console or try Browser Print.");
    } finally {
      // Short delay before closing so user sees 100%
      setTimeout(() => {
        setIsGenerating(false);
        setGenStatus("");
        setGenCurrent(0);
      }, 1000);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 1.5));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setLogoSrc(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Helper to determine display label based on detected ID formats in that series
  const getSeriesLabel = (type: string) => {
    const rep = allSeries.find(s => s.seriesType === type);
    // If the representative sample uses SRC format, use new labelling
    if (rep && rep.comparisonSample.id.match(/^SRC/i)) {
      return `P(x) vs SRC${type}-P(x)`;
    }
    // Fallback/Legacy labeling
    return `P(x) vs P(x)-${type}`;
  };

  // -- RENDER: UPLOAD SCREEN --
  if (viewState === 'UPLOAD' || samples.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center">
        <header className="w-full p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm px-6">
          <img src="/src-logo-main.png" alt="SRC Logo" className="h-10 object-contain" />
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <h1 className="text-xl font-bold tracking-wider text-slate-800">SRC CBC</h1>
        </header>
        <div className="flex-1 w-full flex flex-col justify-center">
          <FileUpload onDataLoaded={handleDataLoaded} />
        </div>
      </div>
    );
  }

  // -- RENDER: DATA PREVIEW / READY SCREEN --
  if (viewState === 'PREVIEW') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <header className="w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img src="/src-logo-main.png" alt="SRC Logo" className="h-8 object-contain" />
            <div className="h-5 w-px bg-slate-200 mx-1"></div>
            <span className="text-slate-800 font-semibold text-sm">SRC CBC</span>
          </div>
          <button
            onClick={handleNewUpload}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            New Upload
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white text-slate-900 rounded-xl p-8 max-w-2xl w-full shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileSpreadsheet size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">{fileName}</h2>
            <p className="text-slate-500 mb-8">File processed successfully. Ready for report generation.</p>

            {/* Dynamic Series Statistics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {distinctSeriesTypes.length > 0 ? distinctSeriesTypes.map(type => {
                const count = allSeries.filter(s => s.seriesType === type).length;
                return (
                  <div key={type} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="block text-xs uppercase text-slate-400 font-bold tracking-wider">
                      Series {type} Pairs
                    </span>
                    <span className="block text-3xl font-bold text-slate-800 mt-1">{count}</span>
                    <span className="text-xs text-slate-500">Pairs identified</span>
                  </div>
                );
              }) : (
                <div className="col-span-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                  No paired samples found.<br />
                  <span className="text-xs text-yellow-600">Ensure IDs follow format "P(x)" or "P-(x)" and "SRC(y)-P(x)" or "P(x)-(y)".</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewState('REPORT')}
              disabled={distinctSeriesTypes.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              Generate Report <ChevronRight size={20} />
            </button>

            <div className="mt-4 text-xs text-slate-400">
              {samples.length} total rows parsed.
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -- RENDER: REPORT VIEW (INTERACTIVE & BATCH PRINT) --

  return (
    <>
      {/* 1. INTERACTIVE SCREEN (Hidden during print) */}
      <div className="h-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden print:hidden">

        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 flex flex-col shrink-0 z-50 shadow-sm">
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
            {/* LEFT: SOURCE & NEW UPLOAD */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <FileSpreadsheet size={18} className="text-blue-600" />
                <span className="text-xs font-mono text-slate-500">Source:</span>
                <span className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{fileName}</span>
              </div>
              <button
                onClick={handleNewUpload}
                className="px-3 py-1 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-700 border border-slate-200 transition-colors uppercase tracking-wide"
              >
                New Upload
              </button>
            </div>

            {/* CENTER: DYNAMIC SERIES TABS */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto max-w-[40vw] scrollbar-thin">
              {distinctSeriesTypes.map(type => {
                const count = allSeries.filter(s => s.seriesType === type).length;
                const isActive = activeSeriesType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveSeriesType(type)}
                    className={`
                                px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap
                                ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}
                            `}
                  >
                    <span>{getSeriesLabel(type)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
              {distinctSeriesTypes.length === 0 && (
                <span className="text-slate-500 text-xs px-2 italic">No Series detected</span>
              )}
            </div>

            {/* RIGHT: PREVIEW ACTIONS */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 mr-2">
                <button onClick={() => handleZoom(-0.1)} className="p-2 text-slate-500 hover:text-slate-800"><ZoomOut size={16} /></button>
                <span className="text-xs w-8 text-center font-mono text-slate-700">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-2 text-slate-500 hover:text-slate-800"><ZoomIn size={16} /></button>
              </div>

              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded font-medium text-xs hover:bg-slate-200 transition-colors border border-slate-200"
                title="Download current page as PDF"
              >
                <Download size={14} /> Current PDF
              </button>

              {/* Primary Action: Download Batch */}
              <button
                onClick={handleBatchDownload}
                disabled={isGenerating || activeSeriesList.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait min-w-[180px] justify-center"
                title="Download entire series as a single PDF"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isGenerating ? 'Generating...' : 'Download Batch PDF'}
              </button>

              {/* Secondary Action: Browser Print */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-2 rounded font-medium text-xs hover:text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200"
                title="Use system print dialog (Backup)"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>

          {/* SUB-HEADER: CONTENT SETTINGS */}
          <div className="h-12 bg-slate-50 flex items-center px-4 gap-4 text-sm border-b border-slate-200 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-2 text-slate-700 shrink-0 min-w-[80px]">
              <Edit3 size={14} className="text-blue-600" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Content</span>
            </div>

            {/* DATE */}
            <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-200 shrink-0">
              <span className="text-slate-500 text-xs px-1">Date:</span>
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={globalDate}
                onChange={e => setGlobalDate(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 w-24 text-xs placeholder-slate-400 font-mono"
              />
            </div>

            <div className="h-4 w-px bg-slate-200 shrink-0"></div>

            {/* BADGES */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 text-xs">Badge Left:</span>
              <input
                type="text"
                value={customBadges.left}
                onChange={e => setCustomBadges({ ...customBadges, left: e.target.value })}
                placeholder="(Auto)"
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-20 outline-none focus:border-blue-500 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 text-xs">Badge Right:</span>
              <input
                type="text"
                value={customBadges.right}
                onChange={e => setCustomBadges({ ...customBadges, right: e.target.value })}
                placeholder="(Auto)"
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-20 outline-none focus:border-blue-500 placeholder-slate-400"
              />
            </div>

            <div className="h-4 w-px bg-slate-200 shrink-0"></div>

            {/* HEADERS */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 text-xs">Main Col:</span>
              <input
                type="text"
                value={customHeaders.mainHeader}
                onChange={e => setCustomHeaders({ ...customHeaders, mainHeader: e.target.value })}
                placeholder="e.g. 1 Normal"
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-28 outline-none focus:border-blue-500 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 text-xs">Comp Col:</span>
              <input
                type="text"
                value={customHeaders.compHeader}
                onChange={e => setCustomHeaders({ ...customHeaders, compHeader: e.target.value })}
                placeholder="e.g. 1-3 Solvent"
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-28 outline-none focus:border-blue-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* SUB-HEADER: LAYOUT SETTINGS */}
          <div className="h-12 bg-slate-50 flex items-center px-4 gap-4 text-sm border-b border-slate-200 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-2 text-slate-700 shrink-0 min-w-[80px]">
              <Image size={14} className="text-blue-600" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Layout</span>
            </div>

            {/* LOGO */}
            <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-200 shrink-0">
              <span className="text-slate-500 text-xs px-1">Logo:</span>
              <label className="cursor-pointer bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded text-[10px] text-slate-700 flex items-center gap-1 transition-colors">
                <Upload size={10} /> {logoSrc ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              {logoSrc && (
                <>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <Image size={12} className="text-slate-500" />
                  <div className="flex items-center bg-slate-100 rounded px-1 border border-slate-200 h-5">
                    <input
                      type="number"
                      min="20"
                      max="500"
                      value={logoWidth}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        setLogoWidth(isNaN(val) ? 120 : val);
                      }}
                      className="w-8 bg-transparent text-xs text-slate-800 text-center outline-none [&::-webkit-inner-spin-button]:appearance-none"
                      title="Logo Width (px)"
                    />
                    <span className="text-[10px] text-slate-500 select-none">px</span>
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 shrink-0"></div>

            {/* DATE POSITIONING */}
            <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-200 shrink-0">
              <span className="text-slate-500 text-xs px-1">Date Pos:</span>
              <ArrowLeftRight size={12} className="text-slate-500" />
              <div className="flex items-center bg-slate-100 rounded px-1 border border-slate-200 h-5">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={dateXPosition}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setDateXPosition(isNaN(val) ? 0 : val);
                  }}
                  className="w-8 bg-transparent text-xs text-slate-800 text-center outline-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="Right Margin (px)"
                />
                <span className="text-[10px] text-slate-500 select-none">px</span>
              </div>

              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <TypeIcon size={12} className="text-slate-500" />
              <input
                type="number"
                value={dateFontSize}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setDateFontSize(isNaN(val) ? 14 : val);
                }}
                className="bg-transparent text-xs text-slate-800 w-10 text-center outline-none"
                title="Date Font Size"
              />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT: REPORT & PAGINATION */}
        <main className="flex-1 overflow-hidden flex relative bg-slate-100">

          {/* PREV BUTTON */}
          <button
            disabled={safeCurrentIndex === 0}
            onClick={() => setCurrentIndex(safeCurrentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white hover:bg-blue-600 text-slate-700 hover:text-white rounded-full shadow-lg disabled:opacity-0 transition-all backdrop-blur-sm border border-slate-200"
          >
            <ChevronLeft size={24} />
          </button>

          {/* REPORT AREA */}
          <div className="flex-1 overflow-auto flex justify-center p-8 custom-scrollbar">
            {activeSeriesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 mt-20">
                <RotateCcw size={48} className="mb-4 opacity-20" />
                <p>No data found for this series</p>
              </div>
            ) : (
              <div
                className="relative flex justify-center"
                style={{
                  width: `${210 * zoom}mm`,
                  height: `${297 * zoom}mm`,
                  minWidth: `${210 * zoom}mm`,
                  minHeight: `${297 * zoom}mm`
                }}
              >
                <div
                  className="print-layout-wrapper transition-transform duration-200 ease-out absolute top-0 left-1/2"
                  style={{
                    transform: `translateX(-50%) scale(${zoom})`,
                    transformOrigin: 'top center',
                    width: '210mm',
                    height: '297mm'
                  }}
                >
                  <ReportPage
                    id="active-report-node" // ID for PDF targeting
                    series={currentReport}
                    globalDate={globalDate}
                    customHeaders={customHeaders}
                    customBadges={customBadges}
                    logoSrc={logoSrc}
                    logoWidth={logoWidth}
                    dateFontSize={dateFontSize}
                    dateXPosition={dateXPosition}
                    className="shadow-xl border border-slate-200/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NEXT BUTTON */}
          <button
            disabled={activeSeriesList.length === 0 || safeCurrentIndex >= activeSeriesList.length - 1}
            onClick={() => setCurrentIndex(safeCurrentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white hover:bg-blue-600 text-slate-700 hover:text-white rounded-full shadow-lg disabled:opacity-0 transition-all backdrop-blur-sm border border-slate-200"
          >
            <ChevronRight size={24} />
          </button>

          {/* BOTTOM PAGINATION INDICATOR */}
          {activeSeriesList.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-700 px-4 py-1.5 rounded-full text-xs font-mono border border-slate-200 backdrop-blur shadow-md flex items-center gap-3 select-none">
              <button
                disabled={safeCurrentIndex === 0}
                onClick={() => setCurrentIndex(safeCurrentIndex - 1)}
                className="hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed px-1 transition-colors flex items-center justify-center"
                title="Previous Report (Left Arrow)"
              >
                <ChevronLeft size={16} />
              </button>
              <span>Report {safeCurrentIndex + 1} of {activeSeriesList.length}</span>
              <button
                disabled={safeCurrentIndex >= activeSeriesList.length - 1}
                onClick={() => setCurrentIndex(safeCurrentIndex + 1)}
                className="hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed px-1 transition-colors flex items-center justify-center"
                title="Next Report (Right Arrow)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* 2. BATCH CONTAINER (Off-screen for PDF generation, Visible during Print) */}
      <div
        id="batch-report-container"
        className="fixed left-[-10000px] top-0 print:static print:left-0 print:block bg-white w-[210mm]"
      >
        {activeSeriesList.map((series, index) => (
          <div key={series.id} className="batch-page-wrapper bg-white">
            <ReportPage
              series={series}
              globalDate={globalDate}
              customHeaders={customHeaders}
              customBadges={customBadges}
              logoSrc={logoSrc}
              logoWidth={logoWidth}
              dateFontSize={dateFontSize}
              dateXPosition={dateXPosition}
              className="shadow-none m-0 p-0 border-0"
            />
          </div>
        ))}
      </div>

      {/* 3. GENERATION POPUP MODAL */}
      <GenerationModal
        isOpen={isGenerating}
        current={genCurrent}
        total={genTotal}
        status={genStatus}
      />
    </>
  );
}

export default App;