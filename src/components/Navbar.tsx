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

  if (loading) return <nav>Loading...</nav>;

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <Link href="/" style={{ marginRight: '15px' }}>Home</Link>

      {user ? (
        <>
          <span style={{ marginRight: '15px' }}>
            Welcome, {user.name || user.email}
          </span>
          <a href="/api/auth/logout">Logout</a>
        </>
      ) : (
        <a href="/api/auth/login">Login</a>
      )}
    </nav>
  );
}
