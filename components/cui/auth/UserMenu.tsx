"use client";
import { LogOut } from "lucide-react";

import { useAuth } from "@/auth/authContext";
import { Button } from "@/components/ui/button";

const UserMenu = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden truncate text-xs text-muted-foreground sm:inline">
        {user.email}
      </span>
      <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Log out">
        <LogOut size={16} />
      </Button>
    </div>
  );
};

export default UserMenu;
