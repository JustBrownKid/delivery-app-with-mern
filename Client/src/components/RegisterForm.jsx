import { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    state_id: '',
    city_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message: '' }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null); // clear previous alert
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', form);
      setAlert({ type: 'success', message: res.data.message });
      // Optionally reset form here:
      // setForm({ name: '', email: '', phone: '', password: '', state_id: '', city_id: '' });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4 mt-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Register</h2>

      {/* Alert Box */}
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
          >
            &times;
          </button>
        </div>
      )}

      {[
        { label: 'Name', name: 'name', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Phone', name: 'phone', type: 'text' },
        { label: 'Password', name: 'password', type: 'password' },
        { label: 'State ID', name: 'state_id', type: 'text' },
        { label: 'City ID', name: 'city_id', type: 'text' },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <input
            name={field.name}
            type={field.type}
            value={form[field.name]}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter ${field.label}`}
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
