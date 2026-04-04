import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { addManager, getManagers } from "@/api/managersAPI";
import "./RegisterManager.css";

const NewManager = ({ managers, setManagers }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    gender: "Male",
    dob: "",
    nic: "",
    phonenumber: "",
    email: "",
    password: "",
    status: "Active",
    note: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      gender: "Male",
      dob: "",
      nic: "",
      phonenumber: "",
      email: "",
      password: "",
      status: "Active",
      note: "",
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const formErrors = {};
    if (!(formData.email || "").trim()) formErrors.email = "Email is required";
    if (!(formData.password || "").trim()) formErrors.password = "Password is required";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstname: formData.firstname || "Manager",
        lastname: formData.lastname || "",
        email: formData.email.trim(),
        password: formData.password,
        nic: formData.nic || null,
        gender: formData.gender,
        dob: formData.dob || null,
        note: formData.note || null,
        phonenumber: formData.phonenumber || null,
        is_active: formData.status === "Active",
      };

      await addManager(payload);

      if (typeof setManagers === "function") {
        const managersList = await getManagers();
        setManagers(managersList);
      }

      alert("Manager added successfully!");
      resetForm();
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = {};
        Object.entries(error.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value.join(", ") : value;
        });
        setErrors(backendErrors);
      } else {
        alert("Failed to add manager. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-container">
      <h1 className="manager-title">Register Manager</h1>

      <form className="manager-form" onSubmit={handleSubmit}>
        <label>First Name</label>
        <input
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          placeholder="Enter first name"
        />
        {errors.firstname && <span className="error">{errors.firstname}</span>}

        <label>Last Name</label>
        <input
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          placeholder="Enter last name"
        />

        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />
        {errors.dob && <span className="error">{errors.dob}</span>}

        <label>NIC</label>
        <input
          type="text"
          name="nic"
          value={formData.nic}
          onChange={handleChange}
          placeholder="NIC number"
        />
        {errors.nic && <span className="error">{errors.nic}</span>}

        <label>Phone Number</label>
        <input
          type="text"
          name="phonenumber"
          value={formData.phonenumber}
          onChange={handleChange}
          placeholder="07X XXX XXXX"
        />
        {errors.phonenumber && <span className="error">{errors.phonenumber}</span>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label>Password</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
          </span>
        </div>
        {errors.password && <span className="error">{errors.password}</span>}

        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <label>Note</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
        />

        <div className="form-buttons">
          <button
            type="button"
            className="manager-cancel-btn"
            onClick={() => navigate("/owner/staff")}
          >
            Cancel
          </button>
          <button type="submit" className="manager-save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewManager;