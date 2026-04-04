import React, { useEffect, useState } from "react";
import "./BuyerDashboard.css";
import { getOrders } from "@/api/orderAPI";

const BuyerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        const latestOrders = data
          .sort((a, b) => b.orderid - a.orderid)
          .slice(0, 5); 
        setOrders(latestOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  const totalRequests = orders.length;
  const pendingRequests = orders.filter((o) => o.status === "Pending").length;
  const completedRequests = orders.filter((o) => o.status === "Completed").length;

  return (
    <div className="buyer-dashboard">
      <div className="buyer-stats-cards">
        <div className="buyer-stat-card">
          <h3>Total Requests</h3>
          <p>{totalRequests}</p>
        </div>
        <div className="buyer-stat-card">
          <h3>Pending Requests</h3>
          <p>{pendingRequests}</p>
        </div>
        <div className="buyer-stat-card">
          <h3>Completed Requests</h3>
          <p>{completedRequests}</p>
        </div>
      </div>

      <div className="buyer-recent-orders">
        <h2>Recent Orders</h2>
        <div className="buyer-orders-table-container">
          <table className="buyer-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Breed / Egg Type</th>
                <th>Quantity</th>
                <th>Ordered Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.orderid}>
                    <td>{order.orderid}</td>
                    <td>{order.breed_details || "N/A"}</td>
                    <td>{order.quantity}</td>
                    <td>{order.ordereddate}</td>
                    <td>
                      <span
                        className={`buyer-status-badge ${order.status.toLowerCase()}`}
                      >
                        {order.status} 
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;