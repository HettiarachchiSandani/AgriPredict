import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import logo from "../../assets/logo.png";

export default function ResetPasswordConfirm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/core/confirm-password-reset/", {
        uid,
        token,
        password,
      });

      setSuccess(true);
      setError("");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("Invalid or expired link");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo-section">
          <img src={logo} alt="Farm Logo" className="logo" />
        </div>

        <div className="welcome-section">
          <h1 className="welcome-title">Set New Password</h1>
          <p className="welcome-subtitle">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label className="input-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter confirm password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Reset Password
          </button>

          {error && (
            <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ color: "#2E7D32", textAlign: "center", marginTop: "10px" }}>
              Password reset successful! Redirecting to login...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}