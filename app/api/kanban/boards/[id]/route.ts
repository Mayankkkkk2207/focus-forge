import { NextRequest, NextResponse } from 'next/server';

import { getKanbanContext, kanbanDatabaseErrorMessage } from '../../shared';

type BoardPayload = {
  name?: unknown;
  color?: unknown;
};

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;
  const updates = normalizeBoardPatch(await request.json());

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields supplied.' }, { status: 400 });
  }

  const { data, error } = await context.supabase
    .from('kanban_boards')
    .update(updates)
    .eq('id', id)
    .eq('user_id', context.databaseUser.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
  }

  return NextResponse.json({ board: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getKanbanContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;
  const { error } = await context.supabase
    .from('kanban_boards')
    .delete()
    .eq('id', id)
    .eq('user_id', context.databaseUser.id);

  if (error) {
    return NextResponse.json({ error: kanbanDatabaseErrorMessage(error.message) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function normalizeBoardPatch(payload: BoardPayload) {
  const updates: Record<string, string> = {};

  if (typeof payload.name === 'string' && payload.name.trim()) updates.name = payload.name.trim();
  if (typeof payload.color === 'string' && payload.color.trim()) updates.color = payload.color.trim();

  return updates;
}
