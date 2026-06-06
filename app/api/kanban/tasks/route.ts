import { NextRequest, NextResponse } from 'next/server';

import {
  booleanOrDefault,
  boardBelongsToUser,
  dateOrNull,
  getColumnForUser,
  getKanbanContext,
  kanbanDatabaseErrorMessage,
  kanbanPriorities,
  labelsOrDefault,
  nextTaskPosition,
  textOrNull,
} from '../shared';

type TaskPayload = {
  board_id?: unknown;
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

export async function POST(request: NextRequest) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const payload = normalizeTaskPayload(await request.json());

  if (!payload.board_id || !payload.column_id) {
    return NextResponse.json({ error: 'Board and column are required.' }, { status: 400 });
  }

  if (!payload.title) {
    return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
  }

  try {
    const [allowedBoard, column] = await Promise.all([
      boardBelongsToUser(context.supabase, payload.board_id, context.databaseUser.id),
      getColumnForUser(context.supabase, payload.column_id, context.databaseUser.id),
    ]);

    if (!allowedBoard || !column || column.board_id !== payload.board_id) {
      return NextResponse.json({ error: 'Board or column not found.' }, { status: 404 });
    }

    const position = await nextTaskPosition(context.supabase, payload.column_id);
    const { data, error } = await context.supabase
      .from('kanban_tasks')
      .insert({ ...payload, position })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Task could not be created.' }, { status: 500 });
  }
}

function normalizeTaskPayload(payload: TaskPayload) {
  const priority = typeof payload.priority === 'string' && kanbanPriorities.has(payload.priority) ? payload.priority : 'medium';

  return {
    board_id: typeof payload.board_id === 'string' ? payload.board_id : '',
    column_id: typeof payload.column_id === 'string' ? payload.column_id : '',
    title: typeof payload.title === 'string' ? payload.title.trim() : '',
    description: textOrNull(payload.description),
    due_date: dateOrNull(payload.due_date),
    priority,
    labels: labelsOrDefault(payload.labels),
    sync_calendar: booleanOrDefault(payload.sync_calendar),
    sync_notes: booleanOrDefault(payload.sync_notes),
  };
}
