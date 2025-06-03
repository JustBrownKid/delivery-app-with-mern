import React, { useState } from 'react';
import axios from 'axios';

const OrderByShipper = () => {
  const [shipperId, setShipperId] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const fetchOrdersByShipper = async () => {
    if (!shipperId) {
      setError('Shipper ID is required');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/shipper/${shipperId}`);

      if (Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        setError('Invalid data format returned from the server.');
        setOrders([]);
      }
      setError(''); 
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    fetchOrdersByShipper();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Shipper ID"
          value={shipperId}
          onChange={(e) => setShipperId(e.target.value)}
        />
        <button type="submit">Find</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Order Count: {orders.length}</p>
      
      <ul>
        {/* Only map over orders if it's an array */}
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => (
            <li key={order._id}>{order.customer_name} - {order.total_amount}</li> // Adjust based on your actual data structure
          ))
        ) : (
          <li>No orders found</li>
        )}
      </ul>
    </div>
  );
};

export default OrderByShipper;
