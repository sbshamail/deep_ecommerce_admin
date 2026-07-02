import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import AppSidebar from "@/components/cui/AppSidebar";
import UserMenu from "@/components/cui/auth/UserMenu";
import ToggleMode from "@/components/cui/themeToggle/ToggleMode";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware only checks cookie presence; this is the real check —
  // it fails closed if the token is invalid/expired/revoked server-side.
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Ecommerce Admin</h1>
            <p className="truncate text-xs text-muted-foreground">
              Products, orders, categories, shops and reports
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ToggleMode />
            <UserMenu />
          </div>
        </header>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto p-3 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
