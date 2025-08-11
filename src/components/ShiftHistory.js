import { useState, useEffect } from "react";

export default function ShiftHistory() {
  const [shifts, setShifts] = useState([]);
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch("/api/shifts")
      .then((res) => res.json())
      .then((data) => {
        setShifts(data.shifts || []);
        setStats(data.stats || {});
      })
      .catch((err) => console.error(err));
  }, []);

  const formatTime = (t) => (t ? new Date(t).toLocaleString() : "-");

  return (
    <div style={{ marginTop: "20px", color: "#000" }}>
      {stats && (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            border: "1px solid #000",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "6px",
            color: "#000",
          }}
        >
          <h4 style={{ marginBottom: "8px", color: "#000" }}>📊 Analytics Summary:</h4>
          <p><strong>Total Shifts:</strong> {stats.totalShifts}</p>
          <p><strong>Total Hours Worked:</strong> {stats.totalHours}</p>
          <p><strong>Average Hours/Shift:</strong> {stats.avgHours}</p>
        </div>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000",
          color: "#000",
        }}
      >
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            {[
              "Staff",
              "Clock In",
              "Clock Out",
              "Hours Worked",
              "Clock In Note",
              "Clock Out Note",
            ].map((h) => (
              <th
                key={h}
                style={{
                  color: "#000",
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
          {shifts.map((s, idx) => {
            const hours = s.clockOutTime
              ? (
                  (new Date(s.clockOutTime) - new Date(s.clockInTime)) /
                  (1000 * 60 * 60)
                ).toFixed(2)
              : "-";
            return (
              <tr
                key={s.id}
                style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}
              >
                <td style={{ padding: "8px", color: "#000", border: "1px solid #000" }}>
                  {s.user?.name || s.user?.email || "-"}
                </td>
                <td style={{ padding: "8px", color: "#000", border: "1px solid #000" }}>
                  {formatTime(s.clockInTime)}
                </td>
                <td style={{ padding: "8px", color: "#000", border: "1px solid #000" }}>
                  {formatTime(s.clockOutTime)}
                </td>
                <td style={{ padding: "8px", color: "#000", border: "1px solid #000" }}>
                  {hours}
                </td>
                <td style={{ padding: "8px", color: "#000", border: "1px solid #000" }}>
                  {s.clockInNote || "-"}
                </td>
                <td style={{ padding: "8px", color: "#000", border: "1px solid #000" }}>
                  {s.clockOutNote || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
