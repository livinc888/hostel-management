import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';

const Reports = () => {
  const [reportData, setReportData] = useState({
    students: null,
    fees: null,
    occupancy: null,
    complaints: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reports in parallel
      const [studentsRes, feesRes, occupancyRes, complaintsRes] = await Promise.all([
        reportAPI.getStudentReport(),
        reportAPI.getFeeReport(),
        reportAPI.getOccupancyReport(),
        reportAPI.getComplaintReport()
      ]);

      setReportData({
        students: studentsRes.data,
        fees: feesRes.data,
        occupancy: occupancyRes.data,
        complaints: complaintsRes.data
      });
    } catch (err) {
      console.error('Fetch reports error:', err);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Real-time hostel management insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Real-time hostel management insights</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
          <button
            onClick={fetchAllReports}
            className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { students, fees, occupancy, complaints } = reportData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Real-time hostel management insights</p>
        </div>
        <button
          onClick={fetchAllReports}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Students Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {students?.totalStudents || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">{students?.studentsWithRoom || 0} with room</span>
              <span className="mx-2">•</span>
              <span className="text-orange-600">{students?.studentsWithoutRoom || 0} without room</span>
            </div>
            <div className="mt-1">
              <span className={`text-sm font-medium ${getPercentageColor(students?.accommodationRate || 0)}`}>
                {students?.accommodationRate?.toFixed(1) || 0}% accommodation rate
              </span>
            </div>
          </div>
        </div>

        {/* Fees Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Fees</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(fees?.feeStats?.reduce((total, stat) => total + stat.totalAmount, 0))}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">{formatCurrency(fees?.feeStats?.find(s => s._id === 'paid')?.totalAmount || 0)} paid</span>
              <span className="mx-2">•</span>
              <span className="text-red-600">{formatCurrency(fees?.feeStats?.find(s => s._id === 'pending')?.totalAmount || 0)} pending</span>
            </div>
            <div className="mt-1">
              <span className="text-sm text-gray-500">
                {fees?.feeStats?.find(s => s._id === 'paid')?.count || 0} paid • {fees?.feeStats?.find(s => s._id === 'pending')?.count || 0} pending
              </span>
            </div>
          </div>
        </div>

        {/* Occupancy Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Room Occupancy</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {occupancy?.occupiedRooms || 0} / {occupancy?.totalRooms || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">{occupancy?.availableRooms || 0} available</span>
              <span className="mx-2">•</span>
              <span className="text-orange-600">{occupancy?.maintenanceRooms || 0} maintenance</span>
            </div>
            <div className="mt-1">
              <span className={`text-sm font-medium ${getPercentageColor(occupancy?.occupancyRate || 0)}`}>
                {occupancy?.occupancyRate?.toFixed(1) || 0}% occupied
              </span>
            </div>
          </div>
        </div>

        {/* Complaints Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Complaints</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {complaints?.statusStats?.reduce((total, stat) => total + stat.count, 0) || 0}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">{complaints?.statusStats?.find(s => s._id === 'resolved')?.count || 0} resolved</span>
              <span className="mx-2">•</span>
              <span className="text-orange-600">{complaints?.statusStats?.find(s => s._id === 'pending')?.count || 0} pending</span>
            </div>
            <div className="mt-1">
              <span className="text-sm text-gray-500">
                Avg. resolution: {complaints?.avgResolutionTime?.toFixed(1) || 0} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Details</h3>
          {fees?.feeStats?.length > 0 ? (
            <div className="space-y-3">
              {fees.feeStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      stat._id === 'paid' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="capitalize font-medium">{stat._id}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(stat.totalAmount)}</div>
                    <div className="text-sm text-gray-500">{stat.count} fees</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No fee data available</p>
          )}
        </div>

        {/* Room Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Room Details</h3>
          {occupancy?.roomTypeStats?.length > 0 ? (
            <div className="space-y-3">
              {occupancy.roomTypeStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="capitalize font-medium">{stat._id || 'Unknown'}</span>
                    <div className="text-sm text-gray-500">
                      {stat.occupied} occupied, {stat.available} available
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{stat.total} rooms</div>
                    <div className="text-sm text-gray-500">
                      {stat.total > 0 ? ((stat.occupied / stat.total) * 100).toFixed(1) : 0}% occupied
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No room data available</p>
          )}
        </div>

        {/* Complaint Categories */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Complaint Categories</h3>
          {complaints?.categoryStats?.length > 0 ? (
            <div className="space-y-3">
              {complaints.categoryStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="capitalize font-medium">{stat._id}</span>
                  <div className="text-right">
                    <div className="font-medium">{stat.count}</div>
                    <div className="text-sm text-gray-500">complaints</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No complaint data available</p>
          )}
        </div>

        {/* Student Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Student Distribution</h3>
          {students?.studentsByBlock?.length > 0 ? (
            <div className="space-y-3">
              {students.studentsByBlock.map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Block {stat._id}</span>
                  <div className="text-right">
                    <div className="font-medium">{stat.count}</div>
                    <div className="text-sm text-gray-500">students</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No student distribution data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
