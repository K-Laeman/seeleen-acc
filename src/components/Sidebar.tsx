"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CircleDollarSign,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  Settings,
  Cog,
} from "lucide-react";

// Main navigation items
const navigation = [
  {
    name: "แดชบอร์ด",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "รายรับ",
    href: "/income",
    icon: CircleDollarSign,
  },
  {
    name: "รายจ่าย",
    href: "/expenses",
    icon: Wallet,
  },
  {
    name: "งบกำไรขาดทุน",
    href: "/pnl",
    icon: BarChart3,
  },
  {
    name: "ตั้งค่าระบบ",
    href: "/admin/settings",
    icon: Cog,
    adminOnly: true,
  },
];

interface SidebarContentProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

function SidebarContent({ onNavigate, collapsed = false }: SidebarContentProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const userInitial = (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase();
  const userName = session?.user?.name || session?.user?.email || "ผู้ใช้";
  const userRole = isAdmin ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน";

  return (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className={cn(
        "bg-gradient-to-r from-primary to-primary/90 transition-all duration-300",
        collapsed ? "px-2 py-4" : "px-6 py-5"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : ""
        )}>
          {collapsed ? (
            <span className="text-primary-foreground text-xl font-bold">S</span>
          ) : (
            <div className="ml-3">
              <h1 className="text-primary-foreground text-lg font-bold">SEELEE ACC.</h1>
              <p className="text-primary-foreground/70 text-xs">ระบบบัญชี</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className={cn(
        "flex-1 py-4 transition-all duration-300",
        collapsed ? "px-2" : "px-3"
      )}>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const button = (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full h-11 transition-all duration-300",
                  collapsed ? "justify-center px-2" : "justify-start gap-3",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </>
                )}
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} onClick={onNavigate}>
                      {button}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={item.name} href={item.href} onClick={onNavigate}>
                {button}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile Section at Bottom */}
      {session?.user && (
        <div className="border-t">
          {collapsed ? (
            // Collapsed: Show dropdown menu on avatar click
            <div className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=profile" onClick={onNavigate} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=preferences" onClick={onNavigate} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      ตั้งค่า
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" onClick={onNavigate} className="cursor-pointer">
                        <Cog className="mr-2 h-4 w-4" />
                        ตั้งค่าระบบ
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // Expanded: Show collapsible section
            <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-auto p-4 justify-between hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium truncate max-w-[120px]">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userRole}</p>
                    </div>
                  </div>
                  {profileOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3 space-y-1">
                <Link href="/settings?tab=profile" onClick={onNavigate}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                    <User className="h-4 w-4 text-muted-foreground" />
                    โปรไฟล์
                  </Button>
                </Link>
                <Link href="/settings?tab=preferences" onClick={onNavigate}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    ตั้งค่า
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin/settings" onClick={onNavigate}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                      <Cog className="h-4 w-4 text-muted-foreground" />
                      ตั้งค่าระบบ
                    </Button>
                  </Link>
                )}
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </Button>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Copyright */}
          {!collapsed && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground text-center py-3">
                © 2024 Fired Chicken
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem("sidebar-collapsed", String(newValue));
  };

  // Don't show sidebar on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <TooltipProvider>
      {/* Mobile Menu - Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 shadow-lg"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:border-r bg-card transition-all duration-300 relative",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarContent collapsed={isCollapsed} />

        {/* Collapse Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </aside>
    </TooltipProvider>
  );
}
