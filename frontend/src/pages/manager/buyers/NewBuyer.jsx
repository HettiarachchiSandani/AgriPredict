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

    if (!formData.lastname.trim())
      newErrors.lastname = "Last name is required";

    if (!formData.gender)
      newErrors.gender = "Gender is required";

    if (!formData.dob)
      newErrors.dob = "Date of birth is required";

    if (!formData.nic.trim())
      newErrors.nic = "NIC is required";

    if (!formData.phonenumber.trim())
      newErrors.phonenumber = "Phone number is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!formData.password.trim())
      newErrors.password = "Password is required";

    if (!formData.company.trim())
      newErrors.company = "Company is required";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

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

        if (error.response?.data) {
          const backendErrors = {};

          Object.entries(error.response.data).forEach(([key, value]) => {
            backendErrors[key] = Array.isArray(value)
              ? value.join(", ")
              : value;
          });

          setErrors(backendErrors);

          if (error.response.data.email) {
            setErrors((prev) => ({
              ...prev,
              email: "This email is already registered",
            }));
          }
        } else {
          alert("Failed to save buyer. Please try again.");
        }
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buyer-container">
      <h1 className="buyer-title">Register Buyer</h1>
      <form className="buyer-form" onSubmit={handleSubmit}>
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
                      <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
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
                        <button
                          type="button"
                          className="password-toggle-icon"
                          onClick={() => setShowPassword(p => !p)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                      </div>
                      {errors.password && <span className="error">{errors.password}</span>}
              
                      <label htmlFor="status">Status</label>
                      <select id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
              
                      <label htmlFor="company">Company</label>
                      <input
                        id="company"
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company or organization name"
                        required
                      />
                      {errors.company && <span className="error">{errors.company}</span>}
              
                      <label htmlFor="address">Address</label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Company / delivery address"
                        required
                      />
                      {errors.address && <span className="error">{errors.address}</span>}
              
                      <label htmlFor="note">Note</label>
                      <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Additional notes (optional)"
                      />

        <div className="form-buttons">
          <button type="button" className="buyer-cancel-btn" disabled={loading} onClick={() => navigate("/manager/buyers")}>
            Cancel
          </button>
          <button type="submit" className="buyer-save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBuyer;