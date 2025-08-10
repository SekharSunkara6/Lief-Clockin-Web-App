// src/components/Navbar.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';

type User = {
  name?: string;
  email?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

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
      {user ? (
        <>
          <span style={{ marginRight: '15px' }}>
            Welcome, {user.name || user.email}
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
