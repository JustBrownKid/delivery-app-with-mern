import React from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { Link } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let username = 'User';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username || decoded.name || decoded.email || 'User';
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); 
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-3 bg-gray-800 text-white font-sans">
        <div className="font-bold text-2xl">Delivery System</div>
        <ul className="flex space-x-6 list-none m-0 p-0">
          <li className="cursor-pointer hover:text-gray-300">
  <Link to="/order">Create Order</Link>
</li>
          <li className="cursor-pointer hover:text-gray-300">
  <Link to="/excel">Create Excel</Link>
</li>
<li className="cursor-pointer hover:text-gray-300">
  <Link to="/orderhistory">Order History</Link>
</li>
<li className="cursor-pointer hover:text-gray-300">
  <Link to="/template">Order Template</Link>
</li>
          <li className="cursor-pointer hover:text-gray-300">Delivery Status</li>
        </ul>
        <div className="flex items-center space-x-3">
          <span>Welcome, {username}!</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 rounded px-4 py-2 text-white font-semibold cursor-pointer transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="p-6 font-sans">
        <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
        <p>You have successfully logged in and verified OTP.</p>
      </main>
    </div>
  );
};

export default Home;
