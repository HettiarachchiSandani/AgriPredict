import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBatches, getBreeds, addBatch, updateBatch } from "@/api/batchAPI";
import "./AddBatch.css";

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    batchId: "",
    batchName: "",
    breedId: "",
    eggType: "",
    startDate: "",

    initialMale: 0,
    initialFemale: 0,
    currentMale: 0,
    currentFemale: 0,

    status: "Active",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const breedData = await getBreeds();
        setBreeds(breedData);

        if (id) {
          const allBatches = await getBatches();
          const batch = allBatches.find(
            (b) => String(b.batchid) === String(id)
          );

          if (batch) {
            const breed = breedData.find(
              (b) => String(b.breedid) === String(batch.breed)
            );

            setFormData({
              batchId: batch.batchid,
              batchName: batch.batchname || "",
              breedId: breed?.breedid || "",
              eggType: breed?.eggtype || "",
              startDate: batch.startdate
                ? batch.startdate.split("T")[0]
                : "",

              initialMale: batch.initial_male || 0,
              initialFemale: batch.initial_female || 0,
              currentMale:
                batch.current_male || batch.initial_male || 0,
              currentFemale:
                batch.current_female || batch.initial_female || 0,

              status: batch.status || "Active",
              note: batch.note || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    if (name === "breedId") {
      const breed = breeds.find(
        (b) => String(b.breedid) === String(value)
      );
      setFormData((prev) => ({
        ...prev,
        eggType: breed?.eggtype || "",
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.batchName.trim())
      newErrors.batchName = "Batch Name is required";

    if (!formData.breedId)
      newErrors.breedId = "Breed/Strain is required";

    if (!formData.startDate)
      newErrors.startDate = "Start Date is required";

    if (formData.initialFemale <= 0)
      newErrors.initialFemale = "Enter valid female count";

    if (formData.currentFemale < 0)
      newErrors.currentFemale = "Invalid female count";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert("Please fix the errors before saving.");
      return;
    }

    const payload = {
      batchname: formData.batchName,
      breed: formData.breedId,
      startdate: formData.startDate,

      initial_male: formData.initialMale,
      initial_female: formData.initialFemale,

      current_male:
        formData.currentMale || formData.initialMale,
      current_female:
        formData.currentFemale || formData.initialFemale,

      status: formData.status,
      note: formData.note,
    };

    try {
      if (id) {
        await updateBatch(id, payload);
        alert("Batch updated successfully!");
      } else {
        const createdBatch = await addBatch(payload);
        if (createdBatch?.batchid) {
          setFormData((prev) => ({
            ...prev,
            batchId: createdBatch.batchid,
          }));
        }
        alert("Batch added successfully!");
      }

      navigate("/owner/batches");
    } catch (error) {
      console.error("Failed to save batch:", error);
      alert("Failed to save batch.");
    }
  };

  return (
    <div className="edit-batch">
      <h1>{id ? "Edit Batch" : "Add New Batch"}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Batch ID</label>
          <input
            type="text"
            value={formData.batchId || "Auto-generated"}
            disabled
          />
        </div>

        <div className="form-row">
          <label>Batch Name *</label>
          <input
            type="text"
            name="batchName"
            value={formData.batchName}
            onChange={handleChange}
          />
          {errors.batchName && (
            <span className="error">{errors.batchName}</span>
          )}
        </div>

        <div className="form-row">
          <label>Breed / Strain *</label>
          <select
            name="breedId"
            value={formData.breedId}
            onChange={handleChange}
          >
            <option value="">Select Breed</option>
            {breeds.map((b) => (
              <option key={b.breedid} value={b.breedid}>
                {b.breedname}
              </option>
            ))}
          </select>
          {errors.breedId && (
            <span className="error">{errors.breedId}</span>
          )}
        </div>

        {formData.eggType && (
          <div className="form-row">
            <label>Egg Type</label>
            <input value={formData.eggType} disabled />
          </div>
        )}

        <div className="form-row">
          <label>Start Date *</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Initial Male Birds *</label>
          <input
            type="number"
            name="initialMale"
            value={formData.initialMale}
            onChange={handleChange}
          />
          {errors.initialMale && (
            <span className="error">{errors.initialMale}</span>
          )}
        </div>

        <div className="form-row">
          <label>Initial Female Birds *</label>
          <input
            type="number"
            name="initialFemale"
            value={formData.initialFemale}
            onChange={handleChange}
          />
          {errors.initialFemale && (
            <span className="error">{errors.initialFemale}</span>
          )}
        </div>

        <div className="form-row">
          <label>Current Male Birds</label>
          <input
            type="number"
            name="currentMale"
            value={formData.currentMale}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Current Female Birds</label>
          <input
            type="number"
            name="currentFemale"
            value={formData.currentFemale}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="form-row">
          <label>Notes</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/owner/batches")}
          >
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default EditBatch;