import React, { useEffect, useState } from "react";
import "./Records.css";
import api from "@/api/api";
import { getBatches } from "@/api/batchAPI";
import { getDailyOperationByOperationId } from "@/api/dailyOperationsAPI";
import { formatToSriLankaTime } from "@/utils/time"; 

const RecordPage = () => {
  const [records, setRecords] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [filters, setFilters] = useState({ batchId: "", dateFrom: "", dateTo: "" });
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingOperation, setLoadingOperation] = useState(false);

  const fetchData = async (url = null) => {
  setLoadingRecords(true);

  try {
    const response = url
      ? await api.get(url)
      : await api.get("reports/records/");

    const data = response.data;

    const recordsData = data.results || [];

    setRecords(recordsData);
    setNextPage(data.next);
    setPrevPage(data.previous);

    const batchesData = await getBatches();
    console.log("BATCH API FULL RESPONSE:", batchesData);
    setBatches(batchesData || []);

    console.log("FIRST RECORD:", recordsData?.[0]);
    console.log("FIRST BATCH:", batchesData?.[0]);

  } catch (err) {
    console.error("Error fetching data:", err);
  }

  setLoadingRecords(false);
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "dateTo" && filters.dateFrom && value < filters.dateFrom) {
      alert("End date cannot be earlier than Start date");
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () =>
    setFilters({ batchId: "", dateFrom: "", dateTo: "" });

  const filteredRecords = records.filter((record) => {
    const recordDate = record.timestamp.split(" ")[0]; 
    const matchBatch = filters.batchId
    ? String(record.batchid) === String(filters.batchId)
    : true;
    const matchDateFrom = filters.dateFrom ? recordDate >= filters.dateFrom : true;
    const matchDateTo = filters.dateTo ? recordDate <= filters.dateTo : true;
    return matchBatch && matchDateFrom && matchDateTo;
  });

  const handleSelectRecord = async (record) => {
    setSelectedRecord(record);
    setLoadingOperation(true);
    try {
      const operation = await getDailyOperationByOperationId(record.operationid);
      setSelectedOperation(operation);
    } catch (err) {
      console.error("Error fetching operation:", err);
      setSelectedOperation(null);
    }
    setLoadingOperation(false);
  };

  if (loadingRecords) return <div>Loading records...</div>;

  return (
    <div className="records-page">
      <div className="records-header">
        <h1>Record Overview</h1>
      </div>

      <div className="records-filters">
        <div className="filter-item">
          <label htmlFor="batchId">Batch</label>
          <select
            id="batchId"
            name="batchId"
            value={filters.batchId}
            onChange={handleFilterChange}
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.batchid} value={batch.batchid}>
                {batch.batchid || batch.batchname}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="dateFrom">Start Date</label>
          <input
            type="date"
            id="dateFrom"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="dateTo">End Date</label>
          <input
            type="date"
            id="dateTo"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-item">
          <label>Reset</label>
          <button className="reset-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="records-table-container">
        {filteredRecords.length === 0 ? (
          <div className="no-records">No Records Found</div>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Batch ID</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.recordsid}
                  onClick={() => handleSelectRecord(record)}
                >
                  <td>{record.recordsid}</td>
                  <td>{record.batchid}</td>
                  <td>{formatToSriLankaTime(record.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <button disabled={!prevPage} onClick={() => fetchData(prevPage)}>
          Previous
        </button>

        <button disabled={!nextPage} onClick={() => fetchData(nextPage)}>
          Next
        </button>
      </div>

      {selectedRecord && (
        <div className="record-panel">
          <div className="panel-header">
            <h2>Record Details</h2>
            <span
              className="close-btn"
              onClick={() => {
                setSelectedRecord(null);
                setSelectedOperation(null);
              }}
            >
              &times;
            </span>
          </div>

          <div className="panel-body">
            {loadingOperation ? (
              <p>Loading operation...</p>
            ) : selectedOperation ? (
              <>
                <p><strong>Record ID:</strong> {selectedRecord.recordsid}</p>
                <p><strong>Batch ID:</strong> {selectedRecord.batchid}</p>
                <p><strong>Operation ID:</strong> {selectedOperation.operationid}</p>
                <p><strong>Operation Date:</strong> {selectedOperation.date}</p>
                <p><strong>Feed Usage:</strong> {selectedOperation.feedusage}kg</p>
                <p><strong>Egg Production:</strong> {selectedOperation.eggcount}</p>
                <p><strong>Avg Egg Weight:</strong> {selectedOperation.avgeggweight}g</p>
                <p><strong>Male Mortality:</strong> {selectedOperation.male_mortality}</p>
                <p><strong>Female Mortality:</strong> {selectedOperation.female_mortality}</p>
                <p><strong>All Mortality:</strong> {selectedOperation.mortalitycount}</p>
                <p><strong>Water Used:</strong> {selectedOperation.water_used}</p>
                <p><strong>Notes:</strong> {selectedOperation.notes}</p>
                <hr style={{ margin: "15px 0" }} />
                <p><strong>Timestamp:</strong> {formatToSriLankaTime(selectedRecord.timestamp)}</p>
              </>
            ) : (
              <p>No operation found for this record.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordPage;