import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import AdminStudents from './pages/admin/Students';
import AdminFees from './pages/admin/Fees';
import AdminComplaints from './pages/admin/Complaints';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeave from './pages/admin/Leave';
import AdminNotices from './pages/admin/Notices';
import AdminReports from './pages/admin/Reports';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentFees from './pages/student/Fees';
import StudentComplaints from './pages/student/Complaints';
import StudentRoom from './pages/student/Room';
import StudentLeave from './pages/student/Leave';
import StudentNotices from './pages/student/Notices';
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="leaves" element={<AdminLeave />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
            
            <Route path="/student/*" element={
              <ProtectedRoute requiredRole="student">
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="room" element={<StudentRoom />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="complaints" element={<StudentComplaints />} />
              <Route path="leave" element={<StudentLeave />} />
              <Route path="notices" element={<StudentNotices />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
