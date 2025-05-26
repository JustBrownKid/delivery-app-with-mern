import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import OtpVerifyForm from './components/OtpVerifyForm';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const [otpEmail, setOtpEmail] = useState(null);
  const [token, setToken] = useState(null);

  // Reset OTP email state to restart login flow
  const clearOtpEmail = () => setOtpEmail(null);

  return (
    <Router>
      <Routes>
        <Route path="/"
         element={
          <PublicRoute>
         <LoginForm onOtpSent={setOtpEmail} token={setToken} />
         </PublicRoute>
        }
         />

        <Route
          path="/verify-otp"
          element={
            otpEmail ? (
              <OtpVerifyForm email={otpEmail} token={token} onBack={clearOtpEmail} onVerified={clearOtpEmail} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
