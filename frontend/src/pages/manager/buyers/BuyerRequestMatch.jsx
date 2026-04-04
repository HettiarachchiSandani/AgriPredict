import React, { useEffect, useState } from "react";
import { MdCheckCircle } from "react-icons/md"; 
import { NavLink } from "react-router-dom";
import { getOrders, updateOrder } from "@/api/orderAPI";
import { getOrdersWithAvailableEggs } from "@/api/orderAPI"; 
import { getBuyers } from "@/api/buyersAPI";
import "./BuyerRequestMatch.css";

const BuyerRequestMatch = () => {
  const [requests, setRequests] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [searchBuyer, setSearchBuyer] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [requestedDateFilter, setRequestedDateFilter] = useState("");
  const [orderedDateFilter, setOrderedDateFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); 

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrdersWithAvailableEggs(); 
        setRequests(data); 
      } catch (error) {
        console.error("Failed to fetch orders with available eggs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const data = await getBuyers();
        setBuyers(data);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
        setBuyers([]);
      }
    };
    fetchBuyers();
  }, []);

  const handleAction = async (request, action) => {
    let payload = {};

    if (action === "approve") payload.accepted = true;
    else if (action === "reject") payload.accepted = false;
    else if (action === "complete") payload.completed = true;

    setRequests(prev =>
      prev.map(o => o.orderid === request.orderid ? { ...o, ...payload } : o)
    );
    setSelectedRequest(prev => ({ ...prev, ...payload }));

    setUpdating(true); 

    try {
      await updateOrder(request.orderid, payload);
    } catch (error) {
      console.error(`Failed to update order ${request.orderid}:`, error);
      setRequests(prev =>
        prev.map(o => o.orderid === request.orderid ? { ...o, ...request } : o)
      );
      setSelectedRequest(request);
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesBuyer = searchBuyer ? r.buyerid === searchBuyer : true;

    const status = r.completed
      ? "Completed"
      : r.accepted === true
      ? "Confirmed"
      : r.accepted === false
      ? "Canceled"
      : "Pending";
    const matchesStatus = statusFilter ? status === statusFilter : true;

    const matchesRequestedDate = requestedDateFilter
      ? r.requesteddate?.substring(0, 10) === requestedDateFilter
      : true;
    const matchesOrderedDate = orderedDateFilter
      ? r.ordereddate?.substring(0, 10) === orderedDateFilter
      : true;

    return matchesBuyer && matchesStatus && matchesRequestedDate && matchesOrderedDate;
  });

  if (loading) return <p>Loading buyer requests...</p>; 

  return (
    <div className="buyer-request-wrapper">
      <div className="buyers-tabs">
        <NavLink to="/manager/buyers" end className={({ isActive }) => "buyer-tab" + (isActive ? " active" : "")}>Buyers List</NavLink>
        <NavLink to="/manager/buyers/request" className={({ isActive }) => "buyer-tab" + (isActive ? " active" : "")}>Buyer Requests</NavLink>
        <NavLink to="/manager/buyers/order-history" className={({ isActive }) => "buyer-tab" + (isActive ? " active" : "")}>Order History</NavLink>
      </div>

      <div className="buyer-request-header">
        <h1>Buyer Requests</h1>
      </div>

      <div className="buyer-request-filters">
        <div className="filter-item">
          <label htmlFor="buyer-filter">Buyer</label>
          <select id="buyer-filter" value={searchBuyer} onChange={e => setSearchBuyer(e.target.value)}>
            <option value="">All Buyers</option>
            {buyers.map((b) => (
              <option key={b.buyerid} value={b.buyerid}>
                {b.user_details?.firstname || b.firstname} {b.user_details?.lastname || b.lastname} ({b.buyerid})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Canceled">Canceled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="requested-date-filter">Requested Date</label>
          <input id="requested-date-filter" type="date" value={requestedDateFilter} onChange={e => setRequestedDateFilter(e.target.value)} />
        </div>

        <div className="filter-item">
          <label htmlFor="ordered-date-filter">Order Date</label>
          <input id="ordered-date-filter" type="date" value={orderedDateFilter} onChange={e => setOrderedDateFilter(e.target.value)} />
        </div>
      </div>

      <div className="buyer-request-table-container">
        <table className="buyer-request-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer ID</th>
              <th>Quantity</th>
              <th>Requested Date</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? filteredRequests.map(r => {
              const status = r.completed ? "Completed" : r.accepted === true ? "Confirmed" : r.accepted === false ? "Canceled" : "Pending";
              return (
                <tr key={r.orderid}>
                  <td>{r.orderid}</td>
                  <td>{r.buyerid}</td>
                  <td>{r.quantity}</td>
                  <td>{r.requesteddate}</td>
                  <td>{r.ordereddate}</td>
                  <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
                  <td>
                    <MdCheckCircle className="action-icon" onClick={() => setSelectedRequest(r)} title="View & Update Status" />
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan="7" style={{ textAlign: "center" }}>No Requests Found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="request-modal">
          <div className="modal-content">
            <h2>Order Details</h2>
            <span className="modal-close" onClick={() => setSelectedRequest(null)}>&times;</span>
            <p><strong>Order ID:</strong> {selectedRequest.orderid}</p>
            <p><strong>Buyer ID:</strong> {selectedRequest.buyerid}</p>
            <p><strong>Breed:</strong> {selectedRequest.breedname} ({selectedRequest.breedid})</p>
            <p><strong>Requested Date:</strong> {selectedRequest.requesteddate}</p>
            <p><strong>Order Date:</strong> {selectedRequest.ordereddate}</p>
            <p><strong>Status:</strong> {selectedRequest.completed ? "Completed" : selectedRequest.accepted === true ? "Confirmed" : selectedRequest.accepted === false ? "Canceled" : "Pending"}</p>
            <div className="highlight-section">
              <div className="highlight-card quantity">
                <span>Requested Quantity</span>
                <h3>{selectedRequest.quantity}</h3>
              </div>

              <div className="highlight-card available">
                <span>Available Eggs</span>
                <h3>{selectedRequest.available_eggs}</h3>
              </div>

              <div className="highlight-card predicted">
                <span>Next 7 Days Predicted</span>
                <h3
                  style={{
                    color: selectedRequest.prediction_available ? "#2e7d32" : "#999",
                    fontSize: "20px",
                  }}
                >
                  {selectedRequest.prediction_available
                    ? selectedRequest.next_7_days_predicted_eggs
                    : "Prediction Not Available"}
                </h3>
                {!selectedRequest.prediction_available && (
                  <small style={{ color: "#d32f2f" }}>
                    Missing recent data (yesterday). Unable to predict.
                  </small>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="approve-btn"
                onClick={() => handleAction(selectedRequest, "approve")}
                disabled={updating || selectedRequest.completed || selectedRequest.accepted === false}
              >
                Confirm
              </button>
              <button
                className="reject-btn"
                onClick={() => handleAction(selectedRequest, "reject")}
                disabled={updating || selectedRequest.completed || selectedRequest.accepted === false}
              >
                Cancel
              </button>
              <button
                className="complete-btn"
                onClick={() => handleAction(selectedRequest, "complete")}
                disabled={updating || selectedRequest.completed || selectedRequest.accepted === false}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerRequestMatch;