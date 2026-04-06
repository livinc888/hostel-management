import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://hostel-management-p5dk.onrender.com/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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

  if (!dashboardData) return null;

  const stats = [
    { label: 'Total Students', value: dashboardData.totalStudents, color: 'bg-blue-500', icon: '👥' },
    { label: 'Available Rooms', value: dashboardData.availableRooms, color: 'bg-green-500', icon: '🏠' },
    { label: 'Occupied Rooms', value: dashboardData.occupiedRooms, color: 'bg-yellow-500', icon: '🔒' },
    { label: 'Pending Fees', value: dashboardData.pendingFees, color: 'bg-red-500', icon: '💰' },
    { label: 'Complaints', value: dashboardData.complaintsCount, color: 'bg-purple-500', icon: '📝' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of hostel management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3 text-white text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Students and Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Students</h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardData.recentStudents?.map((student, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {student.phone}
                      </div>
                    </div>
                  </li>
                ))}
                {(!dashboardData.recentStudents || dashboardData.recentStudents.length === 0) && (
                  <li className="py-4">
                    <p className="text-sm text-gray-500 text-center">No recent students</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pending Complaints</h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardData.recentComplaints?.map((complaint, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{complaint.title}</p>
                        <p className="text-sm text-gray-500">
                          {complaint.studentId?.name} • {complaint.category}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
                {(!dashboardData.recentComplaints || dashboardData.recentComplaints.length === 0) && (
                  <li className="py-4">
                    <p className="text-sm text-gray-500 text-center">No pending complaints</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
