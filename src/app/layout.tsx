import React from 'react';
import Providers from './providers';
import './globals.css'; // Global styles loaded first

export const metadata = {
  title: 'Farm Connect',
  description: 'Bridging the gap between farmers and you',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}