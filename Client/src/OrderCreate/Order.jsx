import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderForm = () => {
  // States
  const [shipperId, setShipperId] = useState('');
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    stateId: '',
    cityId: '',
    payment: '',
    status: 'Pending',
    cod: '',
  });

  // Fetch states and cities on mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const [statesRes, citiesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/states'),
          axios.get('http://localhost:5000/api/cities'),
        ]);
        setStates(statesRes.data);
        setCities(citiesRes.data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    }
    fetchLocations();
  }, []);

  // Filter cities based on selected state
  useEffect(() => {
    if (!form.stateId) {
      setFilteredCities([]);
      setForm(prev => ({ ...prev, cityId: '' }));
      return;
    }
    const filtered = cities.filter(
      city => city.state_id?._id === form.stateId && city.status === true
    );
    setFilteredCities(filtered);
    if (!filtered.find(city => city._id === form.cityId)) {
      setForm(prev => ({ ...prev, cityId: '' }));
    }
  }, [form.stateId, cities]);

  // Search shipper by ID
  const handleSearchShipper = async () => {
    if (!shipperId.trim()) return alert('Please enter a Shipper ID');
    try {
      const res = await axios.get(`http://localhost:5000/api/shipper/${shipperId.trim()}`);
      if (res.data) {
        setSelectedShipper(res.data);
        setShipperId('');
      } else {
        alert('Shipper not found');
      }
    } catch (error) {
      console.error('Error fetching shipper:', error);
      alert('Failed to fetch shipper');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'deliveryDate') {
      setDeliveryDate(value);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      stateId: '',
      cityId: '',
      payment: '',
      status: 'Pending',
      cod: '',
    });
    setEditIndex(null);
  };

  const validateForm = () => {
    if (!selectedShipper) return false;
    if (editIndex === null && !deliveryDate) return false;
    return (
      form.customerName.trim() &&
      form.customerPhone.trim() &&
      form.customerAddress.trim() &&
      form.stateId &&
      form.cityId &&
      form.payment !== ''
    );
  };

  const handleSaveOrder = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }

    const codValue = parseFloat(form.cod) || 0;
    const selectedCity = filteredCities.find(city => city._id === form.cityId);
    const cityFee = selectedCity ? parseFloat(selectedCity.fee) || 0 : 0;
    const totalAmount = form.payment === '1' ? codValue + cityFee : codValue;

    const orderData = {
      shipper_id: selectedShipper._id,
      delivery_date: deliveryDate,
      customer_name: form.customerName.trim(),
      customer_phone: form.customerPhone.trim(),
      customer_address: form.customerAddress.trim(),
      state_id: form.stateId,
      city_id: form.cityId,
      payment: form.payment,
      status: form.status,
      cod: codValue,
      total_amount: totalAmount,
      city_name: selectedCity ? selectedCity.name : '',
      shipper_phone: selectedShipper.phone,
      shipper_name: selectedShipper.name || '',
      shipper_address: selectedShipper.address || '',
    };

    if (editIndex !== null) {
      const updatedOrders = [...orders];
      updatedOrders[editIndex] = orderData;
      setOrders(updatedOrders);
    } else {
      setOrders(prev => [...prev, orderData]);
    }

    resetForm();
  };

  const handleEditOrder = index => {
    const order = orders[index];
    setForm({
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      stateId: order.state_id,
      cityId: order.city_id,
      payment: order.payment,
      status: order.status,
      cod: order.cod ? order.cod.toString() : '',
    });
    setDeliveryDate(order.delivery_date || '');
    setEditIndex(index);
  };

  const handleDeleteOrder = index => {
    setOrders(prev => prev.filter((_, i) => i !== index));
    if (editIndex === index) resetForm();
  };

  const handleSubmitAll = async () => {
    if (orders.length === 0) return alert('No orders to submit.');
    try {
      await axios.post('http://localhost:5000/api/orders', orders);
      alert('Orders submitted successfully!');
      setOrders([]);
      resetForm();
      setDeliveryDate('');
      setSelectedShipper(null);
    } catch (error) {
      console.error('Error submitting orders:', error);
      alert('Failed to submit orders.');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const currentOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Order Management</h2>

      {/* Shipper Selection (always visible) */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        {selectedShipper ? (
          <div>
            <h3 className="font-bold mb-2">Selected Shipper:</h3>
            <p><strong>ID:</strong> {selectedShipper._id}</p>
            <p><strong>Name:</strong> {selectedShipper.name || 'N/A'}</p>
            <p><strong>Phone:</strong> {selectedShipper.phone}</p>
            <p><strong>Address:</strong> {selectedShipper.address || 'N/A'}</p>
            <button
              onClick={() => {
                setSelectedShipper(null);
                setOrders([]);
                resetForm();
                setDeliveryDate('');
              }}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Change Shipper
            </button>
          </div>
        ) : (
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">Enter Shipper ID:</label>
              <input
                type="text"
                value={shipperId}
                onChange={e => setShipperId(e.target.value)}
                className="border px-4 py-2 rounded w-full"
                placeholder="Shipper ID"
              />
            </div>
            <button
              onClick={handleSearchShipper}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search Shipper
            </button>
          </div>
        )}
      </div>
{/* Orders Table (only shown if there are orders) */}
          {orders.length > 0 && (
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded">
                  <thead className="bg-gray-200 text-left">
                    <tr>
                      <th className="p-2 border-b">Customer Name</th>
                      <th className="p-2 border-b">Phone</th>
                      <th className="p-2 border-b">City</th>
                      <th className="p-2 border-b">COD</th>
                      <th className="p-2 border-b">Total Amount</th>
                      <th className="p-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{order.customer_name}</td>
                        <td className="p-2">{order.customer_phone}</td>
                        <td className="p-2">{order.city_name}</td>
                        <td className="p-2">{order.cod.toFixed(2)}</td>
                        <td className="p-2">{order.total_amount.toFixed(2)}</td>
                        <td className="p-2 space-x-2">
                          <button
                            onClick={() => handleEditOrder((currentPage - 1) * ordersPerPage + idx)}
                            className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOrder((currentPage - 1) * ordersPerPage + idx)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages).keys()].map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum + 1)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === pageNum + 1 ? 'bg-blue-500 text-white' : ''
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
      {/* Only show the rest if shipper is selected */}
      {selectedShipper && (
        <>
          {/* Delivery Date */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Delivery Date:</label>
            <input
              type="date"
              name="deliveryDate"
              value={deliveryDate}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
              required
            />
          </div>

          {/* Order Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              name="customerName"
              placeholder="Customer Name"
              value={form.customerName}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
              required
            />
            <input
              type="tel"
              name="customerPhone"
              placeholder="Customer Phone"
              value={form.customerPhone}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
              required
            />
            <input
              type="text"
              name="customerAddress"
              placeholder="Customer Address"
              value={form.customerAddress}
              onChange={handleChange}
              className="border px-4 py-2 rounded md:col-span-2"
              required
            />

            <select
              name="stateId"
              value={form.stateId}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state._id} value={state._id}>
                  {state.name}
                </option>
              ))}
            </select>

            <select
              name="cityId"
              value={form.cityId}
              onChange={handleChange}
              disabled={!form.stateId || filteredCities.length === 0}
              className="border px-4 py-2 rounded"
              required
            >
              <option value="">Select City</option>
              {filteredCities.map(city => (
                <option key={city._id} value={city._id}>
                  {city.name} (Fee: {city.fee || 0})
                </option>
              ))}
            </select>

           <div className="flex items-center space-x-4">
  <label className="inline-flex items-center">
    <input
      type="radio"
      name="payment"
      value="0"
      checked={form.payment === "0"}
      onChange={handleChange}
      className="form-radio h-5 w-5 text-blue-600"
      required
    />
    <span className="ml-2">Pay By Shipper</span>
  </label>
  <label className="inline-flex items-center">
    <input
      type="radio"
      name="payment"
      value="1"
      checked={form.payment === "1"}
      onChange={handleChange}
      className="form-radio h-5 w-5 text-blue-600"
    />
    <span className="ml-2">Pay By Customer</span>
  </label>
</div>
            <input
              type="number"
              name="cod"
              placeholder="COD (Cash on Delivery)"
              value={form.cod}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
            />
          </div>

          {/* Form Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleSaveOrder}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={!validateForm()}
            >
              {editIndex !== null ? 'Update Order' : 'Add Order'}
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-400 text-black px-6 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>

          

          {/* Submit All Button */}
          <div className="text-center">
            <button
              onClick={handleSubmitAll}
              disabled={orders.length === 0}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Submit All Orders ({orders.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderForm;