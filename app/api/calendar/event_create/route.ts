import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const eventData = await request.json();
    
    const event = await prisma.event.create({
      data: {
        ...eventData,
        userId: session.user.id,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        reminders: eventData.reminders ? {
          create: eventData.reminders.map((minutes: number) => ({
            minutes,
          }))
        } : undefined,
        recurrence: eventData.recurrence ? {
          create: {
            ...eventData.recurrence,
            endDate: eventData.recurrence.endDate ? new Date(eventData.recurrence.endDate) : null,
          }
        } : undefined,
      },
      include: {
        reminders: true,
        recurrence: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
} 