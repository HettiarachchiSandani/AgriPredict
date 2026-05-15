import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd, MdEdit } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { getBuyers, addBuyer, updateBuyer, deleteBuyer } from "@/api/buyersAPI";
import "./BuyersList.css";

const BuyersList = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBuyer, setEditBuyer] = useState(null);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const data = await getBuyers();
      setBuyers(data);
    } catch (error) {
      console.error("Failed to fetch buyers:", error);
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const openModal = (buyer = null) => {
    if (buyer) {
      setEditBuyer({
        ...buyer,
        firstname: buyer.firstname || buyer.user_details?.firstname || "",
        lastname: buyer.lastname || buyer.user_details?.lastname || "",
        email: buyer.email || buyer.user_details?.email || "",
        phonenumber: buyer.phonenumber || buyer.user_details?.phonenumber || "",
        company: buyer.company || "",
        address: buyer.address || "",
        note: buyer.note || "",
        status: (buyer.user_details?.is_active ?? buyer.is_active) ? "Active" : "Inactive",
        buyerid: buyer.buyerid,
      });
    } else {
      setEditBuyer({
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        company: "",
        address: "",
        note: "",
        status: "Active",
        password: "",
        gender: "Male",
        dob: "",
        nic: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditBuyer(null);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditBuyer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editBuyer.firstname || !editBuyer.email || !editBuyer.phonenumber) {
      alert("First name, Email, and Phone are required");
      return;
    }

    try {
      if (editBuyer.buyerid) {
        await updateBuyer(editBuyer.buyerid, {
          ...editBuyer,
          is_active: editBuyer.status === "Active",
        });

        setBuyers((prev) =>
          prev.map((b) =>
            b.buyerid === editBuyer.buyerid
              ? { ...b, ...editBuyer, is_active: editBuyer.status === "Active" }
              : b
          )
        );
      }
      else {
        const newBuyer = await addBuyer({
          ...editBuyer,
          is_active: editBuyer.status === "Active",
        });
        setBuyers((prev) => [...prev, newBuyer]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving buyer:", error);
      alert("Failed to save buyer. Check console for details.");
    }
  };

  const handleDelete = async (buyerid) => {
    if (!window.confirm("Delete this buyer?")) return;

    try {
      await deleteBuyer(buyerid);
      setBuyers((prev) => prev.filter((b) => b.buyerid !== buyerid));
    } catch (error) {
      console.error("Failed to delete buyer:", error);
      alert("Failed to delete buyer.");
    }
  };

  const filteredBuyers = buyers
    .filter((b) => {
      const fullName = `${b.user_details?.firstname || b.firstname || ""} ${b.user_details?.lastname || b.lastname || ""}`.toLowerCase();
      const activeStatus = b.user_details?.is_active ?? b.is_active ?? false;

      const statusMatch = statusFilter
        ? (activeStatus ? "Active" : "Inactive") === statusFilter
        : true;
      return fullName.includes(searchTerm.toLowerCase()) && statusMatch;
    })
    .sort((a, b) => (a.buyerid < b.buyerid ? -1 : a.buyerid > b.buyerid ? 1 : 0));

  if (loading) return <p>Loading buyers...</p>;

  return (
    <div className="buyers-wrapper">
      <div className="buyers-tabs">
        <NavLink to="/manager/buyers" className="buyer-tab">Buyers List</NavLink>
        <NavLink to="/manager/buyers/request" className="buyer-tab">Buyer Requests</NavLink>
        <NavLink to="/manager/buyers/order-history" className="buyer-tab">Buyer History</NavLink>
      </div>

      <div className="buyers-header">
        <h1>Buyers List</h1>
      </div>

      <div className="buyers-filters">
        <input
          type="text"
          placeholder="Search buyers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="add-button" onClick={() => navigate("/manager/buyers/add")}>
          <MdAdd size={20} /> Add Buyer
        </button>
      </div>

      <div className="buyers-table-container">
        <table className="buyers-table">
          <thead>
            <tr>
              <th>Buyer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Company</th>
              <th>Address</th>
              <th>Status</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuyers.length ? (
              filteredBuyers.map((b) => {
                const isActive = b.user_details?.is_active ?? b.is_active ?? false;
                return (
                  <tr key={b.buyerid}>
                    <td>{b.buyerid}</td>
                    <td>{b.user_details?.firstname || b.firstname} {b.user_details?.lastname || b.lastname}</td>
                    <td>{b.user_details?.email || b.email}</td>
                    <td>{b.user_details?.phonenumber || b.phonenumber}</td>
                    <td>{b.company}</td>
                    <td>{b.address}</td>
                    <td>
                      <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{b.note}</td>
                    <td className="actions-col">
                      <button className="icon-btn edit-btn" onClick={() => openModal(b)}>
                        <MdEdit size={18} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(b.buyerid)}>
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>No Buyers Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editBuyer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Buyer</h2>
            </div>
            <div className="modal-form">
              <input name="firstname" value={editBuyer.firstname} onChange={handleChange} placeholder="First Name" />
              <input name="lastname" value={editBuyer.lastname} onChange={handleChange} placeholder="Last Name" />
              <input name="email" value={editBuyer.email} onChange={handleChange} placeholder="Email" />
              <input name="phonenumber" value={editBuyer.phonenumber} onChange={handleChange} placeholder="Phone" />
              <input name="company" value={editBuyer.company} onChange={handleChange} placeholder="Company" />
              <input name="address" value={editBuyer.address} onChange={handleChange} placeholder="Address" />
              <input name="note" value={editBuyer.note} onChange={handleChange} placeholder="Note" />
              {!editBuyer.buyerid && (
                <>
                  <input name="password" type="password" value={editBuyer.password} onChange={handleChange} placeholder="Password" />
                  <select name="gender" value={editBuyer.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <input name="dob" type="date" value={editBuyer.dob} onChange={handleChange} />
                  <input name="nic" value={editBuyer.nic} onChange={handleChange} placeholder="NIC" />
                </>
              )}
              <select name="status" value={editBuyer.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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

export default BuyersList;