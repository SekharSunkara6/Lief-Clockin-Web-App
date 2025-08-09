// src/pages/profile.tsx
import { useUser } from '@auth0/nextjs-auth0';

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error.message}</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Please log in to view your profile.</p>
        <a
          href="/api/auth/login"
          style={{
            background: '#0070f3',
            padding: '8px 12px',
            borderRadius: '4px',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Profile</h1>
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name || 'User'}
          style={{ borderRadius: '50%', width: '80px', marginBottom: '10px' }}
        />
      )}
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <pre
        style={{
          background: '#f4f4f4',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '10px',
        }}
      >
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
