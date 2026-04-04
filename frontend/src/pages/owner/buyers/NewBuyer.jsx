import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { addBuyer } from "@/api/buyersAPI";
import "./NewBuyer.css";

const NewBuyer = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    company: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

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
      company: "",
      address: "",
      note: "",
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!formData.phonenumber.trim())
      newErrors.phonenumber = "Phone number is required";

    if (!formData.company.trim())
      newErrors.company = "Company is required";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    if (!formData.password.trim())
      newErrors.password = "Password is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);

      await addBuyer({
        ...formData,
        roleid: "B001",
        is_active: formData.status === "Active",
      });

      alert("Buyer registered successfully!");
      resetForm();
    } catch (error) {
      console.error(
        "Error saving buyer:",
        error.response?.data || error.message
      );
      alert("Failed to save buyer. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buyer-container">
      <h1 className="buyer-title">Register Buyer</h1>

      <form className="buyer-form" onSubmit={handleSubmit}>
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

        <label>NIC</label>
        <input
          type="text"
          name="nic"
          value={formData.nic}
          onChange={handleChange}
          placeholder="NIC number"
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phonenumber"
          value={formData.phonenumber}
          onChange={handleChange}
          placeholder="07X XXX XXXX"
        />
        {errors.phonenumber && (
          <span className="error">{errors.phonenumber}</span>
        )}

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

        <label>Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company or organization name"
        />
        {errors.company && <span className="error">{errors.company}</span>}

        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Company / delivery address"
        />
        {errors.address && <span className="error">{errors.address}</span>}

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
            className="buyer-cancel-btn"
            disabled={loading}
            onClick={() => navigate("/owner/buyers")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="buyer-save-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBuyer;