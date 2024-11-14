import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

const getGoogleAuth = async (accessToken: string) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
};

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }

    const auth = await getGoogleAuth(account.access_token);
    const calendar = google.calendar({ version: 'v3', auth });

    // Get Google Calendar events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const googleEvents = response.data.items || [];
    
    // Sync stats
    let added = 0;
    let updated = 0;
    let deleted = 0;

    // Process each Google Calendar event
    for (const googleEvent of googleEvents) {
      if (!googleEvent.start?.dateTime || !googleEvent.end?.dateTime) continue;

      const existingEvent = await prisma.event.findFirst({
        where: {
          userId: session.user.id,
          googleEventId: googleEvent.id,
        },
      });

      if (existingEvent) {
        // Update existing event
        await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            title: googleEvent.summary || 'Untitled Event',
            description: googleEvent.description,
            location: googleEvent.location,
            start: new Date(googleEvent.start.dateTime),
            end: new Date(googleEvent.end.dateTime),
            lastSyncedAt: new Date(),
          },
        });
        updated++;
      } else {
        // Create new event
        await prisma.event.create({
          data: {
            title: googleEvent.summary || 'Untitled Event',
            description: googleEvent.description,
            location: googleEvent.location,
            start: new Date(googleEvent.start.dateTime),
            end: new Date(googleEvent.end.dateTime),
            type: 'meeting',
            color: '#2563eb',
            googleEventId: googleEvent.id,
            userId: session.user.id,
            calendarId: (await prisma.calendar.findFirst({
              where: { userId: session.user.id, isDefault: true },
            }))?.id!,
            lastSyncedAt: new Date(),
          },
        });
        added++;
      }
    }

    return NextResponse.json({ added, updated, deleted });
  } catch (error) {
    console.error('Google Calendar sync failed:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
} 