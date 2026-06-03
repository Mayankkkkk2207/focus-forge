import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { syncCurrentUserToDatabase } from '@/lib/sync-user';

type CalendarItemPayload = {
  title?: unknown;
  description?: unknown;
  item_type?: unknown;
  category?: unknown;
  color?: unknown;
  scheduled_date?: unknown;
  scheduled_time?: unknown;
  status?: unknown;
  priority?: unknown;
  reminder_email?: unknown;
  reminder_lead_minutes?: unknown;
};

const itemTypes = new Set(['task', 'reminder']);
const statuses = new Set(['open', 'in_progress', 'done', 'snoozed']);
const priorities = new Set(['low', 'medium', 'high']);

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCalendarContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;
  const updates = normalizePatchPayload(await request.json());

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields supplied.' }, { status: 400 });
  }

  const { data, error } = await context.supabase
    .from('calendar_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', context.databaseUser.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: calendarDatabaseErrorMessage(error.message) }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCalendarContext();

  if ('error' in context) {
    return context.error;
  }

  const { id } = await params;
  const { error } = await context.supabase
    .from('calendar_items')
    .delete()
    .eq('id', id)
    .eq('user_id', context.databaseUser.id);

  if (error) {
    return NextResponse.json({ error: calendarDatabaseErrorMessage(error.message) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function getCalendarContext() {
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

function normalizePatchPayload(payload: CalendarItemPayload) {
  const updates: Record<string, string | number | null> = {};

  if (typeof payload.title === 'string') updates.title = payload.title.trim();
  if ('description' in payload) updates.description = textOrNull(payload.description);
  if (typeof payload.item_type === 'string' && itemTypes.has(payload.item_type)) updates.item_type = payload.item_type;
  if (typeof payload.category === 'string' && payload.category.trim()) updates.category = payload.category.trim();
  if (typeof payload.color === 'string' && payload.color.trim()) updates.color = payload.color.trim();
  if ('scheduled_date' in payload) updates.scheduled_date = dateOrNull(payload.scheduled_date);
  if ('scheduled_time' in payload) updates.scheduled_time = timeOrNull(payload.scheduled_time);
  if (typeof payload.status === 'string' && statuses.has(payload.status)) updates.status = payload.status;
  if (typeof payload.priority === 'string' && priorities.has(payload.priority)) updates.priority = payload.priority;
  if ('reminder_email' in payload) updates.reminder_email = textOrNull(payload.reminder_email);
  if ('reminder_lead_minutes' in payload) updates.reminder_lead_minutes = integerOrNull(payload.reminder_lead_minutes);

  return updates;
}

function textOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function dateOrNull(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function timeOrNull(value: unknown) {
  return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value) ? value : null;
}

function integerOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function calendarDatabaseErrorMessage(message: string) {
  if (message.toLowerCase().includes("calendar_items")) {
    return "The public.calendar_items table does not exist in Supabase yet. Run the calendar items migration, then reload this page.";
  }

  return message;
}
