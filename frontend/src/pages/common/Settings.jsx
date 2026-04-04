import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Settings.css";
import { useEffect } from "react";
import api from "@/api/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    soundEnabled: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const profileRes = await api.get("core/profile/");
        const profile = profileRes.data;

        const settingsRes = await api.get("core/settings/");
        const settingsData = settingsRes.data;

        const settings = Array.isArray(settingsData)
          ? settingsData[0]
          : settingsData;

        setForm({
          firstName: profile.firstname || "",
          lastName: profile.lastname || "",
          email: profile.email || "",
          soundEnabled: settings?.sound_enabled ?? true,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

      } catch (err) {
        console.error(err);
        alert("Failed to load profile or settings");
      }

      setLoading(false); 
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      await api.put("core/update-user/", {
        firstname: form.firstName,
        lastname: form.lastName,
        email: form.email,
      });

      const settingsRes = await api.get("core/settings/");
      const settingsData = settingsRes.data;

      const settings = Array.isArray(settingsData)
        ? settingsData[0]
        : settingsData;

      const settingsId = settings?.settingsid; 

      if (settingsId) {
        await api.put(`core/settings/${settingsId}/`, {
          sound_enabled: form.soundEnabled,
        });

        setUser(prev => ({
          ...prev,
          soundEnabled: form.soundEnabled,
        }));
      }

      alert("Account & notification settings saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        alert("Please fill all password fields");
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }

      await api.post("core/change-password/", {
        current_password: form.currentPassword,
        new_password: form.newPassword,
      });

      alert("Password updated successfully");

      setForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to change password");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to deactivate your account?");
    if (!confirmDelete) return;

    try {
      await api.post("core/deactivate-user/");
      alert("Account deactivated");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate account");
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="settings-wrapper">

      <div className="settings-tabs">
        <NavLink
          to="#"
          className={({ isActive }) =>
            "settings-tab" + (activeTab === "settings" ? " active" : "")
          }
          onClick={() => setActiveTab("settings")}
        >
          Account Settings
        </NavLink>
        <NavLink
          to="#"
          className={({ isActive }) =>
            "settings-tab" + (activeTab === "privacy" ? " active" : "")
          }
          onClick={() => setActiveTab("privacy")}
        >
          Privacy Policy
        </NavLink>
        <NavLink
          to="#"
          className={({ isActive }) =>
            "settings-tab" + (activeTab === "terms" ? " active" : "")
          }
          onClick={() => setActiveTab("terms")}
        >
          Terms & Conditions
        </NavLink>
      </div>

      <div className="settings-header">
        <h1>
          {activeTab === "settings"
            ? "Account Settings"
            : activeTab === "privacy"
            ? "Privacy Policy"
            : "Terms & Conditions"}
        </h1>
      </div>

      <div className="settings-content">
        {activeTab === "settings" && (
          <div className="settings-form">
            <div className="section-box">
            <h2>Account</h2>
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
            />

            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <h2>Notifications</h2>
            <label>
            <input
              type="checkbox"
              name="soundEnabled"
              checked={form.soundEnabled}
              onChange={handleChange}
            />
            Notification Sound
          </label>

              <button className="save-btn" onClick={handleSave}>
              Save Account & Notifications
            </button>
          </div>

            <div className="section-box">
            <h2>Password Settings</h2>
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
            />

            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />

              <button className="save-btn password-btn" onClick={handlePasswordChange}>
              Change Password
            </button>
          </div>

            <div className="danger-zone">
              <h2>Danger Zone</h2>

              <p className="warning-text">
                Deactivating your account will disable access. Your data will be kept for system records.
              </p>

              <button className="delete-btn1" onClick={handleDelete}>
                Deactivate Account
              </button>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="policy-content">
            <p>
              <strong>Effective Date:</strong> 14 December 2025
            </p>
            <p>
              AgriPredict (“we”, “our”, or “the App”) is committed to protecting the privacy and security of our users’ information. This Privacy Policy explains how we collect, use, store, and protect information from Owners, Managers, and Buyers using the AgriPredict web application. By using the App, you agree to the terms outlined below.
            </p>

            <h3>1. Information We Collect</h3>
            <p>We collect information to provide, improve, and personalize the App’s features. The information collected may include:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> Name, email address, contact number, role type (Owner, Manager, Buyer), login credentials (encrypted passwords)
              </li>
              <li>
                <strong>Farm & Batch Data (for Owners & Managers):</strong> Layer batch information (e.g., production data, feed records), egg production statistics and feed efficiency metrics, inventory and operational data
              </li>
              <li>
                <strong>Transaction Data (for Buyers):</strong> Order history and purchase requests, billing and delivery information, communication with Owners/Managers
              </li>
              <li>
                <strong>App Usage Data:</strong> IP address, device type, browser information, activity logs, feature usage, and session duration
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> We may use cookies and similar technologies to improve your experience, track analytics, and provide personalized content
              </li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <ul>
              <li>To operate, maintain, and improve the App and its features</li>
              <li>To manage user accounts and authenticate access</li>
              <li>To provide data-driven insights, reports, and AI predictions for farm management</li>
              <li>To facilitate transactions between Buyers, Owners, and Managers</li>
              <li>To communicate important updates, alerts, and system notifications</li>
              <li>To comply with legal obligations and protect the security of the App</li>
            </ul>

            <h3>3. Information Sharing</h3>
            <p>We respect your privacy and do not sell your personal data. Information may be shared only in the following circumstances:</p>
            <ul>
              <li>With Owners and Managers to manage batch operations and supply data insights</li>
              <li>With Buyers to process orders and provide service</li>
              <li>With service providers who help maintain and operate the App</li>
              <li>If required by law or in response to legal processes</li>
              <li>In the event of a merger, acquisition, or sale of App assets</li>
            </ul>

            <h3>4. Data Security</h3>
            <p>We implement reasonable technical and organizational measures to protect your data, including:</p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Secure user authentication</li>
              <li>Regular system monitoring for vulnerabilities</li>
            </ul>
            <p>However, no method of transmission or storage is 100% secure. Users are responsible for keeping login credentials confidential.</p>

            <h3>5. User Rights</h3>
            <p>Users may:</p>
            <ul>
              <li>Access, correct, or update their personal information</li>
              <li>Request deletion of personal data (subject to operational and legal constraints)</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
            <p>To exercise these rights, contact us via <strong>support@agripredict.com</strong>.</p>

            <h3>6. Data Retention</h3>
            <ul>
              <li>Owner & Manager data will be retained as long as the account is active</li>
              <li>Buyer transaction data will be retained for reporting and audit purposes (minimum 5 years)</li>
              <li>Usage logs may be anonymized and retained for analytics</li>
            </ul>

            <h3>7. Cookies & Third-Party Services</h3>
            <p>The App may use third-party analytics and tracking tools (e.g., Google Analytics). Cookies are used to enhance functionality and user experience. Users can adjust browser settings to manage cookies.</p>

            <h3>8. Children’s Privacy</h3>
            <p>AgriPredict is not intended for users under 18 years of age. We do not knowingly collect information from minors.</p>

            <h3>9. Changes to This Policy</h3>
            <p>We may update this Privacy Policy periodically. Changes will be posted on the App with a revised effective date. Users are encouraged to review it regularly.</p>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="policy-content">
            <p><strong>Effective Date:</strong> 14 December 2025</p>
            <p>
              These Terms & Conditions (“Terms”) govern your use of the AgriPredict web application (“App”). By accessing or using the App, you agree to comply with these Terms.
            </p>

            <h3>1. User Eligibility</h3>
            <ul>
              <li>You must be at least 18 years old to use the App.</li>
              <li>Users must provide accurate and complete information during account registration.</li>
              <li>Users are responsible for maintaining the confidentiality of their login credentials.</li>
            </ul>

            <h3>2. User Roles</h3>
            <ul>
              <li>
                <strong>Owner:</strong> Can manage layer batches, view predictions, generate reports, and manage Managers. Responsible for the accuracy of farm and operational data entered.
              </li>
              <li>
                <strong>Manager:</strong> Can update batch data, track operations, and manage farm tasks assigned by the Owner. Must comply with instructions provided by the Owner.
              </li>
              <li>
                <strong>Buyer:</strong> Can place requests/orders, view product availability, and track transactions. Responsible for providing accurate contact and billing information.
              </li>
            </ul>

            <h3>3. Account Responsibilities</h3>
            <ul>
              <li>Users are responsible for all activities performed under their account.</li>
              <li>Users must notify AgriPredict immediately of any unauthorized use of their account.</li>
              <li>AgriPredict reserves the right to suspend or terminate accounts violating these Terms.</li>
            </ul>

            <h3>4. Use of the App</h3>
            <ul>
              <li>Users must not misuse the App or attempt unauthorized access.</li>
              <li>Users must not upload harmful, illegal, or offensive content.</li>
              <li>Owners and Managers must ensure data accuracy; AgriPredict is not liable for incorrect or misleading data.</li>
            </ul>

            <h3>5. Transactions & Orders (for Buyers)</h3>
            <ul>
              <li>Orders placed through the App are subject to confirmation by the Owner/Manager.</li>
              <li>Buyers are responsible for providing accurate delivery information.</li>
              <li>AgriPredict does not directly handle payments; financial transactions occur between Buyers and Owners as per agreed terms.</li>
            </ul>

            <h3>6. Intellectual Property</h3>
            <p>
              All content, software, AI models, and data visualizations in AgriPredict are owned by AgriPredict or its licensors. Users may not reproduce, distribute, or modify any part of the App without written consent.
            </p>

            <h3>7. Data & Privacy</h3>
            <p>
              Use of the App is also governed by our Privacy Policy. Users consent to data collection, processing, and storage as described in the Privacy Policy.
            </p>

            <h3>8. Limitation of Liability</h3>
            <p>
              AgriPredict provides predictive insights and reporting for informational purposes only. We are not liable for financial losses, operational errors, or decisions based on App data. AgriPredict is not responsible for any third-party services used in connection with the App (e.g., payment gateways).
            </p>

            <h3>9. Termination</h3>
            <p>
              AgriPredict may suspend or terminate access to users violating these Terms or engaging in harmful conduct. Users may terminate their account at any time by contacting support.
            </p>

            <h3>10. Governing Law</h3>
            <p>
              These Terms are governed by the laws of Sri Lanka. Any disputes arising will be subject to the jurisdiction of courts in Sri Lanka.
            </p>

            <h3>11. Changes to Terms</h3>
            <p>
              AgriPredict may update these Terms periodically. Changes will be posted on the App with an updated effective date. Continued use of the App after changes constitutes acceptance of the new Terms.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;