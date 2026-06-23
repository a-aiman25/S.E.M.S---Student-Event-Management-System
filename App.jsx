import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import UniversityLogin from './pages/UniversityLogin';
import Register from './pages/Register';
import Events from './pages/Events';
import Booking from './pages/Booking';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ContactSuccess from './pages/ContactSuccess';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<UniversityLogin />} />  {/* Changed to UniversityLogin */}
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/contact-success" element={<ContactSuccess />} />
              <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
              <Route path="/user-dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
              <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;