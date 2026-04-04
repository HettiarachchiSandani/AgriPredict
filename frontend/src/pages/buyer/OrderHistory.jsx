import React, { useState, useEffect } from "react";
import { MdCancel } from "react-icons/md";
import { getOrders, updateOrder } from "@/api/orderAPI";
import "./OrderHistory.css";

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();

      const ordersWithStatus = data.map((o) => ({
        ...o,
        status: o.completed
          ? "Completed"
          : o.accepted === true
          ? "Confirmed"
          : o.accepted === false
          ? "Canceled"
          : "Pending",
      }));

      setOrders(ordersWithStatus);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const orderIds = [...new Set(orders.map((o) => o.orderid))];

  const handleCancel = async (order) => {
    if (order.status !== "Pending" && order.status !== "Confirmed") {
      alert("Only Pending or Confirmed orders can be cancelled!");
      return;
    }

    if (!window.confirm(`Cancel order ${order.orderid}? This action cannot be undone.`)) return;

    try {
      console.log("Sending order ID:", order.orderid);
      const cleanId = String(order.orderid).replace(/[“”]/g, "").trim();
      await updateOrder(cleanId, { accepted: false, completed: false });
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesOrderId = orderIdFilter ? o.orderid === orderIdFilter : true;
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesOrderId && matchesStatus;
  });

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="feedstock-wrapper">
      <div className="feedstock-header">
        <h1>Order History</h1>
      </div>

      <div className="feedstock-filters">
        <select value={orderIdFilter} onChange={(e) => setOrderIdFilter(e.target.value)}>
          <option value="">All Orders</option>
          {orderIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      <div className="feedstock-table-container">
        <table className="feedstock-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Breed Type</th>
              <th>Quantity</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr key={o.orderid}>
                  <td>{o.orderid}</td>
                  <td>{o.ordereddate}</td>
                  <td>{o.breed_details || o.eggType}</td>
                  <td>{o.quantity}</td>
                  <td>{o.requesteddate}</td>
                  <td>
                    <span className={`status-badge1 ${
                      o.status === "Pending" ? "pending" :
                      o.status === "Confirmed" ? "confirmed" :
                      o.status === "Completed" ? "completed" :
                      o.status === "Canceled" ? "canceled" : ""
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="actions-col">
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleCancel(o)}
                      disabled={o.status === "Completed" || o.status === "Canceled"}
                      title={
                        o.status === "Completed" || o.status === "Canceled"
                          ? "Cannot cancel this order"
                          : "Cancel order"
                      }
                    >
                      <MdCancel size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "12px" }}>
                  No Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerOrders;