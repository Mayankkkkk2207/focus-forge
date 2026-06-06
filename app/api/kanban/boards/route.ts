import { NextRequest, NextResponse } from 'next/server';

import { defaultColumns, getKanbanContext, kanbanDatabaseErrorMessage } from '../shared';

type BoardPayload = {
  name?: unknown;
  color?: unknown;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { data: boards, error: boardsError } = await context.supabase
    .from('kanban_boards')
    .select('*')
    .eq('user_id', context.databaseUser.id)
    .order('created_at', { ascending: true });

  if (boardsError) {
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(boardsError.message) }, { status: 500 });
  }

  const boardIds = (boards ?? []).map((board) => board.id);

  if (boardIds.length === 0) {
    return NextResponse.json({ boards: [], columns: [], tasks: [] });
  }

  const [{ data: columns, error: columnsError }, { data: tasks, error: tasksError }] = await Promise.all([
    context.supabase
      .from('kanban_columns')
      .select('*')
      .in('board_id', boardIds)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
    context.supabase
      .from('kanban_tasks')
      .select('*')
      .in('board_id', boardIds)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (columnsError) {
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(columnsError.message) }, { status: 500 });
  }

  if (tasksError) {
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(tasksError.message) }, { status: 500 });
  }

  return NextResponse.json({ boards: boards ?? [], columns: columns ?? [], tasks: tasks ?? [] });
}

export async function POST(request: NextRequest) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const payload = normalizeBoardPayload(await request.json());

  if (!payload.name) {
    return NextResponse.json({ error: 'Board name is required.' }, { status: 400 });
  }

  const { data: board, error: boardError } = await context.supabase
    .from('kanban_boards')
    .insert({ ...payload, user_id: context.databaseUser.id })
    .select()
    .single();

  if (boardError) {
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(boardError.message) }, { status: 500 });
  }

  const columnRows = defaultColumns.map((name, position) => ({ board_id: board.id, name, position }));
  const { data: columns, error: columnsError } = await context.supabase
    .from('kanban_columns')
    .insert(columnRows)
    .select();

  if (columnsError) {
    await context.supabase.from('kanban_boards').delete().eq('id', board.id).eq('user_id', context.databaseUser.id);
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(columnsError.message) }, { status: 500 });
  }

  return NextResponse.json({ board, columns: columns ?? [], tasks: [] }, { status: 201 });
}

function normalizeBoardPayload(payload: BoardPayload) {
  return {
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
    color: typeof payload.color === 'string' && payload.color.trim() ? payload.color.trim() : 'emerald',
  };
}
