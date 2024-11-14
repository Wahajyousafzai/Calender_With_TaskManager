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
    const { eventId, email, permission } = await request.json();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { user: true },
    });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const share = await prisma.eventShare.create({
      data: {
        eventId,
        userId: targetUser.id,
        permission,
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to share event' }, { status: 500 });
  }
} 