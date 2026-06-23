// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set base URL for API
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        console.log("Loaded user from storage:", parsed);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password, userType) => {
    try {
      console.log("Login attempt:", { loginId, userType });
      
      // Convert frontend userType to backend expected values
      // 'student' -> 'user', 'admin' -> 'admin'
      const backendUserType = userType === 'student' ? 'user' : 'admin';
      
      const response = await axios.post('/api/login', { 
        email: loginId,
        password, 
        user_type: backendUserType 
      });
      
      console.log("Login response:", response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.is_admin) {
          toast.success(`Welcome Admin ${userData.first_name}!`);
        } else {
          toast.success(`Welcome ${userData.first_name}!`);
        }
        
        return { success: true, isAdmin: userData.is_admin };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register', userData);
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    registrationNumber: user?.registration_number || null,
    studentInfo: user ? {
      degree: user.degree,
      batchYear: user.batch_year,
      semester: user.semester,
      rollNumber: user.roll_number
    } : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};