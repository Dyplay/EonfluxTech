import { NextResponse } from 'next/server';

// This should be set in your environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('Discord webhook URL is not configured');
    }

    // Format the message for Discord
    const message = {
      embeds: [
        {
          title: '🎯 New Job Application',
          color: 0x00ff00, // Green color
          fields: [
            {
              name: 'Job Position',
              value: data.jobTitle || 'Not specified',
              inline: true,
            },
            {
              name: 'Applicant Name',
              value: data.name,
              inline: true,
            },
            {
              name: 'Email',
              value: data.email,
              inline: true,
            },
            {
              name: 'Age',
              value: data.age,
              inline: true,
            },
            {
              name: 'Portfolio',
              value: data.portfolio || 'Not provided',
              inline: true,
            },
            {
              name: 'Experience',
              value: data.experience,
            },
            {
              name: 'Cover Letter',
              value: data.coverLetter.length > 1024 
                ? data.coverLetter.substring(0, 1021) + '...' 
                : data.coverLetter,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: `Job ID: ${data.jobId}`,
          },
        },
      ],
    };

    // Send to Discord webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to send application to Discord');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
} 