import { NextRequest, NextResponse } from 'next/server';

import { getColumnForUser, getKanbanContext, kanbanDatabaseErrorMessage } from '../../shared';

type ColumnPayload = {
  name?: unknown;
};

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;
  const payload = normalizeColumnPatch(await request.json());

  if (!payload.name) {
    return NextResponse.json({ error: 'Column name is required.' }, { status: 400 });
  }

  try {
    const column = await getColumnForUser(context.supabase, id, context.databaseUser.id);
    if (!column) return NextResponse.json({ error: 'Column not found.' }, { status: 404 });

    const { data, error } = await context.supabase
      .from('kanban_columns')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
    }

    return NextResponse.json({ column: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Column could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;

  try {
    const column = await getColumnForUser(context.supabase, id, context.databaseUser.id);
    if (!column) return NextResponse.json({ error: 'Column not found.' }, { status: 404 });

    const { count: columnCount, error: columnCountError } = await context.supabase
      .from('kanban_columns')
      .select('id', { count: 'exact', head: true })
      .eq('board_id', column.board_id);

    if (columnCountError) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(columnCountError.message) }, { status: 500 });
    }

    if ((columnCount ?? 0) <= 1) {
      return NextResponse.json({ error: 'A board must keep at least one column.' }, { status: 400 });
    }

    const { count: taskCount, error: taskCountError } = await context.supabase
      .from('kanban_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('column_id', id);

    if (taskCountError) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(taskCountError.message) }, { status: 500 });
    }

    if ((taskCount ?? 0) > 0) {
      return NextResponse.json({ error: 'Move or delete tasks before deleting this column.' }, { status: 400 });
    }

    const { error } = await context.supabase.from('kanban_columns').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Column could not be deleted.' }, { status: 500 });
  }
}

function normalizeColumnPatch(payload: ColumnPayload) {
  return {
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
  };
}
