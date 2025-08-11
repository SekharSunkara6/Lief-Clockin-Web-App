import React, { useState } from "react";

export default function ClockInOutButton({ userId }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [note, setNote] = useState("");
  const [distance, setDistance] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const getCurrentPosition = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

  async function handleClock(url) {
    if (!userId) {
      setMessage("❌ No userId provided. Make sure you are logged in.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setDistance(null);

    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      setLat(latitude);
      setLng(longitude);

      console.log("📍 Frontend location:", latitude, longitude, "userId:", userId);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lat: latitude,
          lng: longitude,
          note: note || "",
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server did not return valid JSON");
      }

      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessage(`✅ ${data.message}`);
      if (data.distance !== undefined) {
        setDistance(Number(data.distance).toFixed(3));
      }
      setNote("");
    } catch (e) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", textAlign: "center" }}>
      {lat && lng && (
        <p>
          📍 Your detected location: <b>{lat.toFixed(6)}, {lng.toFixed(6)}</b>
        </p>
      )}
      <input
        type="text"
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          marginBottom: 10,
          padding: "8px",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => handleClock("/api/clockin")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Processing..." : "Clock In"}
        </button>
        <button
          onClick={() => handleClock("/api/clockout")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Processing..." : "Clock Out"}
        </button>
      </div>
      {message && <p style={{ fontWeight: "bold" }}>{message}</p>}
      {distance !== null && (
        <p>📏 Distance from center: <b>{distance} km</b></p>
      )}
    </div>
  );
}
