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
    
    const event = await prisma.event.update({
      where: {
        id: eventData.id,
        userId: session.user.id,
      },
      data: {
        ...eventData,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        reminders: {
          deleteMany: {},
          create: eventData.reminders?.map((minutes: number) => ({
            minutes,
          })) || [],
        },
        recurrence: eventData.recurrence ? {
          upsert: {
            create: {
              ...eventData.recurrence,
              endDate: eventData.recurrence.endDate ? new Date(eventData.recurrence.endDate) : null,
            },
            update: {
              ...eventData.recurrence,
              endDate: eventData.recurrence.endDate ? new Date(eventData.recurrence.endDate) : null,
            },
          },
        } : {
          delete: true,
        },
      },
      include: {
        reminders: true,
        recurrence: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
} 