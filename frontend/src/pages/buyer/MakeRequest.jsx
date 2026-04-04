import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBreeds } from "@/api/batchAPI";
import { addOrder } from "@/api/orderAPI";
import useAuth from "@/hooks/useAuth"; 
import "./MakeRequest.css";

const MakeRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    breedid: "",
    eggType: "",
    quantity: "",
    note: "",
    orderedDate: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const breedData = await getBreeds();
        setBreeds(breedData);
      } catch (err) {
        console.error("Failed to fetch breeds:", err);
        if (err.detail === "You must be logged in as a buyer") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    if (name === "breedid") {
      const breed = breeds.find((b) => b.breedid === value);
      setFormData((prev) => ({
        ...prev,
        eggType: breed?.eggtype || "",
      }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.breedid) newErrors.breedid = "Breed is required";
    if (!formData.orderedDate)
      newErrors.orderedDate = "Ordered date is required";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Enter a valid quantity";
    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    return;
  }

  try {
    const payload = {
      buyerid: user.userid,
      breedid: formData.breedid,
      ordereddate: formData.orderedDate,
      quantity: formData.quantity,
      note: formData.note,
      accepted: null,
      completed: false,
    };

    await addOrder(payload);

    alert("Request submitted successfully!");

    setFormData({
      breedid: "",
      eggType: "",
      quantity: "",
      note: "",
      orderedDate: "",
    });
    setErrors({});
    
  } catch (err) {
    console.error("Failed to submit request:", err);
    alert("Failed to submit request. Please try again.");
  }
};

  if (loading) return <div>Loading make request...</div>;

  return (
    <div className="request-page">
      <h1>New Egg Request</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Breed / Strain *</label>
          <select
            name="breedid"
            value={formData.breedid}
            onChange={handleChange}
          >
            <option value="">Select Breed</option>
            {breeds.map((b) => (
              <option key={b.breedid} value={b.breedid}>
                {b.breedname}
              </option>
            ))}
          </select>
          {errors.breedid && <span className="error">{errors.breedid}</span>}
        </div>

        {formData.eggType && (
          <div className="form-row">
            <label>Egg Type</label>
            <input value={formData.eggType} disabled />
          </div>
        )}

        <div className="form-row">
          <label>Order Date *</label>
          <input
            type="date"
            name="orderedDate"
            value={formData.orderedDate}
            onChange={handleChange}
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
          />
          {errors.orderedDate && (
            <span className="error">{errors.orderedDate}</span>
          )}
        </div>

        <div className="form-row">
          <label>Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
          />
          {errors.quantity && <span className="error">{errors.quantity}</span>}
        </div>

        <div className="form-row">
          <label>Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                breedid: "",
                eggType: "",
                quantity: "",
                note: "",
                orderedDate: "",
              });
              setErrors({});
            }}
          >
            Cancel
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default MakeRequest;