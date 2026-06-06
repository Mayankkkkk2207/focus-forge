import { NextRequest, NextResponse } from 'next/server';

import {
  booleanOrDefault,
  dateOrNull,
  getColumnForUser,
  getKanbanContext,
  getTaskForUser,
  kanbanDatabaseErrorMessage,
  kanbanPriorities,
  labelsOrDefault,
  nextTaskPosition,
  textOrNull,
} from '../../shared';

type TaskPatchPayload = {
  column_id?: unknown;
  title?: unknown;
  description?: unknown;
  due_date?: unknown;
  priority?: unknown;
  labels?: unknown;
  sync_calendar?: unknown;
  sync_notes?: unknown;
};

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;

  try {
    const task = await getTaskForUser(context.supabase, id, context.databaseUser.id);
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    const updates = normalizeTaskPatch(await request.json());

    const targetColumnId = typeof updates.column_id === 'string' ? updates.column_id : null;

    if (targetColumnId) {
      const column = await getColumnForUser(context.supabase, targetColumnId, context.databaseUser.id);
      if (!column || column.board_id !== task.board_id) {
        return NextResponse.json({ error: 'Column not found.' }, { status: 404 });
      }

      if (targetColumnId !== task.column_id) {
        updates.position = await nextTaskPosition(context.supabase, targetColumnId);
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields supplied.' }, { status: 400 });
    }

    const { data, error } = await context.supabase
      .from('kanban_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Task could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;

  try {
    const task = await getTaskForUser(context.supabase, id, context.databaseUser.id);
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    const { error } = await context.supabase.from('kanban_tasks').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Task could not be deleted.' }, { status: 500 });
  }
}

function normalizeTaskPatch(payload: TaskPatchPayload) {
  const updates: Record<string, string | string[] | boolean | number | null> = {};

  if (typeof payload.column_id === 'string') updates.column_id = payload.column_id;
  if (typeof payload.title === 'string' && payload.title.trim()) updates.title = payload.title.trim();
  if ('description' in payload) updates.description = textOrNull(payload.description);
  if ('due_date' in payload) updates.due_date = dateOrNull(payload.due_date);
  if (typeof payload.priority === 'string' && kanbanPriorities.has(payload.priority)) updates.priority = payload.priority;
  if ('labels' in payload) updates.labels = labelsOrDefault(payload.labels);
  if ('sync_calendar' in payload) updates.sync_calendar = booleanOrDefault(payload.sync_calendar);
  if ('sync_notes' in payload) updates.sync_notes = booleanOrDefault(payload.sync_notes);

  return updates;
}
