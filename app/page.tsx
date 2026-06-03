"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  Columns3,
  FileText,
  LayoutDashboard,
  Layers3,
  Menu,
  PenTool,
  Plus,
  Search,
  Settings,
  Shapes,
  Sparkles,
  StickyNote,
  Target,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Command",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-cyan-200", active: true },
      { name: "AI Assistant", href: "#", icon: Bot, color: "text-pink-300" },
      { name: "Calendar", href: "/calendar", icon: CalendarDays, color: "text-lime-200" },
    ],
  },
  {
    label: "Create",
    items: [
      { name: "Task / Kanban", href: "#", icon: Columns3, color: "text-emerald-200" },
      { name: "Notes", href: "#", icon: StickyNote, color: "text-amber-200" },
      { name: "Whiteboard", href: "#", icon: PenTool, color: "text-rose-200" },
      { name: "Pages / Spaces", href: "#", icon: Layers3, color: "text-indigo-200" },
      { name: "AI Template Builder", href: "#", icon: Sparkles, color: "text-violet-200" },
    ],
  },
  {
    label: "System",
    items: [{ name: "Settings", href: "#", icon: Settings, color: "text-slate-200" }],
  },
];

const stats = [
  { label: "Focus voltage", value: "18.5h", detail: "+2.4 synced", tone: "border-cyan-300/50 bg-cyan-300/16 text-cyan-50" },
  { label: "Open tasks", value: "34", detail: "9 hot", tone: "border-lime-300/50 bg-lime-300/16 text-lime-50" },
  { label: "Live spaces", value: "7", detail: "3 shared", tone: "border-pink-300/50 bg-pink-300/16 text-pink-50" },
  { label: "AI drafts", value: "12", detail: "5 primed", tone: "border-violet-300/50 bg-violet-300/16 text-violet-50" },
];

const spaces = [
  { title: "Neon Roadmap", type: "Team grid", accent: "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.55)]", meta: "12 boards" },
  { title: "Launch Signals", type: "Docs relay", accent: "bg-pink-300 shadow-[0_0_18px_rgba(249,168,212,0.65)]", meta: "28 pages" },
  { title: "Research Matrix", type: "Whiteboard", accent: "bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.5)]", meta: "6 clusters" },
];

