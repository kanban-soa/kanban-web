"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { ThemeToggle, useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Globe, Type } from "lucide-react";

const tabs = ["Account", "Workspace"];

const languages = ["English", "Vietnamese", "Japanese"];
const fontSizes = ["small", "medium", "large"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("Account");
  const { fontSize, setFontSize } = useTheme();
  const [user, setUser] = useState<{name?: string, email?: string} | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Workspace":
        return (
          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-lg backdrop-blur">
            <div className="space-y-8 px-8 py-8">
              <Field>
                <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
                <Input id="workspace-name" placeholder="Enter workspace name" />
                <FieldDescription>
                  Shown across your workspace.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="workspace-url">Workspace URL</FieldLabel>
                <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
                  <Input id="workspace-url-prefix" defaultValue="kan.bn/" />
                  <Input id="workspace-url" placeholder="your-workspace" />
                </div>
                <FieldDescription>
                  Use only letters, numbers, and dashes.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="workspace-description">
                  Workspace description
                </FieldLabel>
                <Input
                  id="workspace-description"
                  placeholder="Add a short description"
                />
                <FieldDescription>
                  Optional, helps members recognize the space.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="week-start">Week start day</FieldLabel>
                <Select defaultValue="monday">
                  <SelectTrigger id="week-start" className="w-full">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>Used for calendar views.</FieldDescription>
              </Field>

              <div className="flex flex-col gap-3 border-y border-border/60 py-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Email visibility</p>
                  <p className="text-xs text-muted-foreground">
                    Allow workspace members to see each other’s email addresses
                  </p>
                </div>
                <Switch defaultChecked aria-label="Toggle email visibility" />
              </div>

              <div className="space-y-3 border-t border-border/60 pt-6">
                <p className="text-sm font-medium">Delete workspace</p>
                <p className="text-xs text-muted-foreground">
                  Once you delete your workspace, there is no going back. This
                  action cannot be undone.
                </p>
                <Button variant="destructive" size="sm" className="mt-2">
                  Delete workspace
                </Button>
              </div>
            </div>
          </section>
        );
      case "Account":
      default:
        return (
          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-lg backdrop-blur">
            <div className="space-y-8 px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-border">
                  <img
                    src="https://images.unsplash.com/photo-1626808642875-0aa545482dfb?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold leading-tight">{user?.name || "Loading..."}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || "Loading..."}
                  </p>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                <Input id="display-name" defaultValue={user?.name || ""} key={user?.name || "default"} />
                <FieldDescription>
                  Pick a name to be shown to other workspace members.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel className="font-semibold">Email</FieldLabel>
                <div className="flex items-center justify-between rounded-lg border border-input/60 bg-muted/20 px-3 py-2 text-sm text-foreground">
                  <span className="text-muted-foreground">
                    {user?.email || "Loading..."}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    Verified
                  </span>
                </div>
                <FieldDescription>
                  Your login email can’t be changed.
                </FieldDescription>
              </Field>

              <div className="grid gap-6 md:grid-cols-2">
                <Field>
                  <FieldLabel className="font-semibold" htmlFor="language">
                    Language
                  </FieldLabel>
                  <div className="relative">
                    <Select defaultValue="english">
                      <SelectTrigger id="language" className="w-full pl-9">
                        <SelectValue placeholder="Choose language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem
                            key={language}
                            value={language.toLowerCase()}
                            className="capitalize"
                          >
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <FieldDescription>
                    Choose your preferred language.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel className="font-semibold" htmlFor="font-size">
                    Font size
                  </FieldLabel>
                  <div className="relative">
                    <Select
                      value={fontSize}
                      onValueChange={(value) =>
                        setFontSize(value as "small" | "medium" | "large")
                      }
                    >
                      <SelectTrigger
                        id="font-size"
                        className="w-full pl-9 capitalize"
                      >
                        <SelectValue
                          placeholder="Choose size"
                          className="capitalize"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map((font) => (
                          <SelectItem
                            key={font}
                            value={font}
                            className="capitalize"
                          >
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Type className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <FieldDescription>
                    Tune the interface to your comfort.
                  </FieldDescription>
                </Field>
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            {/*<ThemeToggle className="h-9 w-9" />*/}
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={cn(
                  "relative pb-3 transition-colors",
                  activeTab === tab
                    ? "text-foreground"
                    : "hover:text-foreground",
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-foreground" />
                )}
              </button>
            ))}
          </nav>
        </header>

        {renderContent()}
      </div>
    </div>
  );
}
