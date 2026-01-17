'use client';

import React from "react";
import Link from "next/link";
import { ReactNode } from "react";
import {
  BarChart3,
  CheckSquare,
  LogOut,
  Menu,
  Settings,
  Users,
  Calendar,
  LayoutGrid,
  FileText,
  Zap,
  GitBranch,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/useUiStore";
import { useAuthStore } from "@/stores/useAuthStore";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "My Work", href: "/my-work", icon: CheckSquare },
  { label: "Kanban", href: "/kanban", icon: LayoutGrid },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Efforts", href: "/efforts", icon: Zap },
  { label: "Sprints", href: "/sprints", icon: Calendar },
  { label: "PIs", href: "/pis", icon: GitBranch },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Members", href: "/members", icon: Users },
  { label: "Environments", href: "/environments", icon: Settings },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Test Types", href: "/settings/test-types", icon: TestTube },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:w-20 lg:-translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-4 p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span
              className={`font-bold text-lg transition-opacity ${
                sidebarOpen ? "opacity-100" : "lg:opacity-0"
              }`}
            >
              TestOps
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
              title={item.label}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-opacity ${
                  sidebarOpen ? "opacity-100" : "lg:opacity-0"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span
              className={`transition-opacity ${
                sidebarOpen ? "opacity-100" : "lg:opacity-0"
              }`}
            >
              Logout
            </span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
