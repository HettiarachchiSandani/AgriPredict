import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBatchDetails } from "@/api/batchAPI";
import "./BatchDetails.css";

const BatchDetails = () => {
  const { id } = useParams();

  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBatchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getBatchDetails(id);
      if (data) setBatchData(data);
    } catch (err) {
      console.error("Error fetching batch details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  if (loading) return <div>Loading batch details...</div>;
  if (!batchData) return <div>No batch found.</div>;

  return (
    <div className="batch-details-wrapper">
      <h1 className="batch-details-title">Batch Details</h1>

      <div className="batch-card">
        <div className="batch-info">
          <div>
            <strong>Batch ID:</strong> {batchData.batchid}
          </div>
          <div>
            <strong>Batch Name:</strong> {batchData.batchname}
          </div>
          <div>
            <strong>Breed:</strong> {batchData.breedname}
          </div>
          <div>
            <strong>Egg Type:</strong> {batchData.eggtype}
          </div>
          <div>
            <strong>Start Date:</strong> {batchData.startdate}
          </div>

          <div className="counts-section">
            <strong>Initial Count:</strong>
            <div className="counts-row">
              <span className="badge green">Male: {batchData.initial_male}</span>
              <span className="badge green">Female: {batchData.initial_female}</span>
              <span className="badge green">Total: {batchData.initial_total}</span>
            </div>
          </div>

          <div className="counts-section">
            <strong>Current Count:</strong>
            <div className="counts-row">
              <span className="badge green">Male: {batchData.current_male}</span>
              <span className="badge green">Female: {batchData.current_female}</span>
              <span className="badge green">Total: {batchData.current_total}</span>
            </div>
          </div>

          <div className="counts-section">
            <strong>Mortality:</strong>
            <div className="counts-row">
              <span className="badge orange">Male: {batchData.mortality_male}</span>
              <span className="badge orange">Female: {batchData.mortality_female}</span>
              <span className="badge red">Total: {batchData.total_mortality}</span>
            </div>
          </div>

          <div>
            <strong>Status:</strong>{" "}
            <span className={`badge-type ${batchData.status.toLowerCase()}`}>
              {batchData.status}
            </span>
          </div>
          {batchData.note && (
            <div>
              <strong>Note:</strong> {batchData.note}
            </div>
          )}
        </div>

        <div className="batch-metrics">
          <h2>Key Metrics</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Egg Production</td>
                <td className="value">{batchData.total_eggs} eggs</td>
                <td className="trend">Avg per bird: {batchData.avg_eggs_per_bird}</td>
              </tr>
              <tr>
                <td>Feed Consumption</td>
                <td className="value">{batchData.total_feed} kg</td>
                <td className="trend">Feed per egg: {batchData.feed_per_egg} kg</td>
              </tr>
              <tr>
                <td>Mortality Rate</td>
                <td className="value">{batchData.total_mortality}</td>
                <td className="trend">{batchData.mortality_rate}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;