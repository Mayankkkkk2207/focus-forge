import { NextRequest, NextResponse } from 'next/server';

import { boardBelongsToUser, getKanbanContext, kanbanDatabaseErrorMessage, nextColumnPosition } from '../shared';

type ColumnPayload = {
  board_id?: unknown;
  name?: unknown;
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const payload = normalizeColumnPayload(await request.json());

  if (!payload.board_id) {
    return NextResponse.json({ error: 'Board is required.' }, { status: 400 });
  }

  if (!payload.name) {
    return NextResponse.json({ error: 'Column name is required.' }, { status: 400 });
  }

  try {
    const allowed = await boardBelongsToUser(context.supabase, payload.board_id, context.databaseUser.id);
    if (!allowed) return NextResponse.json({ error: 'Board not found.' }, { status: 404 });

    const { count, error: countError } = await context.supabase
      .from('kanban_columns')
      .select('id', { count: 'exact', head: true })
      .eq('board_id', payload.board_id);

    if (countError) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(countError.message) }, { status: 500 });
    }

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: 'Boards can have a maximum of 5 columns.' }, { status: 400 });
    }

    const position = await nextColumnPosition(context.supabase, payload.board_id);
    const { data, error } = await context.supabase
      .from('kanban_columns')
      .insert({ ...payload, position })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
    }

    return NextResponse.json({ column: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Column could not be created.' }, { status: 500 });
  }
}

function normalizeColumnPayload(payload: ColumnPayload) {
  return {
    board_id: typeof payload.board_id === 'string' ? payload.board_id : '',
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
  };
}
