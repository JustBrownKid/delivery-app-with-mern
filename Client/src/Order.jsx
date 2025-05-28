import React, { useState } from 'react';
import axios from 'axios';

// Sample Shippers Data
const shippersData = [
  { id: '68343919d592fc3fe584cfb0', name: 'John Doe', phone: '1234567890', address: '123 Main St' },
  { id: '10471', name: 'Jane Smith', phone: '9876543210', address: '456 Park Ave' },
  { id: '951106', name: 'Mike Johnson', phone: '5555555555', address: '789 Broadway' },
];

const OrderForm = () => {
  const [shipperId, setShipperId] = useState('');
  const [selectedShipper, setSelectedShipper] = useState(null);

  const [form, setForm] = useState({
    deliveryDate: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    stateId: '',
    cityId: '',
    status: 'Pending',
    totalAmount: '',
  });

  const [orders, setOrders] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Search shipper by ID
  const handleSearchShipper = () => {
    const found = shippersData.find((s) => s.id === shipperId.trim());
    if (found) setSelectedShipper(found);
    else {
      alert('Shipper not found');
      setSelectedShipper(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      deliveryDate: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      stateId: '',
      cityId: '',
      status: 'Pending',
      totalAmount: '',
    });
    setEditIndex(null);
  };

  // Save or update order in local state
  const handleSaveOrder = () => {
    if (!selectedShipper) {
      alert('Please select a shipper first.');
      return;
    }

    // Basic validation example
    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !form.customerAddress.trim() ||
      !form.stateId.trim() ||
      !form.cityId.trim() ||
      !form.totalAmount.trim()
    ) {
      alert('Please fill all required fields.');
      return;
    }

    const newOrder = {
      shipper_id: selectedShipper.id,
      delivery_date: form.deliveryDate || null,
      customer_name: form.customerName.trim(),
      customer_phone: form.customerPhone.trim(),
      customer_address: form.customerAddress.trim(),
      state_id: form.stateId.trim(),
      city_id: form.cityId.trim(),
      status: form.status,
      total_amount: parseFloat(form.totalAmount) || 0,
    };

    if (editIndex !== null) {
      const updatedOrders = [...orders];
      updatedOrders[editIndex] = newOrder;
      setOrders(updatedOrders);
    } else {
      setOrders((prev) => [...prev, newOrder]);
    }

    resetForm();
  };

  const handleEditOrder = (index) => {
    const order = orders[index];
    setForm({
      deliveryDate: order.delivery_date || '',
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      stateId: order.state_id,
      cityId: order.city_id,
      status: order.status,
      totalAmount: order.total_amount.toString(),
    });
    setEditIndex(index);
    // Set shipper id for editing (optional)
    setSelectedShipper(shippersData.find(s => s.id === orders[index].shipper_id) || null);
  };

  const handleDeleteOrder = (index) => {
    setOrders((prev) => prev.filter((_, i) => i !== index));
    // Adjust editIndex if deleting edited order
    if (editIndex !== null && editIndex === index) {
      resetForm();
    }
  };

  // Submit all orders to backend API
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post('http://localhost:5000/api/orders', orders, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

  // Pagination logic
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Order Management</h2>

      {/* Shipper Search */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Enter Shipper ID"
          value={shipperId}
          onChange={(e) => setShipperId(e.target.value)}
          className="border px-4 py-2 rounded w-1/3"
        />
        <button onClick={handleSearchShipper} className="bg-blue-600 text-white px-4 py-2 rounded">
          Search Shipper
        </button>
      </div>

      {/* Shipper Details */}
      {selectedShipper && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <p><strong>ID:</strong> {selectedShipper.id}</p>
          <p><strong>Name:</strong> {selectedShipper.name}</p>
          <p><strong>Phone:</strong> {selectedShipper.phone}</p>
          <p><strong>Address:</strong> {selectedShipper.address}</p>
        </div>
      )}

      {/* Order Form */}
      {selectedShipper && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="date"
            name="deliveryDate"
            value={form.deliveryDate}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            value={form.customerName}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="customerPhone"
            placeholder="Customer Phone"
            value={form.customerPhone}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="customerAddress"
            placeholder="Customer Address"
            value={form.customerAddress}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="stateId"
            placeholder="State ID"
            value={form.stateId}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="cityId"
            placeholder="City ID"
            value={form.cityId}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          >
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
          <input
            type="number"
            name="totalAmount"
            placeholder="Total Amount"
            value={form.totalAmount}
            onChange={handleInputChange}
            className="border rounded px-4 py-2"
          />
          <button
            onClick={handleSaveOrder}
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {editIndex !== null ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Orders List</h3>
          <ul className="space-y-2">
            {currentOrders.map((order, i) => {
              const index = indexOfFirst + i;
              return (
                <li key={index} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                  <div>
                    <p>
                      <strong>{index + 1}.</strong> {order.customer_name} | {order.customer_phone} | {order.status}
                    </p>
                    <p>{order.customer_address}</p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleEditOrder(index)} className="text-blue-500">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteOrder(index)} className="text-red-500">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="border px-3 py-1 rounded"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="border px-3 py-1 rounded"
              >
                Next
              </button>
            </div>
          )}

          {/* Submit All Orders Button */}
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Submit All Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
