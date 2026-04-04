import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import "./Dashboard.css";
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

import { getDailySummary } from "../../api/dailyOperationsAPI"; 
import { getPredictedTotalToday } from "../../api/predictionsAPI";
import { getBatchPerformance } from "../../api/batchAPI"; 

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

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [predictedTotalToday, setPredictedTotalToday] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  const [batchScores, setBatchScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryData = await getDailySummary();
        setSummary(summaryData);

        try {
          const totalPrediction = await getPredictedTotalToday();

          setPredictedTotalToday(
            totalPrediction?.predicted_eggs_today ?? null
          );

          setPredictionError(null);
        } catch (err) {
          console.error("Prediction error:", err);

          const message =
            err.response?.data?.error ||
            "Prediction unavailable.";

          setPredictionError(message);
          setPredictedTotalToday(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadBatchScores = async () => {
      try {
        const data = await getBatchPerformance();
        setBatchScores(data);
      } catch (err) {
        console.error("Error fetching batch performance:", err);
      }
    };

    loadBatchScores();
  }, []);

  const stats = !loading && summary
    ? [
        { label: "Eggs Yesterday", value: summary.yesterday_totals.eggs || 0, isRed: false },
        { label: "Feed Consumed Yesterday (kg)", value: summary.yesterday_totals.feed || 0, isRed: false },
        { label: "Mortality Yesterday", value: summary.yesterday_totals.mortality || 0, isRed: true },
        {
          label: "Predicted Production Today",
          value: predictionError
            ? predictionError
            : (predictedTotalToday ?? "Not Available"),
          isRed: !!predictionError,
        }
      ]
    : [
        { label: "Loading...", value: "...", isRed: false },
        { label: "Loading...", value: "...", isRed: false },
        { label: "Loading...", value: "...", isRed: true },
        { label: "Loading...", value: "...", isRed: false },
      ];

  const eggProductionData =
    !loading && summary
      ? (() => {
          const last30Days = summary.last_30_days;

          const labels = last30Days.map(day => day.date);
          const totalEggs = last30Days.map(day => 
            Object.values(day.eggs_per_batch || {}).reduce((sum, val) => sum + val, 0)
          );

          return {
            labels,
            datasets: [
              {
                label: "Total Egg Production",
                data: totalEggs,
                borderColor: "#3a7d44",
                backgroundColor: "rgba(58, 125, 68, 0.2)",
                tension: 0.3,
              }
            ]
          };
        })()
      : { labels: [], datasets: [] };

  const feedUsageData = !loading && summary
    ? (() => {
        const last30Days = summary.last_30_days;
        const labels = last30Days.map(day => day.date);

        const totalFeed = last30Days.map(day =>
          Object.values(day.feed_per_batch || {}).reduce((sum, val) => sum + val, 0)
        );

        return {
          labels,
          datasets: [
            {
              label: "Feed Usage (kg)",
              data: totalFeed,
              backgroundColor: "#3a7d44",
            },
          ],
        };
      })()
    : { labels: [], datasets: [] };

  const mortalityData = !loading && summary
    ? (() => {
        const last30Days = summary.last_30_days;
        const labels = last30Days.map(day => day.date);

        const totalMortality = last30Days.map(day =>
          Object.values(day.mortality_per_batch || {}).reduce((sum, val) => sum + val, 0)
        );

        return {
          labels,
          datasets: [
            {
              label: "Mortality",
              data: totalMortality,
              borderColor: "#f44336",
              backgroundColor: "rgba(244, 67, 54, 0.2)",
              tension: 0.3,
            },
          ],
        };
      })()
    : { labels: [], datasets: [] };

  const sortedBatchScores = [...batchScores].sort((a, b) => {
    const numA = parseInt(a.batchname.replace(/\D/g, ""));
    const numB = parseInt(b.batchname.replace(/\D/g, ""));
    return numA - numB;
  });

  return (
    <div className="owner-dashboard">

      <div className="stats-cards">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.label}</h3>
            <p style={{ color: stat.isRed ? "red" : "green" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="charts-container">
        {[
          { title: "Egg Production", type: "line", data: eggProductionData },
          { title: "Feed Usage", type: "bar", data: feedUsageData },
          { title: "Mortality", type: "line", data: mortalityData },
        ].map((chart, index) => (
          <div key={index} className="chart-card">
            <h4>{chart.title}</h4>
            <div className="chart-wrapper">
              {loading ? (
                <div className="charts-loading-simple">
                  <div className="spinner"></div>
                </div>
              ) : chart.type === "line" ? (
                <Line
                  data={chart.data}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              ) : (
                <Bar
                  data={chart.data}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="batch-performance">
        <h3>Batch Performance</h3>

        {batchScores.length === 0 ? (
          <p>Loading batch performance...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {sortedBatchScores.map((batch) => {
                let color = "black";
                if (batch.status === "Excellent") color = "green";
                else if (batch.status === "Average") color = "orange";
                else if (batch.status === "Needs Attention") color = "red";

                return (
                  <tr key={batch.batchid}>
                    <td>{batch.batchname}</td>
                    <td>{batch.score}</td>
                    <td style={{ color }}>{batch.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}