const tasks = [
  { title: "Map onboarding canvas", status: "In progress", color: "border-l-cyan-300" },
  { title: "Review AI template prompts", status: "Today", color: "border-l-fuchsia-300" },
  { title: "Organize sprint notes", status: "Queued", color: "border-l-lime-300" },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground [background-image:linear-gradient(rgba(103,232,249,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(244,114,182,0.06)_1px,transparent_1px),linear-gradient(135deg,rgba(34,211,238,0.10),transparent_32%,rgba(168,85,247,0.12)_58%,rgba(190,242,100,0.06))] [background-size:34px_34px,34px_34px,100%_100%]">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-20 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-sidebar-border bg-sidebar/94 px-2.5 py-3 shadow-[12px_0_42px_rgba(34,211,238,0.12)] backdrop-blur transition-all duration-300 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            sidebarExpanded ? "lg:w-56" : "lg:w-16"
          )}
        >
          <div className="mb-5 flex items-center gap-2.5 px-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-200/60 bg-cyan-300/16 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.34)]">
              <Shapes className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className={cn("min-w-0 flex-1", !sidebarExpanded && "lg:hidden")}>
              <p className="truncate text-[0.82rem] font-semibold leading-5 text-cyan-50">Focus Forge</p>
              <p className="truncate text-[0.68rem] text-muted-foreground">Neural workspace</p>
            </div>

            <button
              aria-label="Close sidebar"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyan-200/30 bg-cyan-300/8 text-cyan-100 transition-colors hover:bg-cyan-300/16 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              type="button"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-3.5" aria-label="Main navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1 rounded-lg border border-sidebar-border/80 bg-white/[0.025] p-1.5 shadow-[0_0_22px_rgba(34,211,238,0.05)]">
                <p className={cn("px-1.5 pb-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground", !sidebarExpanded && "lg:hidden")}>
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex h-7 items-center gap-2 rounded-md border border-transparent px-1.5 text-[0.74rem] font-medium text-sidebar-foreground transition-colors hover:border-cyan-200/30 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          !sidebarExpanded && "lg:justify-center",
                          item.active && "border-cyan-200/40 bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                        )}
                        aria-current={item.active ? "page" : undefined}
                        title={!sidebarExpanded ? item.name : undefined}
                      >
                        <Icon className={cn("h-3.5 w-3.5 shrink-0 drop-shadow-[0_0_8px_currentColor]", item.color)} aria-hidden="true" />
                        <span className={cn("truncate", !sidebarExpanded && "lg:hidden")}>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className={cn("mt-5 space-y-3 border-t border-sidebar-border pt-4", !sidebarExpanded && "lg:hidden")}>
            <button className="flex w-full items-center gap-2 rounded-md border border-lime-300/20 bg-lime-300/5 px-2 py-2 text-left text-xs text-sidebar-foreground transition-colors hover:bg-lime-300/10">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lime-300/15 text-lime-200">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">Forge Studio</span>
                <span className="block truncate text-muted-foreground">4 operators online</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
        </aside>

        <section className={cn("flex min-w-0 flex-1 flex-col transition-[padding] duration-300", sidebarExpanded ? "lg:pl-56" : "lg:pl-16")}>
          <header className="sticky top-0 z-10 border-b border-border bg-background/82 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                  className="hidden border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10 lg:inline-flex"
                  onClick={() => setSidebarExpanded((value) => !value)}
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open sidebar"
                  className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </Button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">Dashboard</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-foreground">Today&apos;s signal map</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden h-9 items-center gap-2 rounded-md border border-input bg-card/88 px-3 text-sm text-muted-foreground shadow-[0_0_18px_rgba(34,211,238,0.08)] sm:flex">
                  <Search className="h-4 w-4 text-cyan-200" aria-hidden="true" />
                  <span>Search pages, boards, tasks</span>
                </div>
                <Button variant="outline" size="icon" aria-label="Notifications" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button className="gap-2 bg-pink-300 text-slate-950 shadow-[0_0_24px_rgba(249,168,212,0.34)] hover:bg-cyan-200">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-5 px-4 py-5 md:px-6">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-cyan-50">{stat.value}</p>
                      </div>
                      <span className={cn("rounded-md border px-2 py-1 text-[0.68rem] font-semibold", stat.tone)}>
                        {stat.detail}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
              <Card className="rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-3">
                  <CardTitle className="text-base tracking-normal">Recent spaces</CardTitle>
                  <Button variant="ghost" size="sm" className="text-cyan-200 hover:bg-cyan-300/10 hover:text-cyan-100">View all</Button>
                </CardHeader>
                <CardContent className="grid gap-3 p-4 pt-0 md:grid-cols-3">
                  {spaces.map((space) => (
                    <a
                      href="#"
                      key={space.title}
                      className="rounded-lg border border-border bg-secondary/70 p-3 transition-colors hover:border-cyan-200/40 hover:bg-secondary"
                    >
                      <div className={cn("mb-8 h-1.5 w-12 rounded-full", space.accent)} />
                      <p className="text-sm font-semibold text-cyan-50">{space.title}</p>
                      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{space.type}</span>
                        <span>{space.meta}</span>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-lg border-pink-300/30 bg-card/90 shadow-[0_0_34px_rgba(244,114,182,0.18)] backdrop-blur">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-base tracking-normal">AI brief</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0 text-sm">
                  <div className="rounded-lg border border-pink-300/40 bg-pink-300/16 p-3 text-pink-50">
                    <p className="font-semibold">Best next move</p>
                    <p className="mt-1 text-xs leading-5 text-pink-50/80">
                      Convert the onboarding whiteboard into three launch tasks and attach the latest research note.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full gap-2 border-violet-300/30 bg-violet-300/5 text-violet-100 hover:bg-violet-300/10">
                    <Sparkles className="h-4 w-4 text-violet-200" aria-hidden="true" />
                    Generate template
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
              <Card className="rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur xl:col-span-2">
                <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-3">
                  <CardTitle className="text-base tracking-normal">Task board</CardTitle>
                  <span className="rounded-md border border-lime-300/30 bg-lime-300/10 px-2 py-1 text-xs font-semibold text-lime-200">Live</span>
                </CardHeader>
                <CardContent className="grid gap-3 p-4 pt-0 md:grid-cols-3">
                  {tasks.map((task) => (
                    <div key={task.title} className={cn("rounded-lg border border-l-4 border-border bg-background/60 p-3", task.color)}>
                      <p className="text-sm font-semibold leading-5 text-cyan-50">{task.title}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{task.status}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-base tracking-normal">Pinned notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0">
                  {[
                    "Meeting themes: speed, signal, fewer tabs.",
                    "Ask AI to summarize research matrix.",
                    "Ship dashboard shell before routes.",
                  ].map((note) => (
                    <div key={note} className="rounded-md border border-yellow-300/20 bg-yellow-300/10 px-3 py-2 text-xs leading-5 text-yellow-100">
                      {note}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <Card className="overflow-hidden rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
              <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-3">
                <CardTitle className="text-base tracking-normal">Whiteboard preview</CardTitle>
                <Button variant="outline" size="sm" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10">Open canvas</Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative h-56 overflow-hidden rounded-lg border border-dashed border-cyan-200/35 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.28)_1px,transparent_0)] [background-size:18px_18px]">
                  <div className="absolute left-[8%] top-8 rounded-lg border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                    Ideas
                  </div>
                  <div className="absolute left-[38%] top-20 rounded-lg border border-fuchsia-300/35 bg-fuchsia-300/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.18)]">
                    Prioritize
                  </div>
                  <div className="absolute right-[10%] top-10 rounded-lg border border-lime-300/35 bg-lime-300/10 px-4 py-3 text-sm font-semibold text-lime-100 shadow-[0_0_18px_rgba(132,204,22,0.18)]">
                    Ship
                  </div>
                  <div className="absolute bottom-8 left-[23%] flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-100 shadow-[0_0_18px_rgba(251,113,133,0.16)]">
                    <Target className="h-3.5 w-3.5" aria-hidden="true" />
                    Focus path
                  </div>
                  <FileText className="absolute bottom-9 right-[28%] h-12 w-12 text-indigo-300/60 drop-shadow-[0_0_14px_rgba(165,180,252,0.35)]" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

