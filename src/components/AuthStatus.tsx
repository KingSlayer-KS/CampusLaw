"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthStatusProps {
  onLogout: () => void;
}

type BasicUser = { name?: string | null; email?: string | null } | null;
export function AuthStatus({ onLogout }: AuthStatusProps) {
  const [user, setUser] = useState<BasicUser>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("legalAssistantUser");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.warn("Failed to parse user data", e);
      }
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-muted-foreground">Signed in as</span>
      <span className="font-medium">{user.name || user.email}</span>
      <Button variant="ghost" size="sm" onClick={onLogout} className="h-6 px-2">
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  );
}
