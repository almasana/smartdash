"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  Users,
  LogOut,
  ShieldAlert,
} from "lucide-react";

// Datos estáticos definidos localmente para evitar dependencias circulares
const currentClient = {
  name: "Usuario Demo",
  role: "Admin",
  initials: "UD",
};

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Riesgos",
    icon: ShieldAlert,
    href: "/risks",
  },
  {
    label: "Métricas",
    icon: PieChart,
    href: "/metrics",
  },
  {
    label: "Mensajes",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/settings",
  },
];

export function DashboardSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  
  return (
    <div className={`h-full transition-all duration-300 ease-in-out ${isCollapsed ? "w-14" : "w-56"} bg-black/40 backdrop-blur-sm border-r border-white/5 flex flex-col`}>
      {/* Logo Area */}
      <div className="p-3 flex items-center justify-center">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-gray-800 rounded-md flex items-center justify-center">
            <span className="text-white text-xs">SD</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 rounded-md flex items-center justify-center mr-2">
              <span className="text-white text-xs">SD</span>
            </div>
            <span className="text-white font-bold text-lg">SmartDash</span>
          </div>
        )}
      </div>
      
      {/* Navigation Items */}
      <nav className="space-y-2 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : ""
                  )}
                />
                {!isCollapsed && (
                  <span className="ml-3 truncate transition-all">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-2 mt-auto border-t border-white/5 pt-4">
        <div className={`${isCollapsed ? "justify-center" : "justify-start"} mb-2 flex items-center gap-3 rounded-lg border border-white/5 bg-black/30 p-2`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {currentClient.initials}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden max-w-[120px]">
              <p className="truncate text-sm font-medium text-foreground">
                {currentClient.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground uppercase">
                {currentClient.role}
              </p>
            </div>
          )}
        </div>

        <button className={`${isCollapsed ? "justify-center" : "justify-start"} flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10`}>
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="ml-3">Salir</span>}
        </button>
      </div>
    </div>
  );
}