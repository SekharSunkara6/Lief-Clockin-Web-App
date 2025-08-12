// src/pages/_app.tsx
import Head from 'next/head';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from '@/components/Navbar'; // adjust path if needed

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        <meta name="application-name" content="Lief Clock In/Out" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
    </UserProvider>
  );
}