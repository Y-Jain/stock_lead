"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut, Menu, X, Bell, Search, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/bullmart.png");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data?.data?.logo_url) {
          let url = data.data.logo_url;
          if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
            url = '/' + url;
          }
          setLogoUrl(url);
        }
      })
      .catch(console.error);

    if (!user) {
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => {
          if (data.data) setUser(data.data);
        })
        .catch(console.error);
    }
  }, [user, setUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/leads/dashboard", icon: LayoutDashboard },
    { name: "My Leads", href: "/leads", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-secondary/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-24 flex items-center justify-center px-6 border-b border-border relative">
          <div className="flex items-center justify-center w-full mt-2">
            <img src={logoUrl} alt="Bull Mart Securities" className="h-20 w-auto object-contain scale-[1.3]" />
          </div>
          <button className="lg:hidden absolute right-6 text-secondary-text hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Manager Portal</div>
          {navItems.map((item) => {
            const isActive = item.href === '/leads' 
              ? pathname === '/leads' || (pathname.startsWith('/leads/') && !pathname.startsWith('/leads/dashboard'))
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-info/10 text-info"
                    : "text-secondary-text hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-info" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-secondary-text hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-secondary-text hover:text-foreground"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Workspace</span>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium capitalize">
                {pathname.includes("dashboard") ? "Dashboard" : pathname.split("/").filter(Boolean).pop()?.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 text-sm bg-muted border-none rounded-full focus:ring-2 focus:ring-info focus:bg-surface transition-all w-64"
              />
            </div>
            
            <button className="text-secondary-text hover:text-foreground relative p-2">
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-muted p-1 pr-2 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-info to-primary flex items-center justify-center text-white font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "M"}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Manager</p>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-full mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
