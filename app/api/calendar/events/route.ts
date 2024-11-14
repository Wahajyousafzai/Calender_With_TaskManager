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
    const data = await request.json();
    const event = await prisma.event.create({
      data: {
        ...data,
        userId: session.user.id,
        reminders: {
          create: data.reminders?.map((minutes: number) => ({
            minutes,
          })) || [],
        },
        recurrence: data.recurrence ? {
          create: data.recurrence,
        } : undefined,
      },
      include: {
        reminders: true,
        recurrence: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
} 