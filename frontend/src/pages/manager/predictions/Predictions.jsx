import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { MdRefresh } from "react-icons/md";

import { generatePrediction, getBatches } from "@/api/predictionsAPI";
import { getBatchDetails } from "@/api/batchAPI";
import api from "@/api/api";

import "./Predictions.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Predictions = () => {
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState("");
  const [predictionType, setPredictionType] = useState("egg-production");

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [historyEggs, setHistoryEggs] = useState([]);
  const [historyMortality, setHistoryMortality] = useState([]);
  const [historyLabels, setHistoryLabels] = useState([]);
  const [actualEggs, setActualEggs] = useState([]);
  const [actualMortality, setActualMortality] = useState([]);
  const [predEggs, setPredEggs] = useState([]);
  const [predMortality, setPredMortality] = useState([]);
  const [shapValues, setShapValues] = useState({});
  const [nextPredictionDate, setNextPredictionDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await getBatches();
        setBatches(data);
        if (data.length > 0) setBatch(data[0].batchid);
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setLoadingBatches(false);
      }
    };
    loadBatches();
  }, []);

  const handleGenerate = async () => {
    if (!batch) return alert("Select a batch");

    try {
      setLoadingPrediction(true);

      const batchData = await getBatchDetails(batch);
      if (!batchData) return alert("Batch details not found");

      const payload = { batchid: batchData.batchid };
      const res = await generatePrediction(payload);

      const today = new Date();
      const past7Days = new Date();
      past7Days.setDate(today.getDate() - 6);
      const startStr = past7Days.toISOString().split("T")[0];
      const endStr = today.toISOString().split("T")[0];

      const dailyOpsRes = await api.get(
        `/batches/dailyoperations/?batch=${batch}&start_date=${startStr}&end_date=${endStr}`
      );
      const batchOps = dailyOpsRes.data || [];

      const totalBirds = batchData.currentcount ?? batchData.initialcount ?? 1;

      const actualRecords = batchOps
        .filter(
          (d) =>
            d.eggcount != null ||
            (d.male_mortality != null && d.female_mortality != null)
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const last7Records = actualRecords.slice(-7);

      const last7DaysDates = last7Records.map((d) => d.date);
      const eggs = last7Records.map((d) => d.eggcount ?? null);
      const mortality = last7Records.map((d) =>
        d.male_mortality != null && d.female_mortality != null
          ? (d.male_mortality + d.female_mortality) / totalBirds
          : null
      );

      const latestActualDate =
        last7Records.length > 0
          ? new Date(last7Records[last7Records.length - 1].date)
          : new Date();

      const nextDayStr = new Date(
        latestActualDate.getTime() + 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0];

      // Correct: align predicted arrays AFTER creating labels
      const newLabels = [...last7DaysDates, nextDayStr];

      const predEggsAligned = newLabels.map((_, i) =>
        i === newLabels.length - 2 ? eggs[eggs.length - 1] ?? null :
        i === newLabels.length - 1 ? res.predictedeggcount ?? null :
        null
      );

      const predMortalityAligned = newLabels.map((_, i) =>
        i === newLabels.length - 2 ? mortality[mortality.length - 1] ?? null :
        i === newLabels.length - 1 ? res.mortality_probability ?? null :
        null
      );

      setNextPredictionDate(nextDayStr);
      setHistoryLabels(newLabels);
      setHistoryEggs([...eggs, res.predictedeggcount ?? null]);
      setHistoryMortality([...mortality, res.mortality_probability ?? null]);

      setActualEggs(eggs);
      setActualMortality(mortality);
      setPredEggs(predEggsAligned);
      setPredMortality(predMortalityAligned);

      if (res.shap_eggs || res.shap_mortality) {
        setShapValues({ eggs: res.shap_eggs, mortality: res.shap_mortality });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Prediction failed. Please try again.";
      console.error(errorMsg);
      alert(errorMsg);

      setHistoryLabels([]);
      setActualEggs([]);
      setActualMortality([]);
      setPredEggs([]);
      setPredMortality([]);
      setShapValues({});
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    if (!shapValues) return;

    const renderShapChart = (id, values) => {
      const ctx = document.getElementById(id)?.getContext("2d");
      if (!ctx) return;

      new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(values),
          datasets: [
            {
              label: "SHAP Value",
              data: Object.values(values),
              backgroundColor: Object.values(values).map((v) =>
                v >= 0 ? "#4CAF50" : "#E53935"
              ),
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Impact: ${ctx.raw.toFixed(3)}`,
              },
            },
          },
          scales: {
            x: { beginAtZero: true, grid: { color: "#eee" } },
            y: { grid: { display: false } },
          },
        },
      });
    };

    if (shapValues.eggs) renderShapChart("shapEggsChart", shapValues.eggs);
    if (shapValues.mortality)
      renderShapChart("shapMortalityChart", shapValues.mortality);
  }, [shapValues]);

  if (loadingBatches) return <div>Loading batches...</div>;
  if (loadingPrediction) return <div>Generating prediction...</div>;

  const eggData = {
    labels: historyLabels,
    datasets: [
      {
        label: "Actual Production",
        data: actualEggs,
        borderColor: "#4CAF50",
        tension: 0.4,
        spanGaps: true,
      },
      {
        label: "Predicted Production",
        data: predEggs,
        borderColor: "#2196F3",
        borderDash: [5, 5],
        tension: 0.4,
        spanGaps: true,
      },
    ],
  };

  const mortalityData = {
    labels: historyLabels,
    datasets: [
      {
        label: "Actual Mortality",
        data: actualMortality,
        borderColor: "#E53935",
        tension: 0.4,
        spanGaps: true,
      },
      {
        label: "Predicted Mortality",
        data: predMortality,
        borderColor: "#FB8C00",
        borderDash: [5, 5],
        tension: 0.4,
        spanGaps: true,
      },
    ],
  };

  return (
    <div className="predictions-page">
      {errorMessage && (
        <div className="error-popup">
          <div className="error-box">
            <h3>⚠️ Prediction Error</h3>
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage("")}>OK</button>
          </div>
        </div>
      )}
      <div className="predictions-top-header">
        <h1>Predictions Overview</h1>
      </div>

      <div className="predictions-filters">
        <div className="filter-item">
          <label>Batch</label>
          <select value={batch} onChange={(e) => setBatch(e.target.value)}>
            {batches.map((b) => (
              <option key={b.batchid} value={b.batchid}>
                {b.batchname}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Prediction Type</label>
          <select
            value={predictionType}
            onChange={(e) => setPredictionType(e.target.value)}
          >
            <option value="egg-production">Egg Production</option>
            <option value="mortality">Mortality</option>
          </select>
        </div>

        <div className="filter-item">
          <button className="generate-btn" onClick={handleGenerate}>
            <MdRefresh /> Generate
          </button>
        </div>
      </div>

      <div className="predictions-main-content">
        <div className="charts">
          {predictionType === "egg-production" && (
            <div className="chart-box">
              <h3>Egg Production Forecast</h3>
              <Line data={eggData} />
            </div>
          )}

          {predictionType === "mortality" && (
            <div className="chart-box">
              <h3>Mortality Forecast</h3>
              <Line data={mortalityData} />
            </div>
          )}
        </div>

        <div className="info-boxes">
          <div className="info-box green">
            <h4>Egg Production</h4>
            <p>
              <strong>{predEggs[predEggs.length - 1] ?? "--"}</strong> predicted
              for <strong>{nextPredictionDate ?? "--"}</strong>
            </p>
          </div>

          <div className="info-box red">
            <h4>Mortality Risk</h4>
            <p>
              <strong>
                {predMortality.length > 0 &&
                predMortality[predMortality.length - 1] != null
                  ? (predMortality[predMortality.length - 1] * 100).toFixed(2)
                  : "--"}
              </strong>{" "}
              % predicted for <strong>{nextPredictionDate ?? "--"}</strong>
            </p>
          </div>
        </div>
      </div>

      {Object.keys(shapValues).length > 0 && (
        <div className="shap-container">
          <div className="shap-header">
            <h2>Explainable AI – Feature Impact Analysis</h2>
            <p>These features influenced the prediction result</p>
          </div>

          <div className="shap-cards">
            {shapValues.eggs && (
              <div className="shap-card">
                <h3>Egg Production Model</h3>
                <canvas id="shapEggsChart"></canvas>
              </div>
            )}

            {shapValues.mortality && (
              <div className="shap-card">
                <h3>Mortality Model</h3>
                <canvas id="shapMortalityChart"></canvas>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;