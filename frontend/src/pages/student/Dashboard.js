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
      const response = await fetch('http://localhost:5001/api/user/dashboard', {
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
      console.error('Student Dashboard error:', err);
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

  const { student, roomDetails, currentMonthFee, pendingFeesCount, pendingComplaintsCount, pendingLeavesCount, recentNotices, recentComplaints, recentLeaves } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {student?.name}</p>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 rounded-md p-3 text-white text-2xl">
                  🏠
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Room</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {roomDetails?.roomNumber || 'Not Assigned'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-500 rounded-md p-3 text-white text-2xl">
                  💰
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Fee Status</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {currentMonthFee?.status === 'paid' ? 'Paid' : 'Pending'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-500 rounded-md p-3 text-white text-2xl">
                  📝
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Fees</dt>
                  <dd className="text-lg font-medium text-gray-900">{pendingFeesCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-500 rounded-md p-3 text-white text-2xl">
                  📢
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Complaints</dt>
                  <dd className="text-lg font-medium text-gray-900">{pendingComplaintsCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-orange-500 rounded-md p-3 text-white text-2xl">
                  🏖️
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Leaves</dt>
                  <dd className="text-lg font-medium text-gray-900">{pendingLeavesCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Details and Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Details */}
        {roomDetails && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Room Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Room Number:</span>
                  <span className="text-sm text-gray-900">{roomDetails.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <span className="text-sm text-gray-900">{roomDetails.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Floor:</span>
                  <span className="text-sm text-gray-900">{roomDetails.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Block:</span>
                  <span className="text-sm text-gray-900">{roomDetails.block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Occupants:</span>
                  <span className="text-sm text-gray-900">
                    {roomDetails.occupants?.length || 0} / {roomDetails.capacity}
                  </span>
                </div>
              </div>

              {roomDetails.occupants && roomDetails.occupants.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Roommates</h4>
                  <ul className="space-y-1">
                    {roomDetails.occupants
                      .filter(occupant => occupant._id !== student._id)
                      .map((roommate, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {roommate.name} • {roommate.phone}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Notices */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Notices</h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentNotices?.map((notice, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          notice.priority === 'high' ? 'bg-red-500' : 
                          notice.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {notice.category.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notice.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{notice.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                {(!recentNotices || recentNotices.length === 0) && (
                  <li className="py-4">
                    <p className="text-sm text-gray-500 text-center">No recent notices</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leave Applications */}
      {recentLeaves && recentLeaves.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Leave Applications</h3>
            <ul className="space-y-3">
              {recentLeaves.map((leave) => (
                <li key={leave._id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.status}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {leave.destination} • {new Date(leave.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Current Month Fee */}
      {currentMonthFee && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Month Fee</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Amount:</span>
                <p className="text-lg font-medium text-gray-900">₹{currentMonthFee.amount}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <p className="text-lg">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentMonthFee.status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : currentMonthFee.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentMonthFee.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Due Date:</span>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(currentMonthFee.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
