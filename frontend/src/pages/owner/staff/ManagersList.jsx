import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd, MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getManagers, updateManager, deleteManager } from "@/api/managersAPI";
import "./ManagersList.css";

const ManagersList = () => {
  const navigate = useNavigate();

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editManager, setEditManager] = useState(null);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const data = await getManagers();
      setManagers(data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleDelete = async (managerid) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) return;

    try {
      await deleteManager(managerid); 
      alert("Manager deleted successfully!");

      const managersList = await getManagers();
      setManagers(managersList);
    } catch (error) {
      alert("Failed to delete manager. Check console for details.");
    }
  };

  const handleAddManager = () => navigate("/owner/staff/add");

  const handleEditManager = (manager) => {
    setEditManager(manager);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditManager(null);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditManager((prev) => ({
      ...prev,
      user_details: {
        ...prev.user_details,
        [name]: name === "is_active" ? value === "Active" : value,
      },
    }));
  };

  const handleSave = async () => {
    const user = editManager.user_details;
    if (!user.firstname || !user.email || !user.phonenumber) {
      alert("Please fill required fields: Name, Email, Phone");
      return;
    }

    try {
      const payload = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phonenumber: user.phonenumber,
        nic: user.nic,
        gender: user.gender,
        dob: user.dob,
        note: user.note,
        is_active: user.is_active,
      };

      await updateManager(editManager.managerid, payload);

      setManagers((prev) =>
        prev.map((m) =>
          m.managerid === editManager.managerid
            ? { ...m, user_details: { ...editManager.user_details } }
            : m
        )
      );

      handleCloseModal();
      alert("Manager updated successfully!");
    } catch (error) {
      console.error("Error updating manager:", error);
      alert("Failed to update manager");
    }
  };

  const filteredManagers = managers.filter((m) => {
    const search = searchTerm.toLowerCase();
    const name = `${m.user_details?.firstname || ""} ${m.user_details?.lastname || ""}`.toLowerCase();
    const matchesSearch =
      name.includes(search) ||
      (m.user_details?.email || "").toLowerCase().includes(search) ||
      (m.user_details?.nic || "").toLowerCase().includes(search);

    const matchesStatus = statusFilter
      ? (m.user_details?.is_active ? "Active" : "Inactive") === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <p>Loading managers...</p>;

  return (
    <div className="manager-wrapper">
      <div className="manager-header">
        <h1>Managers List</h1>
      </div>

      <div className="manager-filters">
        <input
          type="text"
          placeholder="Search managers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button className="add-button" onClick={handleAddManager}>
          <MdAdd size={20} /> Add Manager
        </button>
      </div>

      <div className="manager-table-container">
        <table className="manager-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>NIC</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Status</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((m) => (
                <tr key={m.managerid}>
                  <td>{m.managerid}</td>
                  <td>{`${m.user_details?.firstname || ""} ${m.user_details?.lastname || ""}`}</td>
                  <td>{m.user_details?.gender}</td>
                  <td>{m.user_details?.dob}</td>
                  <td>{m.user_details?.nic}</td>
                  <td>{m.user_details?.phonenumber}</td>
                  <td>{m.user_details?.email}</td>
                  <td>
                    <span className={`status-badge ${m.user_details?.is_active ? "active" : "inactive"}`}>
                      {m.user_details?.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{m.user_details?.note}</td>
                  <td className="actions-col">
                    <button className="icon-btn edit-btn" aria-label="edit manager" onClick={() => handleEditManager(m)}>
                      <MdEdit size={18} />
                    </button>
                    <button className="icon-btn delete-btn" aria-label="delete manager" onClick={() => handleDelete(m.managerid)}>
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No Managers Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editManager && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Manager</h2>
            </div>

            <div className="modal-form">
              <input
                name="firstname"
                value={editManager.user_details?.firstname || ""}
                onChange={handleChange}
                placeholder="First Name"
              />
              <input
                name="lastname"
                value={editManager.user_details?.lastname || ""}
                onChange={handleChange}
                placeholder="Last Name"
              />
              <select
                name="gender"
                value={editManager.user_details?.gender || "Male"}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
              <input
                type="date"
                name="dob"
                value={editManager.user_details?.dob || ""}
                onChange={handleChange}
              />
              <input
                name="nic"
                value={editManager.user_details?.nic || ""}
                onChange={handleChange}
                placeholder="NIC"
              />
              <input
                name="phonenumber"
                value={editManager.user_details?.phonenumber || ""}
                onChange={handleChange}
                placeholder="Phone"
              />
              <input
                name="email"
                value={editManager.user_details?.email || ""}
                onChange={handleChange}
                placeholder="Email"
              />
              <input
                name="note"
                value={editManager.user_details?.note || ""}
                onChange={handleChange}
                placeholder="Note"
              />
              <select
                name="is_active"
                value={editManager.user_details?.is_active ? "Active" : "Inactive"}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="modal-buttons1">
              <button className="cancel-btn1" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="save-btn1" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersList;