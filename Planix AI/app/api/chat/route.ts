import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { teachingExplain, generateNotes } from '@/lib/gemini';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get('roadmapId');

    if (!roadmapId) {
      return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roadmapId: roadmapId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const modeOutputs = await prisma.modeOutput.findMany({
      where: {
        roadmapId: roadmapId
      }
    });

    // Merge modeOutputs into messages based on mode and time proximity, or just return them
    // For simplicity, we'll return both and let the frontend match them up, or we can match them here.
    // A better schema would link ModeOutput to ChatMessage, but we'll match by mode and roadmapId.
    // Actually, let's just return messages and modeOutputs.
    
    // Let's attach the latest modeOutput for each mode to the message that has that mode.
    // Since we don't have a direct relation, we'll just attach the structured JSON if the mode matches.
    const formattedMessages = messages.map((msg: any) => {
      let data = null;
      if (msg.mode) {
        // Find the mode output created around the same time or just the matching mode
        // In a real app, we'd relate them directly.
        const output = modeOutputs.find((o: any) => o.mode === msg.mode && Math.abs(o.createdAt.getTime() - msg.createdAt.getTime()) < 5000);
        if (output) {
          data = output.structuredJSON;
        }
      }
      return {
        ...msg,
        data
      };
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data.action === 'teaching') {
      const text = await teachingExplain(data.text, data.context);
      return NextResponse.json({ text });
    }

    if (data.action === 'notes') {
      const text = await generateNotes(data.text, data.context);
      return NextResponse.json({ text });
    }

    const { userMessage, aiMessage, roadmapId } = data;

    if (!roadmapId) {
      return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 });
    }

    // Save user message
    if (userMessage) {
      await prisma.chatMessage.create({
        data: {
          roadmapId: roadmapId,
          role: 'user',
          content: userMessage.text || '',
        }
      });
    }

    // Save AI message
    if (aiMessage) {
      await prisma.chatMessage.create({
        data: {
          roadmapId: roadmapId,
          role: 'ai',
          content: aiMessage.text || '',
          mode: aiMessage.component || null,
        }
      });

      // If there's structured data from a mode, save it to ModeOutput
      if (aiMessage.data && aiMessage.component) {
        await prisma.modeOutput.create({
          data: {
            roadmapId: roadmapId,
            mode: aiMessage.component,
            structuredJSON: aiMessage.data
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/chat POST error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process chat request' }, { status: 500 });
  }
}
