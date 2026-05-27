"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Table,
  UsersRound,
  Settings,
  Search,
  MoreHorizontal,
  LogOut,
  ChartColumnIncreasing,
  Zap,
  MoonStar,
  SunMedium,
  MailIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWorkspaceContext } from "@/contexts/workspace.context";
import { logout as logoutApi } from "@/lib/api/auth.api";
import WorkspaceAvatar from "../ui/workspace-avatar";

const navItems = [
  { title: "Workspaces", icon: Zap, href: "/workspaces" },
  { title: "Boards", icon: Table, href: "/workspaces/default/boards" },
  { title: "Statistic", icon: ChartColumnIncreasing, href: "/statistic" },
  { title: "Members", icon: UsersRound, href: "/member" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  children?: React.ReactNode;
};

function UserMenuThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className="cursor-pointer"
    >
      {theme === "dark" ? (
        <SunMedium className="size-4 mr-2" />
      ) : (
        <MoonStar className="size-4 mr-2" />
      )}
      Toggle Theme
    </DropdownMenuItem>
  );
}

export function AppSidebar({ children, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    isLoadingWorkspaces,
  } = useWorkspaceContext();

  const WORKSPACES_PER_PAGE = 5;
  const [workspacePage, setWorkspacePage] = React.useState(0);
  const totalPages = Math.max(
    1,
    Math.ceil(workspaces.length / WORKSPACES_PER_PAGE),
  );

  React.useEffect(() => {
    if (workspacePage >= totalPages) {
      setWorkspacePage(Math.max(0, totalPages - 1));
    }
  }, [workspacePage, totalPages]);

  const paginatedWorkspaces = workspaces.slice(
    workspacePage * WORKSPACES_PER_PAGE,
    (workspacePage + 1) * WORKSPACES_PER_PAGE,
  );

  const [user, setUser] = React.useState<{
    name?: string;
    email?: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    };

    fetchUser();

    window.addEventListener("storage", fetchUser);
    return () => window.removeEventListener("storage", fetchUser);
  }, []);

  const userInitials = React.useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 1).toUpperCase();
  }, [user?.name]);

  const isAuthRoute = pathname === "/" || pathname === "/login";
  if (isAuthRoute) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout API error:", error);
      toast.error("Logout might have failed on server, proceeding anyway");
    } finally {
      router.push("/login");
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full">
        <Sidebar
          collapsible="icon"
          className="relative z-50 border-r border-sidebar-border bg-sidebar"
          {...props}
        >
          <SidebarHeader
            className={cn(
              "h-14 border-b border-sidebar-border/60 bg-sidebar flex flex-row items-center justify-between",
              isCollapsed ? "px-2" : "px-4",
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-base tracking-tight">kan.bn</span>
              </div>
            )}
            <SidebarTrigger
              className={`h-8 w-8 ${isCollapsed ? "mx-auto" : ""}`}
            />
          </SidebarHeader>

          <SidebarContent
            className={cn(
              "flex h-full flex-col gap-4 py-4",
              isCollapsed ? "px-1" : "px-3",
            )}
          >
            <SidebarGroup className={cn(isCollapsed ? "p-1" : "p-2")}>
              <div
                className={`flex items-center gap-3 ${
                  isCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50 transition-colors ${
                        isCollapsed ? "justify-center px-0" : "flex-1"
                      }`}
                    >
                      <WorkspaceAvatar currentWorkspace={currentWorkspace} />
                      {!isCollapsed && (
                        <span
                          className="min-w-0 flex-1 truncate text-left font-medium text-[15px] text-sidebar-foreground"
                          title={currentWorkspace?.name}
                        >
                          {currentWorkspace?.name ??
                            (isLoadingWorkspaces
                              ? "Loading..."
                              : "No workspace")}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="w-56"
                  >
                    <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {paginatedWorkspaces.map((ws) => (
                      <DropdownMenuItem
                        key={ws.publicId}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-bold text-xs mr-2">
                          {ws.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="flex-1">{ws.name}</span>
                        {currentWorkspace?.publicId === ws.publicId && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ✓
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWorkspacePage((p) => Math.max(0, p - 1));
                        }}
                        disabled={workspacePage === 0}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {workspacePage + 1} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWorkspacePage((p) =>
                            Math.min(totalPages - 1, p + 1),
                          );
                        }}
                        disabled={workspacePage >= totalPages - 1}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!isCollapsed && (
                  <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                    <PopoverTrigger asChild>
                      <button className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar hover:bg-sidebar-accent/50">
                        <Search className="size-4 text-sidebar-foreground/70" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-80 p-3"
                    >
                      <div className="space-y-2">
                        <Input
                          placeholder="Search boards, members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                          Press Esc to close
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </SidebarGroup>

            <SidebarGroup className={cn(isCollapsed ? "p-1" : "p-2")}>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className={`px-3 py-2.5 rounded-lg transition-colors hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent/60 data-[active=true]:text-sidebar-accent-foreground ${
                        isCollapsed ? "justify-center px-0" : ""
                      }`}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3",
                          isCollapsed && "w-full justify-center",
                        )}
                      >
                        <item.icon
                          className={`size-5 shrink-0 text-sidebar-foreground/80 ${
                            isCollapsed ? "mx-auto" : ""
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="text-[15px] font-medium text-sidebar-foreground">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter
            className={cn(
              "space-y-3 border-t border-sidebar-border/60 bg-sidebar",
              isCollapsed ? "p-2" : "p-3",
            )}
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50 transition-colors ${
                        isCollapsed ? "justify-center px-0" : ""
                      }`}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-muted text-foreground/80 font-semibold text-xs">
                        {userInitials}
                      </div>
                      {!isCollapsed && (
                        <>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold text-sidebar-foreground">
                              {user?.name || "User"}
                            </span>
                          </div>
                          <MoreHorizontal className="ml-auto size-4 text-sidebar-foreground/70" />
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="w-56"
                  >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <UserMenuThemeToggle />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="size-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <div className="flex-1 overflow-auto bg-background">{children}</div>
      </div>
    </ThemeProvider>
  );
}
