import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [upiSummary, setUpiSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://parse-point.vercel.app/pdf/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { transactions, upi_summary } = response.data;
      setTransactions(transactions);
      setUpiSummary(upi_summary);
    } catch (err) {
      setError('Failed to process the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  const renderPieChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8884d8' : '#82ca9d'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">UPI Transaction Analyzer</h1>
      <div className="mb-4">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : 'Upload PDF'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Transactions</h2>
          <table className="min-w-full table-auto border-collapse border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Particulars</th>
                <th className="border border-gray-300 px-4 py-2">Withdrawal</th>
                <th className="border border-gray-300 px-4 py-2">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={index}
                  onClick={() => handleTransactionClick(transaction)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="border border-gray-300 px-4 py-2">{transaction.Date}</td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.Particulars}</td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.Withdrawal}</td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.Deposit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {upiSummary.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">UPI Summary</h2>
          <table className="min-w-full table-auto border-collapse border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">UPI ID</th>
                <th className="border border-gray-300 px-4 py-2">Total Debited</th>
                <th className="border border-gray-300 px-4 py-2">Total Credited</th>
              </tr>
            </thead>
            <tbody>
              {upiSummary.map((summary, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{summary.UPI}</td>
                  <td className="border border-gray-300 px-4 py-2">{summary.total_debited}</td>
                  <td className="border border-gray-300 px-4 py-2">{summary.total_credited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-2">Transaction Details</h3>
            <p><strong>Date:</strong> {selectedTransaction.Date}</p>
            <p><strong>Particulars:</strong> {selectedTransaction.Particulars}</p>
            <p><strong>Withdrawal:</strong> {selectedTransaction.Withdrawal}</p>
            <p><strong>Deposit:</strong> {selectedTransaction.Deposit}</p>
            <button
              onClick={handleCloseModal}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {upiSummary.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Charts</h2>
          <div className="mb-4">
            <h3 className="font-semibold">UPI Debits vs Credits</h3>
            {renderPieChart(upiSummary.map((summary) => ({
              name: summary.UPI,
              value: summary.total_debited - summary.total_credited,
            })))}
          </div>
          <div>
            <h3 className="font-semibold">Total Debited vs Credited</h3>
            {renderBarChart([
              { name: 'Debited', total: upiSummary.reduce((acc, curr) => acc + curr.total_debited, 0) },
              { name: 'Credited', total: upiSummary.reduce((acc, curr) => acc + curr.total_credited, 0) },
            ])}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
