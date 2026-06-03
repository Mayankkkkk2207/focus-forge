"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Columns3,
  FileText,
  GripVertical,
  LayoutDashboard,
  Layers3,
  Mail,
  Menu,
  PenTool,
  Plus,
  Search,
  Settings,
  Shapes,
  Sparkles,
  StickyNote,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CalendarItem = {
  id: string;
  title: string;
  description: string | null;
  item_type: "task" | "reminder";
  category: string;
  color: ColorKey;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: "open" | "in_progress" | "done" | "snoozed";
  priority: "low" | "medium" | "high";
  reminder_email: string | null;
  reminder_lead_minutes: number | null;
  created_at: string;
  updated_at: string;
};

type CalendarView = "month" | "week";
type ColorKey = "cyan" | "pink" | "lime" | "violet" | "amber" | "emerald" | "rose" | "indigo";

type ItemFormState = {
  id?: string;
  title: string;
  description: string;
  item_type: "task" | "reminder";
  category: string;
  color: ColorKey;
  scheduled_date: string;
  scheduled_time: string;
  status: "open" | "in_progress" | "done" | "snoozed";
  priority: "low" | "medium" | "high";
  reminder_email: string;
  reminder_lead_minutes: string;
  saveAsDraft: boolean;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const navGroups = [
  {
    label: "Command",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-cyan-200" },
      { name: "AI Assistant", href: "#", icon: Bot, color: "text-pink-300" },
      { name: "Calendar", href: "/calendar", icon: CalendarDays, color: "text-lime-200", active: true },
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

const categoryOptions: Array<{ label: string; color: ColorKey }> = [
  { label: "Focus", color: "cyan" },
  { label: "Deadline", color: "pink" },
  { label: "Planning", color: "lime" },
  { label: "Personal", color: "violet" },
  { label: "Follow-up", color: "amber" },
  { label: "Deep Work", color: "emerald" },
  { label: "Urgent", color: "rose" },
  { label: "Research", color: "indigo" },
];

const colorStyles: Record<ColorKey, { chip: string; soft: string; border: string; text: string; dot: string }> = {
  cyan: {
    chip: "border-cyan-300/45 bg-cyan-300/14 text-cyan-50",
    soft: "bg-cyan-300/10",
    border: "border-cyan-300/35",
    text: "text-cyan-100",
    dot: "bg-cyan-300",
  },
  pink: {
    chip: "border-pink-300/45 bg-pink-300/14 text-pink-50",
    soft: "bg-pink-300/10",
    border: "border-pink-300/35",
    text: "text-pink-100",
    dot: "bg-pink-300",
  },
  lime: {
    chip: "border-lime-300/45 bg-lime-300/14 text-lime-50",
    soft: "bg-lime-300/10",
    border: "border-lime-300/35",
    text: "text-lime-100",
    dot: "bg-lime-300",
  },
  violet: {
    chip: "border-violet-300/45 bg-violet-300/14 text-violet-50",
    soft: "bg-violet-300/10",
    border: "border-violet-300/35",
    text: "text-violet-100",
    dot: "bg-violet-300",
  },
  amber: {
    chip: "border-amber-300/45 bg-amber-300/14 text-amber-50",
    soft: "bg-amber-300/10",
    border: "border-amber-300/35",
    text: "text-amber-100",
    dot: "bg-amber-300",
  },
  emerald: {
    chip: "border-emerald-300/45 bg-emerald-300/14 text-emerald-50",
    soft: "bg-emerald-300/10",
    border: "border-emerald-300/35",
    text: "text-emerald-100",
    dot: "bg-emerald-300",
  },
  rose: {
    chip: "border-rose-300/45 bg-rose-300/14 text-rose-50",
    soft: "bg-rose-300/10",
    border: "border-rose-300/35",
    text: "text-rose-100",
    dot: "bg-rose-300",
  },
  indigo: {
    chip: "border-indigo-300/45 bg-indigo-300/14 text-indigo-50",
    soft: "bg-indigo-300/10",
    border: "border-indigo-300/35",
    text: "text-indigo-100",
    dot: "bg-indigo-300",
  },
};

const emptyForm: ItemFormState = {
  title: "",
  description: "",
  item_type: "task",
  category: "Focus",
  color: "cyan",
  scheduled_date: "",
  scheduled_time: "",
  status: "open",
  priority: "medium",
  reminder_email: "",
  reminder_lead_minutes: "30",
  saveAsDraft: false,
};

export default function CalendarPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [view, setView] = useState<CalendarView>("month");
  const [visibleDate, setVisibleDate] = useState(today);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ItemFormState>(emptyForm);

  const visibleDates = useMemo(() => {
    return view === "month" ? getMonthGridDates(visibleDate) : getWeekDates(visibleDate);
  }, [view, visibleDate]);

  const rangeStart = toDateKey(visibleDates[0]);
  const rangeEnd = toDateKey(visibleDates[visibleDates.length - 1]);

  const itemsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarItem[]>();

    for (const item of items) {
      if (!item.scheduled_date) continue;
      const dayItems = grouped.get(item.scheduled_date) ?? [];
      dayItems.push(item);
      grouped.set(item.scheduled_date, dayItems);
    }

    for (const dayItems of grouped.values()) {
      dayItems.sort(sortCalendarItems);
    }

    return grouped;
  }, [items]);

  const draftItems = useMemo(() => items.filter((item) => !item.scheduled_date).sort(sortCalendarItems), [items]);
  const currentMonthLabel = visibleDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekLabel = `${visibleDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${visibleDates[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  useEffect(() => {
    let active = true;

    async function loadItems() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/calendar-items?start=${rangeStart}&end=${rangeEnd}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Calendar items could not be loaded.");
        }

        if (active) {
          setItems(payload.items ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Calendar items could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, [rangeEnd, rangeStart]);

  function openCreateDialog(dateKey = "") {
    const category = categoryOptions[0];
    setForm({
      ...emptyForm,
      category: category.label,
      color: category.color,
      scheduled_date: dateKey,
      saveAsDraft: !dateKey,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: CalendarItem) {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      item_type: item.item_type,
      category: item.category,
      color: item.color,
      scheduled_date: item.scheduled_date ?? "",
      scheduled_time: item.scheduled_time?.slice(0, 5) ?? "",
      status: item.status,
      priority: item.priority,
      reminder_email: item.reminder_email ?? "",
      reminder_lead_minutes: item.reminder_lead_minutes?.toString() ?? "30",
      saveAsDraft: !item.scheduled_date,
    });
    setDialogOpen(true);
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Add a title before saving.");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      item_type: form.item_type,
      category: form.category,
      color: form.color,
      scheduled_date: form.saveAsDraft ? null : form.scheduled_date || null,
      scheduled_time: form.saveAsDraft ? null : form.scheduled_time || null,
      status: form.status,
      priority: form.priority,
      reminder_email: form.reminder_email,
      reminder_lead_minutes: form.reminder_lead_minutes,
    };

    try {
      setError(null);
      const response = await fetch(form.id ? `/api/calendar-items/${form.id}` : "/api/calendar-items", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "The item could not be saved.");
      }

      setItems((current) => {
        if (form.id) {
          return current.map((item) => (item.id === form.id ? result.item : item));
        }

        return [...current, result.item];
      });
      setDialogOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The item could not be saved.");
    }
  }

  async function deleteItem() {
    if (!form.id) return;

    try {
      setError(null);
      const response = await fetch(`/api/calendar-items/${form.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "The item could not be deleted.");
      }

      setItems((current) => current.filter((item) => item.id !== form.id));
      setDialogOpen(false);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The item could not be deleted.");
    }
  }

  async function scheduleItem(itemId: string, dateKey: string) {
    const previous = items;
    const target = items.find((item) => item.id === itemId);

    if (!target || target.scheduled_date === dateKey) {
      return;
    }

    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, scheduled_date: dateKey } : item)));

    try {
      const response = await fetch(`/api/calendar-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_date: dateKey }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "The item could not be rescheduled.");
      }

      setItems((current) => current.map((item) => (item.id === itemId ? result.item : item)));
    } catch (dropError) {
      setItems(previous);
      setError(dropError instanceof Error ? dropError.message : "The item could not be rescheduled.");
    }
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>, dateKey: string) {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/calendar-item-id");
    if (itemId) {
      scheduleItem(itemId, dateKey);
    }
  }

  function moveVisibleDate(direction: -1 | 1) {
    setVisibleDate((current) => (view === "month" ? addMonths(current, direction) : addDays(current, direction * 7)));
  }

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
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
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
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-lime-200">Calendar</p>
                  <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">{view === "month" ? currentMonthLabel : weekLabel}</h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden h-9 items-center gap-2 rounded-md border border-input bg-card/88 px-3 text-sm text-muted-foreground shadow-[0_0_18px_rgba(34,211,238,0.08)] md:flex">
                  <Search className="h-4 w-4 text-cyan-200" aria-hidden="true" />
                  <span>Search tasks, reminders, categories</span>
                </div>
                <div className="flex h-9 rounded-md border border-cyan-300/30 bg-cyan-300/5 p-0.5">
                  {(["month", "week"] as CalendarView[]).map((mode) => (
                    <button
                      key={mode}
                      className={cn(
                        "h-8 rounded px-3 text-xs font-semibold capitalize transition-colors",
                        view === mode ? "bg-cyan-300 text-slate-950" : "text-cyan-100 hover:bg-cyan-300/10"
                      )}
                      onClick={() => setView(mode)}
                      type="button"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="icon" aria-label="Previous period" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => moveVisibleDate(-1)}>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Next period" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => moveVisibleDate(1)}>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button className="gap-2 bg-pink-300 text-slate-950 shadow-[0_0_24px_rgba(249,168,212,0.34)] hover:bg-cyan-200" onClick={() => openCreateDialog(toDateKey(today))}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New
                </Button>
              </div>
            </div>
          </header>

          <div className="grid min-w-0 gap-5 px-4 py-5 md:px-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="min-w-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SignalCard label="Scheduled" value={items.filter((item) => item.scheduled_date).length.toString()} detail="on grid" tone="border-cyan-300/50 bg-cyan-300/16 text-cyan-50" />
                <SignalCard label="Drafts" value={draftItems.length.toString()} detail="ready" tone="border-lime-300/50 bg-lime-300/16 text-lime-50" />
                <SignalCard label="Reminders" value={items.filter((item) => item.item_type === "reminder").length.toString()} detail="email-ready" tone="border-pink-300/50 bg-pink-300/16 text-pink-50" />
                <SignalCard label="High priority" value={items.filter((item) => item.priority === "high").length.toString()} detail="hot" tone="border-rose-300/50 bg-rose-300/16 text-rose-50" />
              </div>

              {error && (
                <div className="rounded-lg border border-rose-300/35 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}

              <Card className="overflow-hidden rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-3">
                  <CardTitle className="text-base tracking-normal">{view === "month" ? "Month view" : "Week view"}</CardTitle>
                  <Button variant="ghost" size="sm" className="text-cyan-200 hover:bg-cyan-300/10 hover:text-cyan-100" onClick={() => setVisibleDate(today)}>
                    Today
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 border-y border-border bg-secondary/50">
                    {weekdays.map((day) => (
                      <div key={day} className="px-2 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className={cn("grid grid-cols-7", view === "month" ? "auto-rows-[minmax(7.25rem,1fr)]" : "auto-rows-[minmax(19rem,1fr)]")}>
                    {visibleDates.map((date) => {
                      const dateKey = toDateKey(date);
                      const dayItems = itemsByDate.get(dateKey) ?? [];
                      const outsideMonth = date.getMonth() !== visibleDate.getMonth() && view === "month";
                      const isToday = dateKey === toDateKey(today);
                      const shownItems = view === "month" ? dayItems.slice(0, 3) : dayItems;

                      return (
                        <button
                          key={dateKey}
                          className={cn(
                            "group flex min-w-0 flex-col border-b border-r border-border/80 bg-background/32 p-2 text-left transition-colors hover:bg-cyan-300/8",
                            outsideMonth && "bg-background/16 text-muted-foreground",
                            isToday && "bg-cyan-300/8"
                          )}
                          onClick={() => openCreateDialog(dateKey)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => handleDrop(event, dateKey)}
                          type="button"
                        >
                          <span className="mb-2 flex items-center justify-between gap-1">
                            <span
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold",
                                isToday ? "bg-cyan-300 text-slate-950" : "text-cyan-50"
                              )}
                            >
                              {date.getDate()}
                            </span>
                            {dayItems.length > 0 && (
                              <span className="rounded border border-lime-300/25 bg-lime-300/10 px-1.5 py-0.5 text-[0.62rem] font-semibold text-lime-100">
                                {dayItems.length}
                              </span>
                            )}
                          </span>

                          <span className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                            {loading && dateKey === rangeStart ? (
                              <span className="rounded-md border border-cyan-300/25 bg-cyan-300/8 px-2 py-1 text-xs text-cyan-100">Loading</span>
                            ) : (
                              shownItems.map((item) => <CalendarChip key={item.id} item={item} onOpen={openEditDialog} />)
                            )}
                            {dayItems.length > shownItems.length && (
                              <span className="px-1 text-[0.68rem] font-medium text-muted-foreground">+{dayItems.length - shownItems.length} more</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            <aside className="min-w-0 space-y-4">
              <Card className="rounded-lg border-lime-300/30 bg-card/90 shadow-[0_0_34px_rgba(132,204,22,0.12)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-3">
                  <div>
                    <CardTitle className="text-base tracking-normal">Draft Task Panel</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">Drag drafts onto any calendar date.</p>
                  </div>
                  <Button variant="outline" size="icon" aria-label="Add draft" className="border-lime-300/30 bg-lime-300/5 text-lime-100 hover:bg-lime-300/10" onClick={() => openCreateDialog()}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0">
                  {draftItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-lime-300/30 bg-lime-300/5 px-3 py-6 text-center text-sm text-lime-100/80">
                      No drafts yet.
                    </div>
                  ) : (
                    draftItems.map((item) => <DraftItem key={item.id} item={item} onOpen={openEditDialog} />)
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-base tracking-normal">Categories</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 p-4 pt-0">
                  {categoryOptions.map((category) => {
                    const styles = colorStyles[category.color];
                    const count = items.filter((item) => item.category === category.label).length;

                    return (
                      <div key={category.label} className={cn("rounded-lg border px-3 py-2", styles.border, styles.soft)}>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", styles.dot)} />
                          <span className={cn("min-w-0 flex-1 truncate text-xs font-semibold", styles.text)}>{category.label}</span>
                        </div>
                        <p className="mt-1 text-[0.68rem] text-muted-foreground">{count} items</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/72 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-lg border border-cyan-300/30 bg-card text-card-foreground shadow-[0_0_42px_rgba(34,211,238,0.18)] sm:rounded-lg">
            <form onSubmit={saveItem}>
              <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{form.id ? "Edit item" : "Create item"}</p>
                  <h2 className="mt-1 text-lg font-semibold text-cyan-50">{form.saveAsDraft ? "Draft task" : form.scheduled_date || "Unscheduled"}</h2>
                </div>
                <Button variant="outline" size="icon" aria-label="Close dialog" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => setDialogOpen(false)} type="button">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-2">
                {error && (
                  <div className="rounded-lg border border-rose-300/35 bg-rose-300/10 px-3 py-2 text-sm text-rose-100 md:col-span-2">
                    {error}
                  </div>
                )}
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Title</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Plan sprint review" />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Description</span>
                  <textarea className="min-h-20 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Notes, context, links" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Type</span>
                  <select className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={form.item_type} onChange={(event) => setForm({ ...form, item_type: event.target.value as ItemFormState["item_type"] })}>
                    <option value="task">Task</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Category</span>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                    value={form.category}
                    onChange={(event) => {
                      const category = categoryOptions.find((option) => option.label === event.target.value) ?? categoryOptions[0];
                      setForm({ ...form, category: category.label, color: category.color });
                    }}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.label} value={category.label}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Date</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" type="date" value={form.scheduled_date} onChange={(event) => setForm({ ...form, scheduled_date: event.target.value, saveAsDraft: false })} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Time</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" type="time" value={form.scheduled_time} onChange={(event) => setForm({ ...form, scheduled_time: event.target.value })} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Status</span>
                  <select className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ItemFormState["status"] })}>
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="snoozed">Snoozed</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Priority</span>
                  <select className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ItemFormState["priority"] })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Reminder email</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" type="email" value={form.reminder_email} onChange={(event) => setForm({ ...form, reminder_email: event.target.value })} placeholder="you@example.com" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Lead time</span>
                  <select className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={form.reminder_lead_minutes} onChange={(event) => setForm({ ...form, reminder_lead_minutes: event.target.value })}>
                    <option value="0">At time</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 rounded-md border border-lime-300/25 bg-lime-300/8 px-3 py-2 text-sm text-lime-100 md:col-span-2">
                  <input className="h-4 w-4 accent-lime-300" type="checkbox" checked={form.saveAsDraft} onChange={(event) => setForm({ ...form, saveAsDraft: event.target.checked })} />
                  Save in Draft Task Panel
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {form.id && (
                    <Button variant="outline" className="gap-2 border-rose-300/35 bg-rose-300/5 text-rose-100 hover:bg-rose-300/10" onClick={deleteItem} type="button">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => setDialogOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button className="bg-pink-300 text-slate-950 hover:bg-cyan-200" type="submit">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SignalCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <Card className="rounded-lg border-border bg-card/90 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-50">{value}</p>
          </div>
          <span className={cn("rounded-md border px-2 py-1 text-[0.68rem] font-semibold", tone)}>{detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarChip({ item, onOpen }: { item: CalendarItem; onOpen: (item: CalendarItem) => void }) {
  const styles = colorStyles[item.color] ?? colorStyles.cyan;

  return (
    <span
      draggable
      onClick={(event) => {
        event.stopPropagation();
        onOpen(item);
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/calendar-item-id", item.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={cn("flex min-h-7 cursor-grab items-center gap-1 rounded-md border px-1.5 py-1 text-[0.68rem] font-semibold shadow-[0_0_14px_rgba(15,23,42,0.18)] active:cursor-grabbing", styles.chip)}
      role="button"
      tabIndex={0}
    >
      {item.item_type === "reminder" ? <AlarmClock className="h-3 w-3 shrink-0" aria-hidden="true" /> : <Circle className="h-3 w-3 shrink-0 fill-current" aria-hidden="true" />}
      <span className="min-w-0 flex-1 truncate">{item.title}</span>
      {item.scheduled_time && <span className="shrink-0 opacity-80">{item.scheduled_time.slice(0, 5)}</span>}
    </span>
  );
}

function DraftItem({ item, onOpen }: { item: CalendarItem; onOpen: (item: CalendarItem) => void }) {
  const styles = colorStyles[item.color] ?? colorStyles.cyan;

  return (
    <button
      draggable
      onClick={() => onOpen(item)}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/calendar-item-id", item.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={cn("w-full rounded-lg border p-3 text-left transition-colors hover:bg-white/[0.035]", styles.border, styles.soft)}
      type="button"
    >
      <div className="flex items-start gap-2">
        <GripVertical className={cn("mt-0.5 h-4 w-4 shrink-0", styles.text)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {item.item_type === "reminder" ? <AlarmClock className={cn("h-3.5 w-3.5", styles.text)} aria-hidden="true" /> : <Target className={cn("h-3.5 w-3.5", styles.text)} aria-hidden="true" />}
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-cyan-50">{item.title}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[0.68rem] font-semibold">
            <span className={cn("rounded border px-1.5 py-0.5", styles.chip)}>{item.category}</span>
            <span className="rounded border border-cyan-300/20 bg-cyan-300/8 px-1.5 py-0.5 text-cyan-100">{item.priority}</span>
            {item.reminder_email && (
              <span className="inline-flex items-center gap-1 rounded border border-pink-300/20 bg-pink-300/8 px-1.5 py-0.5 text-pink-100">
                <Mail className="h-3 w-3" aria-hidden="true" />
                ready
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function sortCalendarItems(first: CalendarItem, second: CalendarItem) {
  const firstTime = first.scheduled_time ?? "99:99";
  const secondTime = second.scheduled_time ?? "99:99";

  if (firstTime !== secondTime) {
    return firstTime.localeCompare(secondTime);
  }

  return first.created_at.localeCompare(second.created_at);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function getWeekDates(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getMonthGridDates(date: Date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
