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
  Plus,
  ChartColumnIncreasing,
  Zap,
  MoonStar,
  SunMedium,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { title: "Boards", icon: Table, href: "/workspaces/default/boards" },
  { title: "Statistic", icon: ChartColumnIncreasing, href: "/statistic" },
  { title: "Members", icon: UsersRound, href: "/member" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

const workspaces = [
  { id: "default", name: "mychannel", initials: "M" },
  { id: "work", name: "Workspace 2", initials: "W" },
];

type CreateWorkspaceForm = {
  name: string;
  description: string;
};

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

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<CreateWorkspaceForm>({
    name: "",
    description: "",
  });
  const [isCreating, setIsCreating] = React.useState(false);

  const isAuthRoute = pathname === "/" || pathname === "/login";
  if (isAuthRoute) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      // In a real app, you might want to read the token from cookies or local storage 
      // if your logout API requires an Authorization header.
      // Assuming cookies are sent automatically or it's a simple POST to invalidate session.
      const response = await fetch("http://localhost:8080/api/v1/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
      } else {
        toast.error("Logout might have failed on server, proceeding anyway");
      }
    } catch (error) {
      console.error("Logout API error:", error);
      toast.error("Network error during logout");
    } finally {
      router.push("/login");
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setIsCreating(true);
    setCreateOpen(false);
    setCreateForm({ name: "", description: "" });
    setIsCreating(false);
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
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50 transition-colors ${
                        isCollapsed ? "justify-center px-0" : ""
                      }`}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-bold text-xs">
                        {workspaces[0]?.initials ?? "M"}
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium text-[15px] text-sidebar-foreground">
                          {workspaces[0]?.name ?? "mychannel"}
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
                    {workspaces.map((ws) => (
                      <DropdownMenuItem key={ws.id}>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-bold text-xs mr-2">
                          {ws.initials}
                        </div>
                        <span className="flex-1">{ws.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-muted-foreground cursor-pointer"
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className="size-4 mr-2" />
                      Create Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!isCollapsed && (
                  <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                    <PopoverTrigger asChild>
                      <button className="inline-flex size-9 items-center justify-center rounded-md border border-sidebar-border bg-sidebar hover:bg-sidebar-accent/50">
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
                        VT
                      </div>
                      {!isCollapsed && (
                        <>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold text-sidebar-foreground">
                              Vy Trương
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
        <div className="flex-1 overflow-auto">{children}</div>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create Workspace</SheetTitle>
              <SheetDescription>
                Create a new workspace to organize your boards and collaborate
                with team members.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateWorkspace} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="workspace-name"
                  className="text-sm font-medium text-foreground"
                >
                  Workspace Name
                </label>
                <Input
                  id="workspace-name"
                  placeholder="Enter workspace name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="workspace-description"
                  className="text-sm font-medium text-foreground"
                >
                  Description (optional)
                </label>
                <Input
                  id="workspace-description"
                  placeholder="Enter description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !createForm.name.trim()}>
                  {isCreating ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </ThemeProvider>
  );
}
