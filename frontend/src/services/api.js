import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hostel-management-p5dk.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudents: (params) => api.get('/admin/students', { params }),
  createStudent: (studentData) => api.post('/admin/students', studentData),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, studentData) => api.put(`/admin/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
};

export const roomAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  assignRoom: (data) => api.post('/rooms/assign', data),
  removeStudentFromRoom: (data) => api.post('/rooms/remove-student', data),
};

export const feeAPI = {
  getFees: (params) => api.get('/fees', { params }),
  createFee: (feeData) => api.post('/fees', feeData),
  payFee: (paymentData) => api.post('/fees/pay', paymentData),
  getFeeHistory: (studentId, params) => api.get(`/fees/history/${studentId}`, { params }),
  generateMonthlyFees: (data) => api.post('/fees/generate-monthly', data),
};

export const complaintAPI = {
  getComplaints: (params) => api.get('/complaints', { params }),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
  getComplaintStats: () => api.get('/complaints/stats'),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
  createComplaint: (data) => api.post('/user/complaints', data),
  getStudentComplaints: (params) => api.get('/user/complaints', { params }),
};

export const attendanceAPI = {
  getAttendance: (params) => api.get('/attendance', { params }),
  markAttendance: (data) => api.post('/attendance', data),
  getAttendanceReport: (params) => api.get('/attendance/report', { params }),
};

export const noticeAPI = {
  getNotices: (params) => api.get('/notices', { params }),
  createNotice: (data) => api.post('/notices', data),
  updateNotice: (id, data) => api.put(`/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/notices/${id}`),
  getActiveNotices: () => api.get('/notices/active'),
  getStudentNotices: (params) => api.get('/user/notices', { params }),
};

export const leaveAPI = {
  getLeaves: (params) => api.get('/leaves', { params }),
  updateLeaveStatus: (id, data) => api.put(`/leaves/${id}`, data),
  getLeaveStats: () => api.get('/leaves/stats'),
  createLeave: (data) => api.post('/user/leave', data),
  getStudentLeaves: (params) => api.get('/user/leave', { params }),
};

export const reportAPI = {
  getFeeReport: (params) => api.get('/reports/fees', { params }),
  getOccupancyReport: () => api.get('/reports/occupancy'),
  getComplaintReport: (params) => api.get('/reports/complaints', { params }),
  getStudentReport: () => api.get('/reports/students'),
};

export const studentAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getRoomDetails: () => api.get('/user/room'),
  getFees: (params) => api.get('/user/fees', { params }),
};

export default api;
