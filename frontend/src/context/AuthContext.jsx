import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false); 
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (!token || token === "undefined" || token === "null") {
      setUser(null);
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    axios
      .get("http://localhost:8000/api/core/get-user/")
      .then((res) => {
        const u = res.data;

        const normalizedUser = {
          firstname: u.firstname || u.firstName || "",
          lastname: u.lastname || u.lastName || "",
          roleid: u.roleid || "",
          soundEnabled: u.sound_enabled ?? true,
        };

        setUser(normalizedUser);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expiryTime = payload.exp * 1000;
          const currentTime = Date.now();

          const timeUntilExpiry = expiryTime - currentTime;
          const warningTime = timeUntilExpiry - 5 * 60 * 1000;

          if (warningTime > 0) {
            setTimeout(() => {
              setShowWarning(true);
            }, warningTime);
          }

          if (timeUntilExpiry > 0) {
            setTimeout(() => {
              logout();
            }, timeUntilExpiry);
          }
        } catch (e) {
          console.log("Token decode error:", e);
        }
      })
      .catch((error) => {
        console.log("Token invalid or API error:", error.message);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("access_token");
          delete axios.defaults.headers.common["Authorization"];
        }

        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/core/supabase-login/",
        { email, password }
      );

      const { access, user: djangoUser } = response.data;

      if (rememberMe) {
        localStorage.setItem("access_token", access);
      } else {
        sessionStorage.setItem("access_token", access);
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser({
        ...djangoUser,
        soundEnabled: djangoUser.sound_enabled ?? true,
      });

      const role = djangoUser.roleid;

      if (role === "A002") navigate("/owner/dashboard", { replace: true });
      else if (role === "A003") navigate("/manager/dashboard", { replace: true });
      else if (role === "B001") navigate("/buyer/dashboard", { replace: true });
      else navigate("/", { replace: true });

      console.log("Logged in successfully:", djangoUser);
    } catch (error) {
      console.error("Login error:", error);

      let message = "Login failed";

      if (error.response) {
        if (error.response.status === 401) {
          message = "Invalid email or password";
        } else if (error.response.status === 400) {
          message = "Invalid request. Please check your input.";
        } else if (error.response.status >= 500) {
          message = "Server error. Please try again later.";
        } else {
          message = "Something went wrong.";
        }
      } else {
        message = "Network error. Please check your connection.";
      }

      alert(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {showWarning && (
        <div className="session-popup">
          <div className="popup-box">
            <p>⚠️ Your session will expire in 5 minutes!</p>
            <button onClick={() => setShowWarning(false)}>OK</button>
          </div>
        </div>
      )}

      {children}
    </AuthContext.Provider>
  );
};