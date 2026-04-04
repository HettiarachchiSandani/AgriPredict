import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import "./Login.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, rememberMe); 
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <img src={logo} alt="Farm Logo" className="logo" />
        </div>

        <div className="welcome-section">
          <h1 className="welcome-title">Welcome!</h1>
          <p className="welcome-subtitle">
            Streamlining farm operations and delivering actionable insights for smarter agricultural decisions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">Log in</h2>

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

          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="options-row">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/reset-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}