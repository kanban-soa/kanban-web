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
import { Type } from "lucide-react";
import { useGetUser } from "@/hooks/use-auth";

const tabs = ["Account" /*, "Workspace"*/];

const fontSizes = ["small", "medium", "large"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("Account");
  const { fontSize, setFontSize } = useTheme();
  const [localUser, setLocalUser] = useState<{ id: string; name?: string; email?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setLocalUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  }, []);

  const { data: user, isLoading: isLoadingUser } = useGetUser(localUser?.id);

  // Merge local and fetched data
  const currentUser = user || localUser;

  const renderContent = () => {
    switch (activeTab) {
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
                  <p className="text-lg font-semibold leading-tight">
                    {currentUser?.name || (isLoadingUser ? "Loading..." : "User")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email || (isLoadingUser ? "Loading..." : "")}
                  </p>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                <Input
                  id="display-name"
                  defaultValue={currentUser?.name || ""}
                  key={currentUser?.name || "default"}
                  readOnly
                />
                <FieldDescription>
                  Your display name as shown to other workspace members.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel className="font-semibold">Email</FieldLabel>
                <div className="flex items-center justify-between rounded-lg border border-input/60 bg-muted/20 px-3 py-2 text-sm text-foreground">
                  <span className="text-muted-foreground">
                    {currentUser?.email || (isLoadingUser ? "Loading..." : "")}
                  </span>
                </div>
                <FieldDescription>
                  Your login email can’t be changed.
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
