import React, { useCallback, useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseExcelData } from '../utils/dataProcessing';
import { Sample } from '../types';

interface FileUploadProps {
  onDataLoaded: (samples: Sample[], fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const samples = await parseExcelData(file);
      // Artificial delay for better UX feel
      setTimeout(() => {
          onDataLoaded(samples, file.name);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse file.");
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xl">
          
          {/* HEADER */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
             <h2 className="text-slate-800 font-bold flex items-center gap-2">
                <UploadCloud size={20} className="text-blue-600"/>
                Upload Dataset
             </h2>
             <span className="text-xs text-slate-500">Support for Excel (.xlsx, .xls), CSV, TSV, or ODS</span>
          </div>

          {/* DROP ZONE */}
          <div className="p-8">
            <div 
                className={`
                    relative border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'}
                    ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                <input 
                id="fileInput" 
                type="file" 
                accept=".xlsx, .xls, .csv, .tsv, .ods" 
                className="hidden" 
                onChange={handleInputChange}
                />
                
                <div className="flex flex-col items-center justify-center gap-4">
                <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110
                    ${loading ? 'bg-slate-100' : 'bg-blue-50 text-blue-600'}
                `}>
                    {loading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    ) : (
                        <FileSpreadsheet size={40} />
                    )}
                </div>
                
                {loading ? (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Processing...</h3>
                        <p className="text-slate-500 text-sm">Analyzing sample data structure</p>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Drop your file here</h3>
                        <p className="text-slate-500 text-sm">or click to browse from your computer</p>
                    </div>
                )}
                </div>
            </div>

            {error && (
                <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3 text-red-700 animate-fadeIn">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm">{error}</p>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default FileUpload;