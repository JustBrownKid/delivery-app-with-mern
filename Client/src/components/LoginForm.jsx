// LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = ({ onOtpSent ,token }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', form, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Save token if backend returns it at login (optional)
      if (res.data.token) {
        token(res.data.token);
      }

      // Notify parent with email to start OTP verification flow
      onOtpSent(form.email);

      navigate('/verify-otp'); // Or just let parent render OTP form, based on your routing
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Login failed',
      });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800">Login</h2>

        {alert && (
          <div
            className={`p-3 rounded-md text-sm font-medium ${
              alert.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            } flex justify-between items-center`}
            role="alert"
          >
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="ml-4 text-lg font-bold leading-none focus:outline-none"
              aria-label="Dismiss alert"
              type="button"
            >
              &times;
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
