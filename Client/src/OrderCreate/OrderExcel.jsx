import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const OrderExcel = () => {
  const [fileName, setFileName] = useState('');
  const [orders, setOrders] = useState([]);
  const [shipperId, setShipperId] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file) => {
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Attach shipperId to each order
      const updatedOrders = jsonData.map((order) => ({
        ...order,
        shipper_id: shipperId,
      }));

      setOrders(updatedOrders);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e) => {
    handleFileUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemoveFile = () => {
    setFileName('');
    setOrders([]);
  };

  const handleSubmit = async () => {
    const validOrders = orders.filter(
      (order) =>
        order.customer_name &&
        order.customer_phone &&
        order.customer_address &&
        order.delivery_date &&
        order.state_id &&
        order.city_id &&
        order.shipper_id &&
        order.status &&
        order.total_amount
    );

    if (validOrders.length === 0) {
      alert('No valid orders to submit. Please check your data.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/orders', validOrders, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Success:', response.data);
      alert('Orders created successfully!');

      // Reset
      setFileName('');
      setOrders([]);
      setShipperId('');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const totalAmount = orders.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h1 className="text-xl font-semibold mb-4">Enter Shipper ID</h1>
        <input
          type="text"
          value={shipperId}
          placeholder="Enter Shipper ID"
          onChange={(e) => setShipperId(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-4 text-center">Import Order File</h2>

        {!fileName ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed p-8 rounded-lg text-center ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <p className="text-lg font-medium text-gray-700 mb-2">Drag & Drop Excel file here</p>
            <p className="text-sm text-gray-500 mb-4">or click to select a file</p>
            <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
              Select File
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-md border flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700">{fileName}</p>
              <p className="text-sm text-gray-500">{orders.length} rows imported</p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 border border-red-300 rounded hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        )}

        {totalAmount > 0 && (
          <div className="mt-4 text-right text-lg font-semibold text-gray-700">
            Total Amount: <span className="text-blue-600">{totalAmount} MMK</span>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border text-center">
        <button
          onClick={handleSubmit}
          className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded"
        >
          Create Orders
        </button>
      </div>
    </div>
  );
};

export default OrderExcel;
