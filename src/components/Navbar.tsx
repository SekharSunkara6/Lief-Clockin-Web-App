// src/components/Navbar.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';

type User = {
  id?: string;
  name?: string;
  email?: string;
  nickname?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch logged-in user profile WITH credentials
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        console.log("Auth.me response status:", res.status);

        if (res.ok) {
          const data = await res.json();
          console.log("Navbar fetched user data:", data);
          setUser(data);
        } else {
          console.log("No user found / not logged in");
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    console.log("Navbar user state updated:", user);
  }, [user]);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  if (loading) return <nav>Loading...</nav>;

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <Link href="/" style={{ marginRight: '15px' }}>Home</Link>

      {user && user.id ? (
        <>
          <span style={{ marginRight: '15px' }}>
            Welcome, {user.name || user.email || user.nickname}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: '#F44336',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          style={{
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      )}
    </nav>
  );
}
