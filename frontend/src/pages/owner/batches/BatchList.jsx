import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdRemoveRedEye, MdAdd } from "react-icons/md";
import { getBatches, deleteBatch } from "@/api/batchAPI";
import "./BatchList.css";

const calculateAgeWeeks = (startDate) => {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today - start;
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return `${diffWeeks} weeks`;
};

const BatchManagement = () => {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await getBatches();
      const mappedBatches = data.map((b) => ({
        id: b.batchid,
        name: b.batchname,
        type: b.breedname || "Layer",
        startDate: b.startdate ? b.startdate.split("T")[0] : "",
        initialCount: b.initialcount || 0,
        currentCount: b.currentcount || b.initialcount || 0,
        currentAge: calculateAgeWeeks(b.startdate),
        status: b.status || "Unknown",
      }));
      setBatches(mappedBatches);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBatches();

    const handleBatchUpdate = (event) => {
      const updatedBatch = event.detail; 
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === updatedBatch.batchid
            ? { ...batch, currentCount: updatedBatch.currentcount }
            : batch
        )
      );
    };

    window.addEventListener("batchUpdated", handleBatchUpdate);

    return () => {
      window.removeEventListener("batchUpdated", handleBatchUpdate);
    };
  }, []);

  const handleActionClick = async (batchId, action) => {
    if (action === "edit") navigate(`/owner/batches/edit/${batchId}`);
    else if (action === "view") navigate(`/owner/batches/view/${batchId}`);
    else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this batch?")) {
        try {
          await deleteBatch(batchId);
          setBatches((prev) => prev.filter((batch) => batch.id !== batchId));
        } catch (error) {
          alert("Failed to delete batch. Please try again.");
          console.error(error);
        }
      }
    }
  };

  const handleAddBatch = () => {
    navigate("/owner/batches/add");
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      (batch.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || batch.status === statusFilter;
    const matchesType = typeFilter === "All" || batch.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) return <div>Loading batches...</div>;

  return (
    <div className="batch-management">
      <div className="batch-header">
        <h1>Batch Management</h1>

        <div className="top-controls">
          <input
            type="text"
            placeholder="Search batches by ID or name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Layer">Layer</option>
          </select>

          <button className="add-batch-btn" onClick={handleAddBatch}>
            <MdAdd /> Add Batch
          </button>
        </div>
      </div>

      <div className="batch-table-container">
        {filteredBatches.length === 0 ? (
          <div className="no-results">No batches found.</div>
        ) : (
          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Batch Name</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>Initial Count</th>
                <th>Current Count</th>
                <th>Current Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch.id}>
                  <td className="highlight">{batch.id}</td>
                  <td className="batch-name" title={batch.name}>{batch.name}</td>
                  <td><span className="badge-type">{batch.type}</span></td>
                  <td>{batch.startDate}</td>
                  <td>{batch.initialCount}</td>
                  <td>{batch.currentCount}</td>
                  <td>{batch.currentAge}</td>
                  <td><span className={`status-badge ${batch.status.toLowerCase()}`}>{batch.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleActionClick(batch.id, "edit")}>
                        <MdEdit />
                      </button>

                      <button className="view-btn" onClick={() => handleActionClick(batch.id, "view")}>
                        <MdRemoveRedEye />
                      </button>

                      <button className="delete-btn" onClick={() => handleActionClick(batch.id, "delete")}>
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BatchManagement;