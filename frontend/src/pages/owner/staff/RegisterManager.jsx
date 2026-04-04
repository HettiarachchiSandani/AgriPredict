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
    if (!(formData.firstname || "").trim())
      formErrors.firstname = "First name is required";

    if (!(formData.lastname || "").trim())
      formErrors.lastname = "Last name is required";

    if (!(formData.gender || "").trim())
      formErrors.gender = "Gender is required";

    if (!(formData.dob || "").trim())
      formErrors.dob = "Date of birth is required";

    if (!(formData.phonenumber || "").trim())
      formErrors.phonenumber = "Phone number is required";

    if (!(formData.nic || "").trim())
      formErrors.nic = "NIC is required";

    if (!(formData.email || "").trim())
      formErrors.email = "Email is required";

    if (!(formData.password || "").trim())
      formErrors.password = "Password is required";

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

      <form className="manager-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="firstname">First Name</label>
          <input
            id="firstname"
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
          {errors.firstname && <span className="error">{errors.firstname}</span>}

          <label htmlFor="lastname">Last Name</label>
          <input
            id="lastname"
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
          {errors.lastname && <span className="error">{errors.lastname}</span>}

          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <span className="error">{errors.gender}</span>}

          <label htmlFor="dob">Date of Birth</label>
          <input
            id="dob"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          {errors.dob && <span className="error">{errors.dob}</span>}

          <label htmlFor="nic">NIC</label>
          <input
            id="nic"
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            placeholder="NIC number"
            required
          />
          {errors.nic && <span className="error">{errors.nic}</span>}

          <label htmlFor="phonenumber">Phone Number</label>
          <input
            id="phonenumber"
            type="text"
            name="phonenumber"
            value={formData.phonenumber}
            onChange={handleChange}
            placeholder="07X XXX XXXX"
            required
          />
          {errors.phonenumber && <span className="error">{errors.phonenumber}</span>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </span>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}

          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <label htmlFor="note">Note</label>
          <textarea
            id="note"
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