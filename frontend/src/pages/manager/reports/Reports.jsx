import React, { useState, useEffect } from "react";
import "./Reports.css";

import {
  getReports,
  generateReport as generateReportAPI,
  downloadReport as downloadReportAPI
} from "@/api/reportsAPI";
import { getBatches } from "@/api/batchAPI";

const Reports = () => {
  const [formData, setFormData] = useState({
    reportType: "",
    dateFrom: "",
    dateTo: "",
    batch: "",
  });

  const [generatedReports, setGeneratedReports] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [batchOptions, setBatchOptions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBatches();
        setBatchOptions(data);
      } catch (err) {
        console.error("Error loading batches:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(() => fetchReports(), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setGeneratedReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const reportTypeMap = {
    "Batch Report": "batch",
    "Feed Report": "feed",
    "Order Report": "order",
    "Daily Operations Report": "daily",
  };

  const reportTypes = ["", ...Object.keys(reportTypeMap)];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "reportType" ? { batch: "" } : {}),
    }));
  };

  const showBatchDropdown = ["Batch Report", "Daily Operations Report"].includes(
    formData.reportType
  );

  const generateReport = async (e) => {
    e.preventDefault();

    if (!formData.reportType) {
      alert("Please select a report type!");
      return;
    }

    if (isDateRequired && (!formData.dateFrom || !formData.dateTo)) {
      alert(`Please select both Start Date and End Date for ${formData.reportType}!`);
      return;
    }

    if (formData.dateFrom && formData.dateTo) {
      if (new Date(formData.dateTo) < new Date(formData.dateFrom)) {
        alert("End Date cannot be earlier than Start Date!");
        return;
      }
    }

    try {
      const payload = {
        type: reportTypeMap[formData.reportType],
        batchid: showBatchDropdown ? formData.batch || null : null,
        date_from: formData.dateFrom || undefined,
        date_to: formData.dateTo || undefined,
      };

      const data = await generateReportAPI(payload);

      if (data.error) {
        alert(data.error);
        return;
      }

      setSelectedReport({
        ...formData,
        batch: showBatchDropdown && formData.batch ? formData.batch : null,
        data: data.data || [],
      });

      setShowPreview(true);
    } catch (error) {
      console.error(error);
      alert("Error generating report");
    }
  };

  const downloadReport = async () => {
    if (!selectedReport) {
      alert("Please generate report first!");
      return;
    }

    try {
      await downloadReportAPI({
        type: reportTypeMap[selectedReport.reportType],
        batchid:
          ["Batch Report", "Daily Operations Report"].includes(selectedReport.reportType) &&
          selectedReport.batch
            ? selectedReport.batch
            : null,
        date_from: selectedReport.dateFrom || null,
        date_to: selectedReport.dateTo || null,
      });

      fetchReports();
    } catch (error) {
      console.error(error);
      alert("Error downloading report");
    }
  };

  const requiresDates = [
    "Feed Report",
    "Order Report",
    "Daily Operations Report"
  ];

  const isDateRequired = requiresDates.includes(formData.reportType);

  const isValid =
    formData.reportType &&
    (!isDateRequired || (formData.dateFrom && formData.dateTo));

  return (
    <div className="reports-page">
      <div className="reports-top-header">
        <h1>Report Overview</h1>
      </div>

      <div className="reports-card">
        <div className="reports-section-title">Report Filters</div>

        <form onSubmit={generateReport}>
          <div className="reports-form-row">
            {/* Report Type */}
            <div className="reports-form-group">
              <label>Report Type</label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                required
              >
                {reportTypes.map((t, i) => (
                  <option key={i} value={t}>
                    {t === "" ? "Report Type" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="reports-form-group">
              <label>Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={formData.dateFrom}
                onChange={handleChange}
              />
            </div>

            <div className="reports-form-group">
              <label>Date To</label>
              <input
                type="date"
                name="dateTo"
                value={formData.dateTo}
                onChange={handleChange}
              />
            </div>

            {showBatchDropdown && (
              <div className="reports-form-group">
                <label>Batch</label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                >
                  <option value="">All Batch</option>
                  {batchOptions.map((b) => (
                    <option key={b.batchid} value={b.batchid}>
                      {b.batchname}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="reports-center-btn">
            <button
              type="submit"
              className="reports-generate-btn"
              disabled={!isValid}
            >
              Generate Report
            </button>
          </div>
        </form>
      </div>

      <div className="reports-preview-section">
        <div className="reports-preview-title">Report Preview</div>

        <div className="reports-preview-box">
          {showPreview && selectedReport && selectedReport.data?.length > 0 ? (
            <table className="reports-preview-table">
              <thead>
                <tr>
                  {Object.keys(selectedReport.data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedReport.data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row).map((key) => (
                      <td key={key}>{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="reports-preview-placeholder">
              No data to preview
            </div>
          )}
        </div>

        <div className="reports-download-row">
          <button className="reports-download-btn" onClick={downloadReport}>
            Download Excel
          </button>
        </div>
      </div>

      <div className="reports-card">
        <div className="reports-section-title">Generated Reports</div>

        <table className="reports-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Date</th>
              <th>Report Type</th>
              <th>Batch</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(generatedReports) &&
              generatedReports
                .slice(-5) 
                .reverse()
                .map((r) => (
                  <tr key={r.reportid}>
                    <td>{r.reportid}</td>
                    <td>{r.generateddate}</td>
                    <td>{r.type}</td>
                    <td>{r.batchid || "-"}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;