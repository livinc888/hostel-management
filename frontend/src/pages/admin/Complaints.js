import React, { useState, useEffect } from 'react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all' 
        ? 'http://localhost:5001/api/complaints'
        : `http://localhost:5001/api/complaints?status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
      } else {
        throw new Error('Failed to fetch complaints');
      }
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error('Complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchComplaints();
      } else {
        throw new Error('Failed to update complaint status');
      }
    } catch (err) {
      setError('Failed to update complaint status');
      console.error('Update complaint error:', err);
    }
  };

  const handleRemarksUpdate = async (complaintId, remarks) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks }),
      });

      if (response.ok) {
        fetchComplaints();
      } else {
        throw new Error('Failed to update complaint remarks');
      }
    } catch (err) {
      setError('Failed to update complaint remarks');
      console.error('Update remarks error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-gray-600">Manage student complaints and issues</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Complaints ({complaints.length})
          </h3>
          {complaints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {filterStatus === 'all' ? 'No complaints found.' : `No ${filterStatus} complaints found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{complaint.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Student:</span>
                          <p className="text-sm text-gray-900">
                            {complaint.studentId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {complaint.studentId?.email || ''}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Category:</span>
                          <p className="text-sm text-gray-900 capitalize">{complaint.category}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Date:</span>
                          <p className="text-sm text-gray-900">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {complaint.remarks && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-700">
                            <strong>Remarks:</strong> {complaint.remarks}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 space-y-2">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <textarea
                        placeholder="Add remarks..."
                        defaultValue={complaint.remarks || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (complaint.remarks || '')) {
                            handleRemarksUpdate(complaint._id, e.target.value);
                          }
                        }}
                        className="text-sm border border-gray-300 rounded-md py-1 px-2 w-32 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Complaints;
