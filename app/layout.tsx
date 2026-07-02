import AppSidebar from "@/components/cui/AppSidebar";
import ToggleMode from "@/components/cui/themeToggle/ToggleMode";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { parseThemeCookie, THEME_COOKIE } from "@/theme/config";
import ThemeProvider from "@/theme/themeContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Deep Ecommerce Admin",
  description: "Ecommerce admin dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const theme = parseThemeCookie(store.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        theme.mode,
      )}
      data-color={theme.color !== "neutral" ? theme.color : undefined}
      style={{ "--radius": theme.radius } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden">
        <ThemeProvider initial={theme}>
          <TooltipProvider>
            <SidebarProvider className="h-svh min-h-0 overflow-hidden">
              <AppSidebar />
              <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
                <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <SidebarTrigger />
                  <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold">
                      Ecommerce Admin
                    </h1>
                    <p className="truncate text-xs text-muted-foreground">
                      Products, orders, categories, shops and reports
                    </p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <ToggleMode />
                  </div>
                </header>
                <div className="min-h-0 min-w-0 flex-1 overflow-auto p-3 md:p-6">
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
