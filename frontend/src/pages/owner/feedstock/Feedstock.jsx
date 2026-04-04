import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd, MdClose } from "react-icons/md";
import "./Feedstock.css";
import { getFeedStocks, addFeedStock, deleteFeedStock, updateFeedStock } from "@/api/feedstockAPI";
import { MdEdit } from "react-icons/md";

const FeedStockList = () => {
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState([]);
  const [feedTypes, setFeedTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    feedtype: "",
    quantity: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [feedTypeFilter, setFeedTypeFilter] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setForm({ feedtype: "", quantity: 0 });
  };

  const getStatus = (quantity) => {
    if (quantity <= 0) return "Out of Stock";
    if (quantity < 15) return "Low Stock";
    return "Available";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const stocks = await getFeedStocks();
      setData(stocks);
      const types = [...new Set(stocks.map((item) => item.feedtype))];
      setFeedTypes(types);
    } catch (err) {
      console.error("Failed to fetch feed stocks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleFeedUpdate = () => fetchData();
    window.addEventListener("feedStockUpdated", handleFeedUpdate);

    return () => {
      window.removeEventListener("feedStockUpdated", handleFeedUpdate);
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const status = getStatus(Number(form.quantity));

      if (editMode) {
        await updateFeedStock(editingId, {
          feedtype: form.feedtype,
          quantity: Number(form.quantity),
          status: status,
        });
      } else {
        await addFeedStock({
          feedtype: form.feedtype,
          quantity: Number(form.quantity),
          status: status,
        });
      }

      fetchData();
      setShowForm(false);
      resetForm();
      setEditMode(false);
      setEditingId(null);

    } catch {
      alert("Failed to save feed stock");
    }
  };

  const handleDelete = async (stockid) => {
    if (!window.confirm("Are you sure you want to delete this feed stock?")) return;
    try {
      await deleteFeedStock(stockid);
      fetchData();
    } catch {
      alert("Failed to delete feed stock");
    }
  };

  const handleEdit = (row) => {
    setForm({
      feedtype: row.feedtype,
      quantity: row.quantity,
    });
    setEditingId(row.stockid);
    setEditMode(true);
    setShowForm(true);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.feedtype.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesFeedType = feedTypeFilter ? item.feedtype === feedTypeFilter : true;
    return matchesSearch && matchesStatus && matchesFeedType;
  });

  if (loading) return <p>Loading feedstock...</p>;

  return (
    <div className="feedstock-wrapper">
      <div className="feedstock-header">
        <h1>Feed Stock Management</h1>
      </div>

      <div className="feedstock-filters">
        <input
          type="text"
          placeholder="Search by Feed Type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <select value={feedTypeFilter} onChange={(e) => setFeedTypeFilter(e.target.value)}>
          <option value="">All Feed Types</option>
          {feedTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <button className="add-button" onClick={() => {
          setShowForm(true);
          setEditMode(false);
          resetForm();
        }}>
          <MdAdd size={20} />
          Add Feed Stock
        </button>
      </div>

      <div className="feedstock-table-container">
        <table className="feedstock-table">
          <thead>
            <tr>
              <th>Stock ID</th>
              <th>Feed Type</th>
              <th>Quantity (kg)</th>
              <th>Last Updated</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.stockid}>
                <td>{row.stockid}</td>
                <td>{row.feedtype}</td>
                <td>{row.quantity}</td>
                <td>{new Date(row.lastupdated).toLocaleString()}</td>
                <td>
                  <span
                    className={`status-badge ${
                      getStatus(row.quantity) === "Available"
                        ? "active"
                        : getStatus(row.quantity) === "Low Stock"
                        ? "warning"
                        : "inactive"
                    }`}
                  >
                    {getStatus(row.quantity)}
                  </span>
                </td>
                <td className="actions-col">
                  <button
                    className="icon-btn edit-btn"
                    onClick={() => handleEdit(row)}
                  >
                    <MdEdit size={18} />
                  </button>

                  <button
                    className="icon-btn delete-btn"
                    onClick={() => handleDelete(row.stockid)}
                  >
                    <MdDelete size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "12px" }}>
                  No Feed Stock Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <div className="popup-header">
              <h2>{editMode ? "Update Feed Stock" : "Add Feed Stock"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setEditMode(false);
                  setEditingId(null);
                }}
              >
                <MdClose size={22} />
              </button>
            </div>

            <form className="form-grid" onSubmit={handleAdd}>
              <div className="form-group">
                <label>Feed Type</label>
                <input
                  type="text"
                  value={form.feedtype}
                  onChange={(e) => setForm({ ...form, feedtype: e.target.value })}
                  placeholder="Enter feed type"
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity (kg)</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <button className="submit-btn" type="submit">
                {editMode ? "Update Stock" : "Add Stock"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedStockList;