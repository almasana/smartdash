import React, { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full dark">
      <body className="h-full bg-[oklch(0.145_0_0)]">
        {children}
      </body>
    </html>
  );
}
