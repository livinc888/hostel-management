import React, { useState, useEffect } from 'react';
import { adminAPI, attendanceAPI } from '../../services/api';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching students for attendance...");
      const response = await adminAPI.getStudents();
      console.log("Students response:", response.data);
      
      // Handle both response formats: { students: [...] } or [...]
      const studentsData = response.data.students || response.data || [];
      setStudents(studentsData);
      
      // Initialize attendance as array of objects
      const initialAttendance = studentsData.map(student => ({
        studentId: student._id,
        status: "present"
      }));
      setAttendance(initialAttendance);
      console.log("Initial attendance initialized:", initialAttendance);
      
    } catch (err) {
      console.error('Students fetch error:', err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      console.log("Fetching attendance for date:", selectedDate);
      const response = await attendanceAPI.getAttendance({ date: selectedDate });
      console.log("Attendance response:", response.data);
      
      // Convert fetched attendance to array format
      if (response.data.attendance && response.data.attendance.length > 0) {
        const attendanceArray = response.data.attendance.map(record => ({
          studentId: record.studentId._id,
          status: record.status
        }));
        setAttendance(attendanceArray);
        console.log("Attendance loaded from backend:", attendanceArray);
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      // If no attendance exists for this date, keep the initialized array
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev =>
      prev.map(item =>
        item.studentId === studentId
          ? { ...item, status }
          : item
      )
    );
    console.log("Attendance updated for student:", studentId, "status:", status);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Ensure attendance is not empty and has proper structure
      if (!attendance || attendance.length === 0) {
        setError('No attendance data to save');
        return;
      }
      
      // Prepare attendance records with date
      const attendanceRecords = attendance.map(item => ({
        studentId: item.studentId,
        date: selectedDate,
        status: item.status
      }));
      
      console.log("Saving attendance records:", attendanceRecords);
      
      // Validate payload before sending
      if (attendanceRecords.length === 0) {
        setError('No valid attendance records to save');
        return;
      }
      
      await attendanceAPI.markAttendance({
        attendanceRecords: attendanceRecords
      });
      
      alert('Attendance saved successfully!');
      console.log("Attendance saved successfully");
      
    } catch (err) {
      console.error('Save attendance error:', err);
      setError('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(item => item.status === 'present').length;
    const absent = attendance.filter(item => item.status === 'absent').length;
    
    return { total, present, absent };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Mark and track student attendance</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Total Students</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-800">Present</p>
          <p className="text-2xl font-bold text-green-900">{stats.present}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-red-800">Absent</p>
          <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">Attendance Rate</p>
          <p className="text-2xl font-bold text-yellow-900">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mark Attendance - {new Date(selectedDate).toLocaleDateString()}
          </h3>
          
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.roomId ? student.roomId.roomNumber : 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={attendance.find(item => item.studentId === student._id)?.status || 'present'}
                          onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${getStatusColor(attendance.find(item => item.studentId === student._id)?.status || 'present')}`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
