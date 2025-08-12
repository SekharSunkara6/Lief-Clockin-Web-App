// src/pages/careworker.tsx
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useEffect, useState, useCallback } from 'react';
import { getDistance } from 'geolib';

type Geofence = { centerLat: number; centerLng: number; radiusKm: number };
type User = { id: string; name?: string | null; email?: string | null };
type Shift = {
  id: string;
  clockInTime?: string;
  clockOutTime?: string;
  clockInNote?: string;
  clockOutNote?: string;
};

function CareworkerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [inside, setInside] = useState<boolean | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [locationReady, setLocationReady] = useState(false); // ✅ New

  // Load logged-in user
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, []);

  // Load geofence configuration
  useEffect(() => {
    fetch('/api/geofence')
      .then(res => res.json())
      .then(data => {
        if (data.geofence) {
          setGeofence({
            centerLat: data.geofence.centerLat,
            centerLng: data.geofence.centerLng,
            radiusKm: data.geofence.radiusKm
          });
        }
      });
  }, []);

  // Fetch Careworker shift list
  const fetchShifts = useCallback(() => {
    fetch('/api/shifts', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setShifts([...data.shifts]))
      .catch(console.error);
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const handleClockIn = useCallback(async (coords?: { lat: number; lng: number }) => {
    if (!user?.id) { alert('User ID not loaded yet'); return; }

    const latValue = coords?.lat ?? position?.lat;
    const lngValue = coords?.lng ?? position?.lng;

    if (latValue == null || lngValue == null) {
      alert('Location not ready yet. Please wait until GPS loads.');
      return;
    }

    const res = await fetch('/api/clockin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: user.id,
        note,
        lat: latValue,
        lng: lngValue
      })
    });

    if (res.ok) {
      setMessage('✅ Clock-in successful');
      setNote('');
      window.dispatchEvent(new Event('shiftUpdated'));
      fetchShifts();
    } else {
      const errData = await res.json();
      setMessage(`❌ Clock-in failed: ${errData.error || 'Unknown error'}`);
    }
  }, [user, note, position, fetchShifts]);

  const handleClockOut = useCallback(async (coords?: { lat: number; lng: number }) => {
    if (!user?.id) { alert('User ID not loaded yet'); return; }

    const latValue = coords?.lat ?? position?.lat;
    const lngValue = coords?.lng ?? position?.lng;

    if (latValue == null || lngValue == null) {
      alert('Location not ready yet. Please wait until GPS loads.');
      return;
    }

    const res = await fetch('/api/clockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: user.id,
        note,
        lat: latValue,
        lng: lngValue
      })
    });

    if (res.ok) {
      setMessage('✅ Clock-out successful');
      setNote('');
      window.dispatchEvent(new Event('shiftUpdated'));
      fetchShifts();
    } else {
      const errData = await res.json();
      setMessage(`❌ Clock-out failed: ${errData.error || 'Unknown error'}`);
    }
  }, [user, note, position, fetchShifts]);

  // Track GPS & trigger readiness
  useEffect(() => {
    if (!geofence) return;
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(coords);
          setLocationReady(true); // ✅ Enable buttons immediately

          const distMeters = getDistance(
            { latitude: coords.lat, longitude: coords.lng },
            { latitude: geofence.centerLat, longitude: geofence.centerLng }
          );
          const distKm = distMeters / 1000;
          setDistanceKm(distKm);

          const isInside = distKm <= geofence.radiusKm;
          if (inside === false && isInside) {
            if (confirm('✅ You entered the geofence. Clock in now?')) handleClockIn(coords);
          }
          if (inside === true && !isInside) {
            if (confirm('⚠ You left the geofence. Clock out now?')) handleClockOut(coords);
          }
          setInside(isInside);
        },
        err => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [geofence, inside, handleClockIn, handleClockOut]);

  // Loading / login checks
  if (loadingUser) return <p style={{ textAlign: 'center', color: '#000' }}>Loading...</p>;
  if (!user) return <p style={{ textAlign: 'center', color: 'red' }}>Please login to access the Careworker Dashboard.</p>;

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      background: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif',
      color: '#000'
    }}>
      <h1 style={{ marginBottom: '10px', color: '#000' }}>Careworker Dashboard</h1>

      {position && <p>📍 Your location: <strong>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</strong></p>}
      {geofence && <p>🌍 Geofence: <strong>{geofence.centerLat}, {geofence.centerLng}</strong> — {geofence.radiusKm} km radius</p>}
      {distanceKm !== null && <p>📏 Distance from center: <strong>{distanceKm.toFixed(3)} km</strong></p>}
      {!locationReady && <p style={{ color: 'orange' }}>⏳ Waiting for GPS location...</p>} {/* ✅ New message */}

      <div style={{ margin: '15px 0' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px', color: '#000' }}>Note:</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: '70%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            color: '#000',
            background: '#fff'
          }}
          placeholder="Optional note"
        />
      </div>

      <div>
        <button
          disabled={!user?.id || !locationReady}
          onClick={() => handleClockIn()}
          style={{
            marginRight: '10px',
            padding: '10px 18px',
            background: locationReady ? '#4CAF50' : '#888',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: locationReady ? 'pointer' : 'not-allowed',
            opacity: user?.id && locationReady ? 1 : 0.6
          }}
        >
          Clock In
        </button>
        <button
          disabled={!user?.id || !locationReady}
          onClick={() => handleClockOut()}
          style={{
            padding: '10px 18px',
            background: locationReady ? '#F44336' : '#888',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: locationReady ? 'pointer' : 'not-allowed',
            opacity: user?.id && locationReady ? 1 : 0.6
          }}
        >
          Clock Out
        </button>
      </div>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#000' }}>{message}</p>}

      {/* Recent Shifts */}
      <div style={{ marginTop: '20px' }}>
        <h3>Your Recent Shifts</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {shifts.slice(0, 5).map(s => (
            <li key={s.id}>
              In: {s.clockInTime ? new Date(s.clockInTime).toLocaleString() : '-'}
              {s.clockInNote ? ` (${s.clockInNote})` : ''} | 
              Out: {s.clockOutTime ? new Date(s.clockOutTime).toLocaleString() : '-'}
              {s.clockOutNote ? ` (${s.clockOutNote})` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CareworkerDashboard;
