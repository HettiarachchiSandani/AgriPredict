import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import logo from "../../assets/logo.png";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/api/core/request-password-reset/", { email });

      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      setSubmitted(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <img src={logo} alt="Farm Logo" className="logo" />
        </div>

        <div className="welcome-section">
          <h1 className="welcome-title">Reset Password</h1>
          <p className="welcome-subtitle">
            Enter your registered email address below, and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Send Reset Link
          </button>

          {submitted && (
            <p style={{ color: "#2E7D32", textAlign: "center", marginTop: "10px" }}>
              If this email exists in our system, a reset link has been sent.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}