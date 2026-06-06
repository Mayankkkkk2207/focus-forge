import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { syncCurrentUserToDatabase } from '@/lib/sync-user';

export const kanbanPriorities = new Set(['low', 'medium', 'high']);
export const defaultColumns = ['Todo', 'In Progress', 'Done'];

export async function getKanbanContext() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const databaseUser = await syncCurrentUserToDatabase();

  if (!databaseUser) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return {
    databaseUser,
    supabase: createSupabaseAdminClient(),
  };
}

export function kanbanDatabaseErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('kanban_boards') ||
    normalized.includes('kanban_columns') ||
    normalized.includes('kanban_tasks')
  ) {
    return 'The Kanban tables do not exist in Supabase yet. Run the Kanban migration, then reload this page.';
  }

  return message;
}

export function textOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function dateOrNull(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function integerOrDefault(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function booleanOrDefault(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export function labelsOrDefault(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((label): label is string => typeof label === 'string')
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export async function boardBelongsToUser(supabase: ReturnType<typeof createSupabaseAdminClient>, boardId: string, userId: string) {
  const { data, error } = await supabase
    .from('kanban_boards')
    .select('id')
    .eq('id', boardId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(kanbanDatabaseErrorMessage(error.message));
  }

  return Boolean(data);
}

export async function getColumnForUser(supabase: ReturnType<typeof createSupabaseAdminClient>, columnId: string, userId: string) {
  const { data: column, error } = await supabase
    .from('kanban_columns')
    .select('id, board_id, name, position')
    .eq('id', columnId)
    .maybeSingle();

  if (error) {
    throw new Error(kanbanDatabaseErrorMessage(error.message));
  }

  if (!column) {
    return null;
  }

  const allowed = await boardBelongsToUser(supabase, column.board_id, userId);
  return allowed ? column : null;
}

export async function getTaskForUser(supabase: ReturnType<typeof createSupabaseAdminClient>, taskId: string, userId: string) {
  const { data: task, error } = await supabase
    .from('kanban_tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle();

  if (error) {
    throw new Error(kanbanDatabaseErrorMessage(error.message));
  }

  if (!task) {
    return null;
  }

  const allowed = await boardBelongsToUser(supabase, task.board_id, userId);
  return allowed ? task : null;
}

export async function nextColumnPosition(supabase: ReturnType<typeof createSupabaseAdminClient>, boardId: string) {
  const { data, error } = await supabase
    .from('kanban_columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(kanbanDatabaseErrorMessage(error.message));
  }

  return (data?.[0]?.position ?? -1) + 1;
}

export async function nextTaskPosition(supabase: ReturnType<typeof createSupabaseAdminClient>, columnId: string) {
  const { data, error } = await supabase
    .from('kanban_tasks')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(kanbanDatabaseErrorMessage(error.message));
  }

  return (data?.[0]?.position ?? -1) + 1;
}
