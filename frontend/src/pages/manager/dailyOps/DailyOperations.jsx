import React, { useState, useEffect } from "react";
import {
  getBatches,
  getFeedStocks,
  addDailyOperation
} from "@/api/dailyOperationsAPI";
import "./DailyOperations.css";

const DailyOperation = () => {
  const [formData, setFormData] = useState({
    date: "",
    batchid: "",
    feedType: "",
    feedUsage: "",
    waterUsed: "",
    eggProduction: "",
    avgEggWeight: "",
    maleMortality: "",
    femaleMortality: "",
    note: "",
  });

  const [batches, setBatches] = useState([]);
  const [feedStocks, setFeedStocks] = useState([]);
  const [feedTypes, setFeedTypes] = useState([]);
  const [remainingMale, setRemainingMale] = useState(0);
  const [remainingFemale, setRemainingFemale] = useState(0);
  const [currentFeedQty, setCurrentFeedQty] = useState(0);
  const selectedBatch = batches.find(
    b => b.batchid === formData.batchid
  );

  const getLocalDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const fetchDropdownData = async () => {
    try {
      const batchData = await getBatches();
      setBatches(
        batchData.sort((a, b) =>
          a.batchname.localeCompare(b.batchname)
        )
      );

      const feedData = await getFeedStocks();
      setFeedStocks(feedData);
      setFeedTypes(
        [...new Set(feedData.map(f => f.feedtype))].sort()
      );
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const selectedBatch = batches.find(
      b => b.batchid === formData.batchid
    );

    const maleMort = parseInt(formData.maleMortality) || 0;
    const femaleMort = parseInt(formData.femaleMortality) || 0;

    if (selectedBatch) {
      setRemainingMale(
        Math.max(selectedBatch.current_male - maleMort, 0)
      );
      setRemainingFemale(
        Math.max(selectedBatch.current_female - femaleMort, 0)
      );
    } else {
      setRemainingMale(0);
      setRemainingFemale(0);
    }
  }, [
    formData.batchid,
    formData.maleMortality,
    formData.femaleMortality,
    batches
  ]);

  useEffect(() => {
    const selectedFeed = feedStocks.find(
      f => f.feedtype === formData.feedType
    );
    const usage = parseFloat(formData.feedUsage) || 0;

    if (selectedFeed) {
      setCurrentFeedQty(
        Math.max(selectedFeed.quantity - usage, 0)
      );
    } else {
      setCurrentFeedQty(0);
    }
  }, [formData.feedType, formData.feedUsage, feedStocks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const selectedBatch = batches.find(b => b.batchid === formData.batchid);
  const selectedFeed = feedStocks.find(f => f.feedtype === formData.feedType);

  if (!selectedBatch || !selectedFeed || !formData.date) {
    alert("Batch, Feed Type, and Date are required.");
    return;
  }

  const maleMort = parseInt(formData.maleMortality) || 0;
  const femaleMort = parseInt(formData.femaleMortality) || 0;
  const feedUsageAmount = parseFloat(formData.feedUsage) || 0;
  const waterUsedAmount = parseFloat(formData.waterUsed) || 0;
  const eggCount = parseInt(formData.eggProduction) || 0;
  const avgEggWeight = parseFloat(formData.avgEggWeight) || 0;

  if (maleMort > selectedBatch.current_male) {
    alert("Male mortality exceeds current male birds!");
    return;
  }
  if (femaleMort > selectedBatch.current_female) {
    alert("Female mortality exceeds current female birds!");
    return;
  }
  if (feedUsageAmount > selectedFeed.quantity) {
    alert(`Not enough feed stock! Available: ${selectedFeed.quantity} kg`);
    return;
  }

  try {
    const payload = {
      batch: selectedBatch.batchid,  
      stock: selectedFeed.stockid || null,   
      date: formData.date,
      feedusage: feedUsageAmount,
      water_used: waterUsedAmount,
      eggcount: eggCount,
      avgeggweight: avgEggWeight,
      male_mortality: maleMort,
      female_mortality: femaleMort,
      notes: formData.note,
    };

    console.log("Submitting payload:", payload); 

    const savedOperation = await addDailyOperation(payload);

    alert(
      `Daily operation saved! ID: ${savedOperation.id || savedOperation.operationid}`
    );

    handleReset();
    fetchDropdownData();

  } catch (err) {
    const errorMessage =
      err.feedusage?.[0] ||
      err.male_mortality?.[0] ||
      err.female_mortality?.[0] ||
      err.non_field_errors?.[0] ||
      err.detail ||
      "Something went wrong";

    alert(errorMessage);
  }
};

  const handleReset = () => {
    setFormData({
      date: "",
      batchid: "",
      feedType: "",
      feedUsage: "",
      waterUsed: "",
      eggProduction: "",
      avgEggWeight: "",
      maleMortality: "",
      femaleMortality: "",
      note: "",
    });
    setRemainingMale(0);
    setRemainingFemale(0);
    setCurrentFeedQty(0);
  };

  return (
    <div className="daily-operation">
      <h1>Daily Farm Operations</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={getLocalDate()}
            min={selectedBatch?.start_date}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="batchid">Batch</label>
          <select
            id="batchid"
            name="batchid"
            value={formData.batchid}
            onChange={handleChange}
            required
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.batchid} value={batch.batchid}>
                {batch.batchname}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="feedType">Feed Type</label>
          <select
            id="feedType"
            name="feedType"
            value={formData.feedType}
            onChange={handleChange}
            required
          >
            <option value="">Select Feed Type</option>
            {feedTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {formData.feedType && (
            <small>Remaining Feed: {currentFeedQty.toFixed(2)} kg</small>
          )}
        </div>

        <div className="form-row">
          <label htmlFor="feedUsage">Feed Usage (kg)</label>
          <input
            id="feedUsage"
            type="number"
            name="feedUsage"
            value={formData.feedUsage}
            onChange={handleChange}
            placeholder="Feed Usage"
            step="0.1"
            min="0"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="waterUsed">Water Used (liters)</label>
          <input
            id="waterUsed"
            type="number"
            name="waterUsed"
            value={formData.waterUsed}
            onChange={handleChange}
            placeholder="Water Used"
            step="0.1"
            min="0"
          />
        </div>

        <div className="form-row">
          <label htmlFor="eggProduction">Egg Production</label>
          <input
            id="eggProduction"
            type="number"
            name="eggProduction"
            value={formData.eggProduction}
            onChange={handleChange}
            placeholder="Egg Prdoduction"
            min="0"
          />
        </div>

        <div className="form-row">
          <label htmlFor="avgEggWeight">Average Egg Weight (g)</label>
          <input
            id="avgEggWeight"
            type="number"
            name="avgEggWeight"
            value={formData.avgEggWeight}
            onChange={handleChange}
            placeholder="Average Egg Weight"
            step="0.1"
            min="0"
          />
        </div>

        <div className="form-row">
          <label htmlFor="maleMortality">Male Mortality</label>
          <input
            id="maleMortality"
            type="number"
            name="maleMortality"
            value={formData.maleMortality}
            onChange={handleChange}
            placeholder="Male Mortality"
            min="0"
          />
          <small>Remaining Males: {remainingMale}</small>
        </div>

        <div className="form-row">
          <label htmlFor="femaleMortality">Female Mortality</label>
          <input
            id="femaleMortality"
            type="number"
            name="femaleMortality"
            value={formData.femaleMortality}
            placeholder="Female Mortality"
            onChange={handleChange}
            min="0"
          />
          <small>Remaining Females: {remainingFemale}</small>
        </div>

        <div className="form-row">
          <label htmlFor="note">Note</label>
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
          <button type="button" onClick={handleReset}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default DailyOperation;