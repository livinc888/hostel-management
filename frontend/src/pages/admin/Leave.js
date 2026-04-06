import React, { useState, useEffect } from "react";
import { leaveAPI } from "../../services/api";

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const params =
        filterStatus === "all" ? {} : { status: filterStatus };

      const response = await leaveAPI.getLeaves(params);

      console.log("LEAVES RESPONSE:", response.data); // DEBUG
      console.log("LEAVES TYPE:", typeof response.data);
      console.log("HAS LEAVES PROPERTY:", !!response.data?.leaves);

      // ✅ SAFE HANDLING - Handle both response formats
      if (response?.data?.leaves) {
        console.log("SETTING LEAVES FROM .leaves:", response.data.leaves.length);
        setLeaves(response.data.leaves);
      } else if (Array.isArray(response.data)) {
        console.log("SETTING LEAVES FROM ARRAY:", response.data.length);
        setLeaves(response.data);
      } else {
        console.log("NO LEAVES FOUND, SETTING EMPTY ARRAY");
        setLeaves([]);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err.response || err);
      setError("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveAPI.updateLeaveStatus(id, { status: "approved" });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setError("Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;

    try {
      await leaveAPI.updateLeaveStatus(selectedLeave._id, {
        status: "rejected",
        rejectionReason,
      });

      setShowRejectModal(false);
      setSelectedLeave(null);
      setRejectionReason("");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setError("Failed to reject");
    }
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "approved") return "bg-green-100 text-green-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-100 p-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leave Management</h1>
        
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All ({leaves.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      {leaves.length === 0 ? (
        <p className="text-gray-500">No leave requests found</p>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="border p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  {leave?.studentId?.name || "No Name"}
                </h3>

                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(
                    leave.status
                  )}`}
                >
                  {leave.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {leave?.studentId?.email || "-"} |{" "}
                {leave?.studentId?.phone || "-"}
                {leave?.studentId?.roomId && ` • Room ${leave.studentId.roomId.roomNumber}`}
              </p>

              <p className="text-sm mt-2">
                <strong>From:</strong>{" "}
                {new Date(leave.fromDate).toLocaleDateString()}
              </p>

              <p className="text-sm">
                <strong>To:</strong>{" "}
                {new Date(leave.toDate).toLocaleDateString()}
              </p>

              <p className="text-sm">
                <strong>Destination:</strong> {leave.destination || "-"}
              </p>

              <p className="text-sm">
                <strong>Reason:</strong> {leave.reason}
              </p>

              <p className="text-sm">
                <strong>Contact During Leave:</strong>{" "}
                {leave.contactDuringLeave || "-"}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Applied on: {new Date(leave.createdAt).toLocaleDateString()}
                {leave.approvedAt && (
                  <span className="ml-4">
                    {leave.status === "approved" ? "Approved" : "Rejected"} by{" "}
                    {leave.approvedBy?.name || "Admin"} on{" "}
                    {new Date(leave.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </p>

              {leave.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {leave.rejectionReason}
                  </p>
                </div>
              )}

              {/* ACTIONS */}
              {leave.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(leave._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setShowRejectModal(true);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-5 rounded w-96">
            <h2 className="font-bold mb-3">Reject Leave Application</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {selectedLeave.studentId?.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Leave Period:</strong>{" "}
                {new Date(selectedLeave.fromDate).toLocaleDateString()} -{" "}
                {new Date(selectedLeave.toDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                className="w-full border p-2 rounded"
                rows={3}
                placeholder="Please provide a reason for rejection..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;