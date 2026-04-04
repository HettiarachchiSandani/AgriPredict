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
            <label htmlFor="batchName">Batch Name *</label>
          <input
            id="batchName"
            type="text"
            name="batchName"
            value={formData.batchName}
            onChange={handleChange}
            placeholder="Batch Name"
            required
          />
          {errors.batchName && <span className="error">{errors.batchName}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="breedId">Breed / Strain *</label>
          <select
            id="breedId"
            name="breedId"
            value={formData.breedId}
            onChange={handleChange}
            required
          >
            <option value="">Select Breed</option>
            {breeds.map((b) => (
              <option key={b.breedid} value={b.breedid}>
                {b.breedname}
              </option>
            ))}
          </select>
          {errors.breedId && <span className="error">{errors.breedId}</span>}
        </div>

        {formData.eggType && (
          <div className="form-row">
            <label htmlFor="eggType">Egg Type</label>
            <input
              id="eggType"
              value={formData.eggType}
              disabled
            />
          </div>
        )}

        <div className="form-row">
          <label htmlFor="startDate">Start Date *</label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          {errors.startDate && <span className="error">{errors.startDate}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="initialMale">Initial Male Birds *</label>
          <input
            id="initialMale"
            type="number"
            name="initialMale"
            value={formData.initialMale}
            placeholder="Initial Male Bird Count"
            onChange={handleChange}
          />
          {errors.initialMale && <span className="error">{errors.initialMale}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="initialFemale">Initial Female Birds *</label>
          <input
            id="initialFemale"
            type="number"
            name="initialFemale"
            value={formData.initialFemale}
            onChange={handleChange}
            placeholder="Initial Female Bird Count"
            required
          />
          {errors.initialFemale && <span className="error">{errors.initialFemale}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="currentMale">Current Male Birds</label>
          <input
            id="currentMale"
            type="number"
            name="currentMale"
            value={formData.currentMale}
            placeholder="Current Male Bird Count"
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="currentFemale">Current Female Birds</label>
          <input
            id="currentFemale"
            type="number"
            name="currentFemale"
            value={formData.currentFemale}
            placeholder="Current Female Bird Count"
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="status">Status</label>
          <select
            id="status"
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
          <label htmlFor="note">Notes</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Note..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/owner/batches")}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default EditBatch;