import { NextResponse } from 'next/server';
import { teachingExplain, generateNotes, refineRoadmap } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { text, context, mode, currentRoadmap } = await request.json();
    
    if (!text || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result: any = null;

    if (mode === 'teaching') {
      result = await teachingExplain(text, context);
    } else if (mode === 'notes') {
      result = await generateNotes(text, context);
    } else if (mode === 'roadmap') {
      if (currentRoadmap) {
        result = await refineRoadmap(currentRoadmap, text);
      } else {
        return NextResponse.json({ error: 'Current roadmap required for refinement' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Chat generation error:", error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
