import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getOrders } from "@/api/orderAPI"; 
import "./BuyerRequestMatch.css"; 

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [searchBuyer, setSearchBuyer] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [completedFrom, setCompletedFrom] = useState("");
  const [completedTo, setCompletedTo] = useState("");
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrders();
        const filtered = data.filter(
          (o) => o.status === "Completed" || o.status === "Canceled"
        );
        setOrders(filtered);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesBuyer = searchBuyer ? o.buyerid === searchBuyer : true;
    const matchesStatus = statusFilter ? o.status === statusFilter : true;

    let matchesCompletedDate = true;
    if (completedFrom && completedTo) {
      matchesCompletedDate =
        o.completeddate >= completedFrom && o.completeddate <= completedTo;
    } else if (completedFrom) {
      matchesCompletedDate = o.completeddate >= completedFrom;
    } else if (completedTo) {
      matchesCompletedDate = o.completeddate <= completedTo;
    }

    return matchesBuyer && matchesStatus && matchesCompletedDate;
  });

  const buyers = [...new Set(orders.map((o) => o.buyerid))];

  if (loading) return <p>Loading orders history...</p>; 

  return (
    <div className="buyer-request-wrapper">
      <div className="buyers-tabs">
        <NavLink to="/manager/buyers" end className={({ isActive }) => "buyer-tab" + (isActive ? " active" : "")}>Buyers List</NavLink>
        <NavLink to="/manager/buyers/request" className={({ isActive }) => "buyer-tab" + (isActive ? " active" : "")}>Buyer Requests</NavLink>
        <NavLink to="/manager/buyers/order-history" className={({ isActive }) => "buyer-tab" + (isActive ? " active" : "")}>Order History</NavLink>
      </div>

      <div className="buyer-request-header">
        <h1>Order History</h1>
      </div>

      <div className="buyer-request-filters">
        <div className="filter-item">
          <label htmlFor="buyer-filter">Buyer</label>
          <select id="buyer-filter" value={searchBuyer} onChange={(e) => setSearchBuyer(e.target.value)}>
            <option value="">All Buyers</option>
            {buyers.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Canceled">Canceled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="completed-from">Completed From</label>
          <input
            id="completed-from"
            type="date"
            value={completedFrom}
            onChange={(e) => setCompletedFrom(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="completed-to">Completed To</label>
          <input
            id="completed-to"
            type="date"
            value={completedTo}
            min={completedFrom}
            onChange={(e) => setCompletedTo(e.target.value)}
          />
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
              <th>Completed Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr key={o.orderid}>
                  <td>{o.orderid}</td>
                  <td>{o.buyerid}</td>
                  <td>{o.quantity}</td>
                  <td>{o.requesteddate}</td>
                  <td>{o.ordereddate}</td>
                  <td>{o.completeddate || "-"}</td>
                  <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No Orders Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;