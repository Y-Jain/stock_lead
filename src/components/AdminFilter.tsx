"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

interface AdminFilterProps {
  selectedAdminId: string;
  onAdminChange: (adminId: string) => void;
}

export function AdminFilter({ selectedAdminId, onAdminChange }: AdminFilterProps) {
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "superadmin") return;

    fetch("/api/admins")
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load admins for filter", err);
        setLoading(false);
      });
  }, [user]);

  if (user?.role !== "superadmin") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by Admin:</label>
      <select
        value={selectedAdminId}
        onChange={(e) => onAdminChange(e.target.value)}
        disabled={loading}
        className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-[200px]"
      >
        <option value="">All Admins</option>
        {admins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.email}
          </option>
        ))}
      </select>
    </div>
  );
}
