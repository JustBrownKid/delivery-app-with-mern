import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OtpVerifyForm = ({ email, onBack , token }) => {
  const [otpDigits, setOtpDigits] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [alert, setAlert] = useState(null);

  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const otpCode = otpDigits.join('');

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = val;
    setOtpDigits(newOtp);

    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpDigits.some(digit => digit.trim() === '')) {
      setAlert({ type: 'error', message: 'Please enter all 6 digits of the OTP' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await axios.post('http://localhost:5000/api/users/verify-otp', {
        email,
        otpCode,  // Make sure this matches backend key
      });

      setAlert({ type: 'success', message: res.data.message });
      if (token) {
        localStorage.setItem('token', token);
      }
      setTimeout(() => {
        
        navigate('/home'); 
        
      }, 1000);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'OTP verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      setAlert({ type: 'error', message: `Please wait ${resendCooldown} seconds before resending OTP.` });
      return;
    }

    setResendLoading(true);
    setAlert(null);

    try {
      const res = await axios.post('http://localhost:5000/api/users/resend-otp', { email });

      setAlert({ type: 'success', message: res.data.message });
      setOtpDigits(new Array(6).fill(''));
      inputsRef.current[0]?.focus();
      setResendCooldown(300); // 5 minutes cooldown
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to resend OTP',
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto mt-6 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify OTP</h2>
        <p className="text-gray-600 text-sm mb-2">
          Enter the OTP sent to <strong>{email}</strong>
        </p>

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
              type="button"
              onClick={() => setAlert(null)}
              className="ml-4 text-lg font-bold leading-none focus:outline-none"
              aria-label="Dismiss alert"
            >
              &times;
            </button>
          </div>
        )}

        <div className="flex justify-between space-x-2">
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputsRef.current[idx] = el)}
              className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || resendCooldown > 0}
          className={`w-full mt-2 font-semibold py-2 rounded-md transition duration-200 ${
            resendLoading
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {resendLoading
            ? 'Resending...'
            : resendCooldown > 0
            ? `Resend OTP (${resendCooldown}s)`
            : 'Resend OTP'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full mt-2 font-semibold py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition duration-200"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default OtpVerifyForm;
