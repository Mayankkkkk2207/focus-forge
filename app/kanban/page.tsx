"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Columns3,
  FileText,
  GripVertical,
  LayoutDashboard,
  Layers3,
  Mail,
  Menu,
  MoreHorizontal,
  PenLine,
  PenTool,
  Plus,
  Search,
  Settings,
  Shapes,
  Sparkles,
  StickyNote,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ColorKey = "cyan" | "pink" | "lime" | "violet" | "amber" | "emerald" | "rose" | "indigo";
type Priority = "low" | "medium" | "high";

type KanbanBoard = {
  id: string;
  user_id: string;
  name: string;
  color: ColorKey;
  created_at: string;
  updated_at: string;
};

type KanbanColumn = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type KanbanTask = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  labels: string[];
  sync_calendar: boolean;
  sync_notes: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

type BoardFormState = {
  id?: string;
  name: string;
  color: ColorKey;
};

type TaskFormState = {
  id?: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: Priority;
  labels: string;
  sync_calendar: boolean;
  sync_notes: boolean;
};

const navGroups = [
  {
    label: "Command",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-cyan-200" },
      { name: "AI Assistant", href: "#", icon: Bot, color: "text-pink-300" },
      { name: "Calendar", href: "/calendar", icon: CalendarDays, color: "text-lime-200" },
    ],
  },
  {
    label: "Create",
    items: [
      { name: "Task / Kanban", href: "/kanban", icon: Columns3, color: "text-emerald-200", active: true },
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

const colorOptions: Array<{ label: string; value: ColorKey }> = [
  { label: "Cyan", value: "cyan" },
  { label: "Pink", value: "pink" },
  { label: "Lime", value: "lime" },
  { label: "Violet", value: "violet" },
  { label: "Amber", value: "amber" },
  { label: "Emerald", value: "emerald" },
  { label: "Rose", value: "rose" },
  { label: "Indigo", value: "indigo" },
];

const colorStyles: Record<ColorKey, { chip: string; soft: string; border: string; text: string; dot: string; glow: string }> = {
  cyan: { chip: "border-cyan-300/45 bg-cyan-300/14 text-cyan-50", soft: "bg-cyan-300/10", border: "border-cyan-300/35", text: "text-cyan-100", dot: "bg-cyan-300", glow: "shadow-[0_0_18px_rgba(34,211,238,0.25)]" },
  pink: { chip: "border-pink-300/45 bg-pink-300/14 text-pink-50", soft: "bg-pink-300/10", border: "border-pink-300/35", text: "text-pink-100", dot: "bg-pink-300", glow: "shadow-[0_0_18px_rgba(249,168,212,0.25)]" },
  lime: { chip: "border-lime-300/45 bg-lime-300/14 text-lime-50", soft: "bg-lime-300/10", border: "border-lime-300/35", text: "text-lime-100", dot: "bg-lime-300", glow: "shadow-[0_0_18px_rgba(190,242,100,0.2)]" },
  violet: { chip: "border-violet-300/45 bg-violet-300/14 text-violet-50", soft: "bg-violet-300/10", border: "border-violet-300/35", text: "text-violet-100", dot: "bg-violet-300", glow: "shadow-[0_0_18px_rgba(196,181,253,0.2)]" },
  amber: { chip: "border-amber-300/45 bg-amber-300/14 text-amber-50", soft: "bg-amber-300/10", border: "border-amber-300/35", text: "text-amber-100", dot: "bg-amber-300", glow: "shadow-[0_0_18px_rgba(252,211,77,0.2)]" },
  emerald: { chip: "border-emerald-300/45 bg-emerald-300/14 text-emerald-50", soft: "bg-emerald-300/10", border: "border-emerald-300/35", text: "text-emerald-100", dot: "bg-emerald-300", glow: "shadow-[0_0_18px_rgba(110,231,183,0.22)]" },
  rose: { chip: "border-rose-300/45 bg-rose-300/14 text-rose-50", soft: "bg-rose-300/10", border: "border-rose-300/35", text: "text-rose-100", dot: "bg-rose-300", glow: "shadow-[0_0_18px_rgba(253,164,175,0.2)]" },
  indigo: { chip: "border-indigo-300/45 bg-indigo-300/14 text-indigo-50", soft: "bg-indigo-300/10", border: "border-indigo-300/35", text: "text-indigo-100", dot: "bg-indigo-300", glow: "shadow-[0_0_18px_rgba(165,180,252,0.2)]" },
};

const priorityStyles: Record<Priority, string> = {
  low: "border-lime-300/35 bg-lime-300/10 text-lime-100",
  medium: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
  high: "border-pink-300/35 bg-pink-300/12 text-pink-100",
};

const emptyBoardForm: BoardFormState = {
  name: "",
  color: "emerald",
};

const emptyTaskForm: TaskFormState = {
  board_id: "",
  column_id: "",
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  labels: "",
  sync_calendar: false,
  sync_notes: false,
};

export default function KanbanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [boardForm, setBoardForm] = useState<BoardFormState>(emptyBoardForm);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState("");

  const selectedBoard = boards.find((board) => board.id === selectedBoardId) ?? boards[0];
  const selectedColumns = useMemo(
    () => columns.filter((column) => column.board_id === selectedBoard?.id).sort(sortByPosition),
    [columns, selectedBoard?.id]
  );
  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.board_id === selectedBoard?.id).sort(sortByPosition),
    [tasks, selectedBoard?.id]
  );
  const tasksByColumn = useMemo(() => {
    const grouped = new Map<string, KanbanTask[]>();

    for (const task of selectedTasks) {
      const columnTasks = grouped.get(task.column_id) ?? [];
      columnTasks.push(task);
      grouped.set(task.column_id, columnTasks);
    }

    return grouped;
  }, [selectedTasks]);

  useEffect(() => {
    let active = true;

    async function loadKanban() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/kanban/boards");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Kanban boards could not be loaded.");
        }

        if (active) {
          const loadedBoards = payload.boards ?? [];
          setBoards(loadedBoards);
          setColumns(payload.columns ?? []);
          setTasks((payload.tasks ?? []).map(normalizeTask));
          setSelectedBoardId((current) => current || loadedBoards[0]?.id || "");
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Kanban boards could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadKanban();

    return () => {
      active = false;
    };
  }, []);

  function openCreateBoardDialog() {
    setBoardForm(emptyBoardForm);
    setBoardDialogOpen(true);
  }

  function openEditBoardDialog(board: KanbanBoard) {
    setBoardForm({ id: board.id, name: board.name, color: board.color });
    setBoardDialogOpen(true);
  }

  function openCreateTaskDialog(columnId: string) {
    setTaskForm({
      ...emptyTaskForm,
      board_id: selectedBoard?.id ?? "",
      column_id: columnId,
      due_date: toDateKey(new Date()),
    });
    setTaskDialogOpen(true);
  }

  function openEditTaskDialog(task: KanbanTask) {
    setTaskForm({
      id: task.id,
      board_id: task.board_id,
      column_id: task.column_id,
      title: task.title,
      description: task.description ?? "",
      due_date: task.due_date ?? "",
      priority: task.priority,
      labels: task.labels.join(", "),
      sync_calendar: task.sync_calendar,
      sync_notes: task.sync_notes,
    });
    setTaskDialogOpen(true);
  }

  async function saveBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!boardForm.name.trim()) {
      setError("Add a board name before saving.");
      return;
    }

    await runSavedAction(async () => {
      const response = await fetch(boardForm.id ? `/api/kanban/boards/${boardForm.id}` : "/api/kanban/boards", {
        method: boardForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boardForm.name, color: boardForm.color }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Board could not be saved to Supabase.");
      }

      if (boardForm.id) {
        setBoards((current) => current.map((board) => (board.id === boardForm.id ? result.board : board)));
      } else {
        setBoards((current) => [...current, result.board]);
        setColumns((current) => [...current, ...(result.columns ?? [])]);
        setSelectedBoardId(result.board.id);
      }

      setBoardDialogOpen(false);
    });
  }

  async function deleteBoard(board: KanbanBoard) {
    await runSavedAction(async () => {
      const response = await fetch(`/api/kanban/boards/${board.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Board could not be deleted from Supabase.");
      }

      setBoards((current) => current.filter((item) => item.id !== board.id));
      setColumns((current) => current.filter((column) => column.board_id !== board.id));
      setTasks((current) => current.filter((task) => task.board_id !== board.id));
      setSelectedBoardId((current) => {
        if (current !== board.id) return current;
        return boards.find((item) => item.id !== board.id)?.id ?? "";
      });
    });
  }

  async function createColumn() {
    if (!selectedBoard) return;

    await runSavedAction(async () => {
      const response = await fetch("/api/kanban/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id: selectedBoard.id, name: "New Column" }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Column could not be saved to Supabase.");
      }

      setColumns((current) => [...current, result.column]);
      setEditingColumnId(result.column.id);
      setEditingColumnName(result.column.name);
    });
  }

  async function saveColumnName(columnId: string) {
    if (!editingColumnName.trim()) {
      setError("Column name is required.");
      return;
    }

    await runSavedAction(async () => {
      const response = await fetch(`/api/kanban/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingColumnName }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Column could not be saved to Supabase.");
      }

      setColumns((current) => current.map((column) => (column.id === columnId ? result.column : column)));
      setEditingColumnId(null);
    });
  }

  async function deleteColumn(column: KanbanColumn) {
    await runSavedAction(async () => {
      const response = await fetch(`/api/kanban/columns/${column.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Column could not be deleted from Supabase.");
      }

      setColumns((current) => current.filter((item) => item.id !== column.id));
    });
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      setError("Add a task title before saving.");
      return;
    }

    const payload = {
      board_id: taskForm.board_id,
      column_id: taskForm.column_id,
      title: taskForm.title,
      description: taskForm.description,
      due_date: taskForm.due_date || null,
      priority: taskForm.priority,
      labels: parseLabels(taskForm.labels),
      sync_calendar: taskForm.sync_calendar,
      sync_notes: taskForm.sync_notes,
    };

    await runSavedAction(async () => {
      const response = await fetch(taskForm.id ? `/api/kanban/tasks/${taskForm.id}` : "/api/kanban/tasks", {
        method: taskForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Task could not be saved to Supabase.");
      }

      const task = normalizeTask(result.task);
      setTasks((current) => (taskForm.id ? current.map((item) => (item.id === task.id ? task : item)) : [...current, task]));
      setTaskDialogOpen(false);
    });
  }

  async function deleteTask() {
    if (!taskForm.id) return;

    await runSavedAction(async () => {
      const response = await fetch(`/api/kanban/tasks/${taskForm.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Task could not be deleted from Supabase.");
      }

      setTasks((current) => current.filter((task) => task.id !== taskForm.id));
      setTaskDialogOpen(false);
    });
  }

  async function moveTask(taskId: string, columnId: string) {
    const previousTasks = tasks;
    const target = tasks.find((task) => task.id === taskId);

    if (!target || target.column_id === columnId) {
      return;
    }

    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, column_id: columnId } : task)));

    try {
      const response = await fetch(`/api/kanban/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column_id: columnId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Task move could not be saved to Supabase.");
      }

      setTasks((current) => current.map((task) => (task.id === taskId ? normalizeTask(result.task) : task)));
      setError(null);
    } catch (moveError) {
      setTasks(previousTasks);
      setError(moveError instanceof Error ? moveError.message : "Task move could not be saved to Supabase.");
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, columnId: string) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/kanban-task-id");
    if (taskId) {
      moveTask(taskId, columnId);
    }
  }

  async function runSavedAction(action: () => Promise<void>) {
    setSaving(true);
    setError(null);

    try {
      await action();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The change could not be saved to Supabase.");
    } finally {
      setSaving(false);
    }
  }

  const boardStyles = selectedBoard ? colorStyles[selectedBoard.color] ?? colorStyles.emerald : colorStyles.emerald;

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
                <span className="block truncate text-muted-foreground">Supabase synced</span>
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
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">Kanban / Tasks</p>
                  <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">{selectedBoard?.name ?? "Task boards"}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden h-9 items-center gap-2 rounded-md border border-input bg-card/88 px-3 text-sm text-muted-foreground shadow-[0_0_18px_rgba(34,211,238,0.08)] sm:flex">
                  <Search className="h-4 w-4 text-cyan-200" aria-hidden="true" />
                  <span>Search boards and tasks</span>
                </div>
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/8 px-3 text-xs font-semibold text-emerald-100">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Supabase source
                </span>
                <Button variant="outline" size="icon" aria-label="Notifications" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button className="gap-2 bg-pink-300 text-slate-950 shadow-[0_0_24px_rgba(249,168,212,0.34)] hover:bg-cyan-200" onClick={openCreateBoardDialog}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Board
                </Button>
              </div>
            </div>
          </header>

          <div className="min-w-0 px-4 py-5 md:px-6">
            {error && (
              <div className="mb-4 rounded-lg border border-rose-300/35 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
                {error}
              </div>
            )}

            <div className="grid min-w-0 gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
              <aside className="min-w-0">
                <Card className="rounded-lg border-emerald-300/30 bg-card/90 shadow-[0_0_34px_rgba(16,185,129,0.12)] backdrop-blur">
                  <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-3">
                    <div>
                      <CardTitle className="text-base tracking-normal">Boards</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">{boards.length} saved in Supabase</p>
                    </div>
                    <Button variant="outline" size="icon" aria-label="Create board" className="border-emerald-300/30 bg-emerald-300/5 text-emerald-100 hover:bg-emerald-300/10" onClick={openCreateBoardDialog}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4 pt-0">
                    {loading ? (
                      <div className="rounded-lg border border-dashed border-emerald-300/30 bg-emerald-300/5 px-3 py-6 text-center text-sm text-emerald-100/80">
                        Loading boards...
                      </div>
                    ) : boards.length === 0 ? (
                      <button
                        className="w-full rounded-lg border border-dashed border-emerald-300/30 bg-emerald-300/5 px-3 py-6 text-center text-sm text-emerald-100/80 transition-colors hover:bg-emerald-300/10"
                        onClick={openCreateBoardDialog}
                        type="button"
                      >
                        Create your first Kanban board.
                      </button>
                    ) : (
                      boards.map((board) => {
                        const styles = colorStyles[board.color] ?? colorStyles.emerald;
                        const isSelected = board.id === selectedBoard?.id;

                        return (
                          <button
                            key={board.id}
                            className={cn(
                              "group w-full rounded-lg border p-3 text-left transition-colors hover:bg-white/[0.035]",
                              isSelected ? cn(styles.border, styles.soft, styles.glow) : "border-border bg-background/45"
                            )}
                            onClick={() => setSelectedBoardId(board.id)}
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", styles.dot)} />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cyan-50">{board.name}</span>
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2 text-[0.68rem] text-muted-foreground">
                              <span>{columns.filter((column) => column.board_id === board.id).length} columns</span>
                              <span>{tasks.filter((task) => task.board_id === board.id).length} tasks</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </aside>

              <section className="min-w-0">
                <div className={cn("mb-4 rounded-lg border bg-card/90 p-4 shadow-[0_0_28px_rgba(15,23,42,0.35)] backdrop-blur", boardStyles.border)}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", boardStyles.dot)} />
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Board</p>
                      </div>
                      <h2 className="mt-1 truncate text-xl font-semibold text-cyan-50">{selectedBoard?.name ?? "No board selected"}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedBoard && (
                        <Button variant="outline" className="gap-2 border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => openEditBoardDialog(selectedBoard)}>
                          <PenLine className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="gap-2 border-lime-300/30 bg-lime-300/5 text-lime-100 hover:bg-lime-300/10"
                        disabled={!selectedBoard || selectedColumns.length >= 5 || saving}
                        onClick={createColumn}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Column
                      </Button>
                    </div>
                  </div>
                </div>

                {!selectedBoard ? (
                  <div className="rounded-lg border border-dashed border-cyan-300/30 bg-card/70 px-4 py-16 text-center text-sm text-cyan-100/80">
                    Create a board to start organizing tasks.
                  </div>
                ) : (
                  <div className="min-w-0 overflow-x-auto pb-2">
                    <div className="grid min-w-[760px] gap-3 md:grid-cols-3 xl:auto-cols-[minmax(15rem,1fr)] xl:grid-flow-col xl:grid-cols-none">
                      {selectedColumns.map((column) => {
                        const columnTasks = tasksByColumn.get(column.id) ?? [];

                        return (
                          <div
                            key={column.id}
                            className="flex min-h-[32rem] min-w-0 flex-col rounded-lg border border-border bg-card/88 shadow-[0_0_28px_rgba(15,23,42,0.3)] backdrop-blur"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleDrop(event, column.id)}
                          >
                            <div className="border-b border-border p-3">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                {editingColumnId === column.id ? (
                                  <form
                                    className="flex min-w-0 flex-1 gap-2"
                                    onSubmit={(event) => {
                                      event.preventDefault();
                                      saveColumnName(column.id);
                                    }}
                                  >
                                    <input
                                      className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background/70 px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                                      value={editingColumnName}
                                      onChange={(event) => setEditingColumnName(event.target.value)}
                                    />
                                    <Button size="sm" className="bg-pink-300 text-slate-950 hover:bg-cyan-200" type="submit">
                                      Save
                                    </Button>
                                  </form>
                                ) : (
                                  <>
                                    <div className="min-w-0 flex-1">
                                      <h3 className="truncate text-sm font-semibold text-cyan-50">{column.name}</h3>
                                      <p className="mt-0.5 text-[0.68rem] text-muted-foreground">{columnTasks.length} tasks</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Edit column"
                                      className="h-8 w-8 text-cyan-100 hover:bg-cyan-300/10"
                                      onClick={() => {
                                        setEditingColumnId(column.id);
                                        setEditingColumnName(column.name);
                                      }}
                                    >
                                      <PenLine className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Delete column"
                                      className="h-8 w-8 text-rose-100 hover:bg-rose-300/10"
                                      onClick={() => deleteColumn(column)}
                                    >
                                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                              {columnTasks.length === 0 ? (
                                <button
                                  className="w-full rounded-lg border border-dashed border-cyan-300/25 bg-cyan-300/5 px-3 py-8 text-center text-sm text-cyan-100/70 transition-colors hover:bg-cyan-300/10"
                                  onClick={() => openCreateTaskDialog(column.id)}
                                  type="button"
                                >
                                  Add a task
                                </button>
                              ) : (
                                columnTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={openEditTaskDialog} />)
                              )}
                            </div>

                            <div className="border-t border-border p-3">
                              <Button variant="outline" className="w-full gap-2 border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => openCreateTaskDialog(column.id)}>
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Task
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>

      {boardDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/72 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-lg border border-emerald-300/30 bg-card text-card-foreground shadow-[0_0_42px_rgba(16,185,129,0.18)] sm:rounded-lg">
            <form onSubmit={saveBoard}>
              <DialogHeader title={boardForm.id ? "Edit board" : "Create board"} subtitle="Saved directly to Supabase" onClose={() => setBoardDialogOpen(false)} />
              <div className="grid gap-4 p-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Board name</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={boardForm.name} onChange={(event) => setBoardForm({ ...boardForm, name: event.target.value })} placeholder="Launch board" />
                </label>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Board color</span>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((option) => {
                      const styles = colorStyles[option.value];
                      return (
                        <button
                          key={option.value}
                          className={cn("flex h-10 items-center gap-2 rounded-md border px-2 text-xs font-semibold transition-colors", styles.border, boardForm.color === option.value ? styles.soft : "bg-background/50")}
                          onClick={() => setBoardForm({ ...boardForm, color: option.value })}
                          type="button"
                        >
                          <span className={cn("h-2.5 w-2.5 rounded-full", styles.dot)} />
                          <span className="truncate">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {boardForm.id && selectedBoard && (
                    <Button variant="outline" className="gap-2 border-rose-300/35 bg-rose-300/5 text-rose-100 hover:bg-rose-300/10" onClick={() => deleteBoard(selectedBoard)} type="button">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => setBoardDialogOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button className="bg-pink-300 text-slate-950 hover:bg-cyan-200" disabled={saving} type="submit">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/72 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-lg border border-cyan-300/30 bg-card text-card-foreground shadow-[0_0_42px_rgba(34,211,238,0.18)] sm:rounded-lg">
            <form onSubmit={saveTask}>
              <DialogHeader title={taskForm.id ? "Edit task" : "Create task"} subtitle="Task changes save to Supabase" onClose={() => setTaskDialogOpen(false)} />
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Title</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="Prepare roadmap review" />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Description</span>
                  <textarea className="min-h-20 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} placeholder="Context, blockers, links" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Due date</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" type="date" value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Priority</span>
                  <select className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as Priority })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">Labels</span>
                  <input className="h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm outline-none focus:ring-1 focus:ring-ring" value={taskForm.labels} onChange={(event) => setTaskForm({ ...taskForm, labels: event.target.value })} placeholder="Design, Research, Sprint" />
                </label>
                <label className="flex items-center gap-2 rounded-md border border-lime-300/25 bg-lime-300/8 px-3 py-2 text-sm text-lime-100">
                  <input className="h-4 w-4 accent-lime-300" type="checkbox" checked={taskForm.sync_calendar} onChange={(event) => setTaskForm({ ...taskForm, sync_calendar: event.target.checked })} />
                  Sync metadata with Calendar
                </label>
                <label className="flex items-center gap-2 rounded-md border border-amber-300/25 bg-amber-300/8 px-3 py-2 text-sm text-amber-100">
                  <input className="h-4 w-4 accent-amber-300" type="checkbox" checked={taskForm.sync_notes} onChange={(event) => setTaskForm({ ...taskForm, sync_notes: event.target.checked })} />
                  Sync metadata with Notes
                </label>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {taskForm.id && (
                    <Button variant="outline" className="gap-2 border-rose-300/35 bg-rose-300/5 text-rose-100 hover:bg-rose-300/10" onClick={deleteTask} type="button">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={() => setTaskDialogOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button className="bg-pink-300 text-slate-950 hover:bg-cyan-200" disabled={saving} type="submit">
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

function DialogHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{subtitle}</p>
        <h2 className="mt-1 text-lg font-semibold text-cyan-50">{title}</h2>
      </div>
      <Button variant="outline" size="icon" aria-label="Close dialog" className="border-cyan-300/30 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" onClick={onClose} type="button">
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function TaskCard({ task, onOpen }: { task: KanbanTask; onOpen: (task: KanbanTask) => void }) {
  return (
    <button
      draggable
      className="w-full rounded-lg border border-border bg-background/60 p-3 text-left shadow-[0_0_18px_rgba(15,23,42,0.18)] transition-colors hover:border-cyan-200/35 hover:bg-background/80"
      onClick={() => onOpen(task)}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/kanban-task-id", task.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      type="button"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-cyan-50">{task.title}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[0.68rem] font-semibold">
            <span className={cn("rounded border px-1.5 py-0.5 capitalize", priorityStyles[task.priority])}>{task.priority}</span>
            {task.due_date && (
              <span className="inline-flex items-center gap-1 rounded border border-cyan-300/20 bg-cyan-300/8 px-1.5 py-0.5 text-cyan-100">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {task.due_date}
              </span>
            )}
            {task.labels.slice(0, 3).map((label, index) => (
              <span key={`${task.id}-${label}-${index}`} className="inline-flex items-center gap-1 rounded border border-violet-300/20 bg-violet-300/8 px-1.5 py-0.5 text-violet-100">
                <Tag className="h-3 w-3" aria-hidden="true" />
                {label}
              </span>
            ))}
            {task.sync_calendar && (
              <span className="inline-flex items-center gap-1 rounded border border-lime-300/20 bg-lime-300/8 px-1.5 py-0.5 text-lime-100">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                Cal
              </span>
            )}
            {task.sync_notes && (
              <span className="inline-flex items-center gap-1 rounded border border-amber-300/20 bg-amber-300/8 px-1.5 py-0.5 text-amber-100">
                <FileText className="h-3 w-3" aria-hidden="true" />
                Notes
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function normalizeTask(task: KanbanTask): KanbanTask {
  return {
    ...task,
    labels: Array.isArray(task.labels) ? task.labels : [],
  };
}

function parseLabels(value: string) {
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function sortByPosition<T extends { position: number; created_at: string }>(first: T, second: T) {
  if (first.position !== second.position) {
    return first.position - second.position;
  }

  return first.created_at.localeCompare(second.created_at);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
