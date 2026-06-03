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

export async function GET(request: NextRequest) {
  const context = await getCalendarContext();

  if ('error' in context) {
    return context.error;
  }

  const start = request.nextUrl.searchParams.get('start');
  const end = request.nextUrl.searchParams.get('end');

  let query = context.supabase
    .from('calendar_items')
    .select('*')
    .eq('user_id', context.databaseUser.id)
    .order('scheduled_date', { ascending: true, nullsFirst: true })
    .order('scheduled_time', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true });

  if (start && end) {
    query = query.or(`scheduled_date.is.null,and(scheduled_date.gte.${start},scheduled_date.lte.${end})`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: calendarDatabaseErrorMessage(error.message) }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const context = await getCalendarContext();

  if ('error' in context) {
    return context.error;
  }

  const payload = normalizePayload(await request.json());

  if (!payload.title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  const { data, error } = await context.supabase
    .from('calendar_items')
    .insert({ ...payload, user_id: context.databaseUser.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: calendarDatabaseErrorMessage(error.message) }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
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

function normalizePayload(payload: CalendarItemPayload) {
  return {
    title: typeof payload.title === 'string' ? payload.title.trim() : '',
    description: textOrNull(payload.description),
    item_type: choiceOrDefault(payload.item_type, itemTypes, 'task'),
    category: typeof payload.category === 'string' && payload.category.trim() ? payload.category.trim() : 'Focus',
    color: typeof payload.color === 'string' && payload.color.trim() ? payload.color.trim() : 'cyan',
    scheduled_date: dateOrNull(payload.scheduled_date),
    scheduled_time: timeOrNull(payload.scheduled_time),
    status: choiceOrDefault(payload.status, statuses, 'open'),
    priority: choiceOrDefault(payload.priority, priorities, 'medium'),
    reminder_email: textOrNull(payload.reminder_email),
    reminder_lead_minutes: integerOrNull(payload.reminder_lead_minutes),
  };
}

function choiceOrDefault(value: unknown, allowed: Set<string>, fallback: string) {
  return typeof value === 'string' && allowed.has(value) ? value : fallback;
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
