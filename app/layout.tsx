import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        
        {/* Header fijo */}
        <header className="w-full bg-card border-b border-border p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <h1 className="text-xl font-bold">SmartDash</h1>
          <nav className="flex gap-4 text-sm">
            <span className="cursor-pointer hover:text-primary">PYME</span>
            <span className="cursor-pointer hover:text-primary">E-commerce</span>
            <span className="cursor-pointer hover:text-primary">Creadores</span>
            <span className="cursor-pointer hover:text-primary">Startups</span>
          </nav>
        </header>

        {/* Dashboard con sidebar + main content */}
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}




