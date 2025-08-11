import { useUser } from '@auth0/nextjs-auth0/client';
import ClockInOutButton from '../components/ClockInOutButton';

export default function CareworkerPage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading user: {error.message}</p>;
  if (!user) return <p>Please log in to access this page.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h2>Careworker Dashboard</h2>
      <p>Welcome, {user.name || "User"}!</p>

      {/* Pass Prisma user id (dbId) from session to clock-in component */}
      <ClockInOutButton userId={user.dbId} />
    </div>
  );
}
