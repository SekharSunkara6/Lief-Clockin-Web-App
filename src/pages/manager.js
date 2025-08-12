import { useState, useEffect } from "react";
import ShiftHistory from "../components/ShiftHistory";

export default function ManagerDashboard() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("");
  const [message, setMessage] = useState("");
  const [current, setCurrent] = useState(null);
  const [staff, setStaff] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/geofence")
        .then((res) => res.json())
        .then((data) => setCurrent(data.geofence))
        .catch(() => {});
      fetch("/api/staff")
        .then((res) => res.json())
        .then((data) => setStaff(data.staff || []))
        .catch(() => {});
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
      setRefreshKey((prev) => prev + 1);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const saveGeofence = async () => {
    try {
      const res = await fetch("/api/geofence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerLat: parseFloat(lat),
          centerLng: parseFloat(lng),
          radiusKm: parseFloat(radius),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("✅ Geofence saved");
      setCurrent(data.geofence);
    } catch (e) {
      setMessage(`❌ ${e.message}`);
    }
  };

  const formatTime = (t) => (t ? new Date(t).toLocaleString() : "-");

  return (
    <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "16px" }} className="manager-dashboard">
      <h2>Manager Dashboard</h2>

      {/* Geofence Form */}
      <h3 style={{ marginTop: "24px" }}>Set Geofence</h3>
      <input
        type="number"
        placeholder="Center Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        style={{ display: "block", marginBottom: "8px", width: "100%", padding: "8px" }}
      />
      <input
        type="number"
        placeholder="Center Longitude"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        style={{ display: "block", marginBottom: "8px", width: "100%", padding: "8px" }}
      />
      <input
        type="number"
        placeholder="Radius (km)"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        style={{ display: "block", marginBottom: "8px", width: "100%", padding: "8px" }}
      />
      <button
        onClick={saveGeofence}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Save Geofence
      </button>
      {message && (
        <p style={{ marginTop: "8px", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      {current && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            border: "1px solid #000",
            borderRadius: "6px",
            background: "#fafafa",
            color: "#000",
          }}
        >
          <h4 style={{ color: "#000" }}>🌍 Current Geofence:</h4>
          <p>Lat: {current.centerLat}</p>
          <p>Lng: {current.centerLng}</p>
          <p>Radius: {current.radiusKm} km</p>
        </div>
      )}

      {/* Staff Status Table */}
      <h3 style={{ marginTop: "30px" }}>Staff Status</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
          border: "1px solid #000",
          color: "#000",
        }}
      >
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            {["Name", "Email", "Last Clock-In", "Last Clock-Out", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px",
                  border: "1px solid #000",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staff.map((s, idx) => (
            <tr key={s.id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ padding: "8px", border: "1px solid #000" }}>{s.name}</td>
              <td style={{ padding: "8px", border: "1px solid #000" }}>{s.email}</td>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                {formatTime(s.lastClockIn)}
              </td>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                {formatTime(s.lastClockOut)}
              </td>
              <td
                style={{
                  padding: "8px",
                  fontWeight: "bold",
                  color: s.active ? "green" : "red",
                  border: "1px solid #000",
                }}
              >
                {s.active ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shift History & Analytics */}
      <h3 style={{ marginTop: "30px" }}>Shift History</h3>
      <ShiftHistory key={refreshKey} />
    </div>
  );
}
