import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value.trim()
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const data = response.data;

      console.log("LOGIN RESPONSE:", data);

      // ✅ Save token + user safely
      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 🔥 STRONG ROLE CHECK (THIS FIXES YOUR ISSUE)
        const role = data.user.role?.toLowerCase();
        const isAdminFlag = data.user.isAdmin === true || data.user.isAdmin === 'true';

        const isAdmin = role === 'admin' || isAdminFlag;

        console.log("Role:", role);
        console.log("isAdmin flag:", isAdminFlag);
        console.log("FINAL isAdmin:", isAdmin);

        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }

      } else {
        setGeneralError(data.message || 'Login failed');
      }

    } catch (error) {
      console.error("Login error:", error);

      setGeneralError(
        error.response?.data?.message ||
        'Invalid credentials or server error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Hostel Management System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {generalError && (
              <div className="bg-red-100 text-red-600 p-3 rounded">
                {generalError}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.password && <p className="text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
          <p>Please log in with your account to continue.</p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-blue-600">
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;