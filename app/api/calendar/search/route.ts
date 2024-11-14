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
    const {
      searchText,
      dateRange,
      types,
      hasReminders,
      isRecurring,
      isShared,
      location,
    } = await request.json();

    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId: session.user.id },
              {
                shares: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            ],
          },
          {
            OR: searchText
              ? [
                  { title: { contains: searchText, mode: 'insensitive' } },
                  { description: { contains: searchText, mode: 'insensitive' } },
                ]
              : undefined,
          },
          dateRange?.start
            ? { start: { gte: new Date(dateRange.start) } }
            : undefined,
          dateRange?.end
            ? { end: { lte: new Date(dateRange.end) } }
            : undefined,
          types?.length ? { type: { in: types } } : undefined,
          hasReminders
            ? { reminders: { some: {} } }
            : undefined,
          isRecurring
            ? { recurrence: { isNot: null } }
            : undefined,
          isShared
            ? { shares: { some: {} } }
            : undefined,
          location
            ? { location: { contains: location, mode: 'insensitive' } }
            : undefined,
        ].filter(Boolean),
      },
      include: {
        reminders: true,
        recurrence: true,
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        start: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    );
  }
} 