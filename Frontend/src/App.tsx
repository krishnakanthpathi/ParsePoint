import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { UploadCloud, X, ArrowUpCircle, ArrowDownCircle, Banknote, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Transaction = string;

interface UpiSummaryItem {
  UPI: string;
  total_debited: number;
  total_credited: number;
  transactions: Transaction[];
}

interface ApiResponse {
  upi_summary: UpiSummaryItem[];
  overall_totals: {
    total_debited: number;
    total_credited: number;
  };
}

// --- REUSABLE UI COMPONENTS ---

const StatCard = ({ title, value, icon, colorClass = 'text-gray-500' }: { title: string; value: string; icon: React.ReactNode; colorClass?: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700 flex items-center space-x-4 transition-transform transform hover:scale-105">
    <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('500', '100')} dark:${colorClass.replace('text-', 'bg-').replace('500', '900/50')}`}>
      {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
        className: `h-8 w-8 ${colorClass}`.trim()
      })}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

const TransactionModal = ({ upiItem, onClose }: { upiItem: UpiSummaryItem; onClose: () => void; }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all animate-slide-up">
      <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 break-all">Transactions for <span className="text-teal-600 dark:text-teal-400">{upiItem.UPI}</span></h3>
        <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
          <X size={24} />
        </button>
      </div>
      <div className="flex space-x-4 mb-4 text-center">
         <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-500 dark:text-red-400">Total Debited</p>
            <p className="font-bold text-lg text-red-700 dark:text-red-300">₹{upiItem.total_debited.toLocaleString()}</p>
         </div>
         <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-500 dark:text-green-400">Total Credited</p>
            <p className="font-bold text-lg text-green-700 dark:text-green-300">₹{upiItem.total_credited.toLocaleString()}</p>
         </div>
      </div>
      <div className="overflow-y-auto flex-grow pr-2">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Transaction List:</h4>
        <ul className="space-y-2">
          {upiItem.transactions.map((tx, idx) => (
            <li key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tx}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);


// --- MAIN APP COMPONENT ---

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [upiSummary, setUpiSummary] = useState<UpiSummaryItem[]>([]);
  const [overallTotals, setOverallTotals] = useState<{ total_debited: number; total_credited: number; } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUPI, setSelectedUPI] = useState<UpiSummaryItem | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
      if(selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setUpiSummary([]);
    setOverallTotals(null);
    setCurrentPage(1);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<ApiResponse>(
        "https://parse-point.vercel.app/pdf/extract_upi_summary",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUpiSummary(response.data.upi_summary);
      setOverallTotals(response.data.overall_totals);
    } catch (err) {
      setError("Failed to process the PDF. Please check the file and try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination logic for UPI Summary table
  const sortedUpiSummary = useMemo(() => 
    [...upiSummary].sort((a, b) => (b.total_credited + b.total_debited) - (a.total_credited + a.total_debited)),
    [upiSummary]
  );
  const totalPages = Math.ceil(sortedUpiSummary.length / ITEMS_PER_PAGE);
  const paginatedUpiSummary = sortedUpiSummary.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };
  
  const PIE_COLORS = ["#0D9488", "#2DD4BF", "#5EEAD4", "#99F6E4", "#CCFBF1"];
  const BAR_COLORS = { debited: "#F87171", credited: "#4ADE80" };
  const TOP_N_FOR_PIE = 5;
  const SAMPLE_SIZE = 20;

  const randomSampleData = useMemo(() => 
    [...upiSummary].sort(() => 0.5 - Math.random()).slice(0, SAMPLE_SIZE),
    [upiSummary]
  );

  const pieChartData = useMemo(() => 
    [...randomSampleData]
      .map(u => ({ name: u.UPI, value: u.total_debited + u.total_credited }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_N_FOR_PIE),
    [randomSampleData]
  );
  
  const barChartData = useMemo(() => 
    [...randomSampleData].sort((a, b) => (b.total_credited + b.total_debited) - (a.total_credited + a.total_debited)),
    [randomSampleData]
  );

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number}) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const chartTooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    color: isDarkMode ? '#E5E7EB' : '#1F2937'
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 flex items-center">
            <Banknote className="mr-2" />ParsePoint
          </h1>
          <button onClick={() => setIsDarkMode(prev => !prev)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Your Bank Statement</h2>
            <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 dark:hover:border-teal-400 dark:hover:bg-gray-700/50 transition-all"
                onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                <input type="file" id="fileInput" accept=".pdf" onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <UploadCloud size={48} className="mb-2 text-gray-400" />
                    {fileName ? ( <p><span className="font-semibold text-teal-600 dark:text-teal-400">{fileName}</span> selected.</p> ) : ( <p><span className="font-semibold text-teal-600 dark:text-teal-400">Click to upload</span> or drag and drop</p> )}
                    <p className="text-xs mt-1">PDF file only</p>
                </div>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            <button
                onClick={handleUpload}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                disabled={!file || loading}
            >
                {loading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</> ) : "Analyze Statement"}
            </button>
        </div>

        {loading && <p className="text-center text-gray-500 dark:text-gray-400">Analyzing your document...</p>}
        
        {upiSummary.length > 0 && overallTotals ? (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Total Credited" value={`₹${overallTotals.total_credited.toLocaleString()}`} icon={<ArrowUpCircle />} colorClass="text-green-500" />
              <StatCard title="Total Debited" value={`₹${overallTotals.total_debited.toLocaleString()}`} icon={<ArrowDownCircle />} colorClass="text-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700">
                <h3 className="font-semibold mb-4 text-center text-gray-900 dark:text-white">Top 5 Contacts (from Sample)</h3>
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={renderCustomizedLabel}>
                        {pieChartData.map((_, idx) => <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} contentStyle={chartTooltipStyle} itemStyle={{ color: chartTooltipStyle.color }}/>
                    <Legend wrapperStyle={{ color: chartTooltipStyle.color }} />
                </PieChart>
                </ResponsiveContainer>
              </div>

              {/* --- MODIFIED BAR CHART SECTION --- */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Transaction Volume (Sample)</h2>
                {/* Increased container height and chart bottom margin to accommodate rotated labels */}
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                      data={barChartData} 
                      margin={{ top: 5, right: 20, left: -10, bottom: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#4B5563" : "#E5E7EB"} vertical={false} />
                        <XAxis 
                          dataKey="UPI" 
                          interval={0}
                          angle={-45} // Rotated labels
                          textAnchor="end" // Anchored text to the end
                          tick={{ fill: isDarkMode ? '#D1D5DB' : '#374151', fontSize: 10 }} 
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${Number(value)/1000}k`} 
                          tick={{ fill: isDarkMode ? '#D1D5DB' : '#374151' }} 
                        />
                        <Tooltip 
                          formatter={(value: number) => `₹${value.toLocaleString()}`} 
                          contentStyle={chartTooltipStyle} 
                          itemStyle={{ color: chartTooltipStyle.color }}
                        />
                        <Legend wrapperStyle={{ color: chartTooltipStyle.color }} />
                        {/* Added stackId to stack bars and radius to the top bar */}
                        <Bar dataKey="total_debited" stackId="a" fill={BAR_COLORS.debited} name="Debited" />
                        <Bar dataKey="total_credited" stackId="a" fill={BAR_COLORS.credited} name="Credited" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
              {/* --- END OF MODIFIED SECTION --- */}

            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Full UPI Breakdown</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">UPI ID</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400 text-right">Debited</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400 text-right">Credited</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedUpiSummary.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedUPI(item)}>
                                <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 break-all">{item.UPI}</td>
                                <td className="py-3 px-4 text-red-500 dark:text-red-400 text-right font-mono">₹{item.total_debited.toLocaleString()}</td>
                                <td className="py-3 px-4 text-green-500 dark:text-green-400 text-right font-mono">₹{item.total_credited.toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft size={16} className="mr-1" /> Previous
                        </button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          !loading && <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Welcome to ParsePoint!</h2>
            <p>Upload your UPI statement to see your personalized dashboard.</p>
          </div>
        )}
      </main>

      {selectedUPI && <TransactionModal upiItem={selectedUPI} onClose={() => setSelectedUPI(null)} />}
    </div>
  );
};

export default App;