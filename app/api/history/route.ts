import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const roadmaps = await prisma.roadmap.findMany({
      include: {
        phases: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedRoadmaps = roadmaps.map((r: any) => ({
      id: r.id,
      goal: r.goal,
      date: r.createdAt.toISOString(),
      status: 'Active',
      totalPhases: r.phases.length,
      totalDuration: r.timeline,
      nodes: r.phases.map((p: any, i: number) => ({
        id: i + 1,
        title: p.title,
        duration: p.duration,
        status: p.completed ? 'completed' : (i === 0 ? 'in-progress' : 'locked'),
        progress: p.completed ? 100 : (i === 0 ? 10 : 0),
        objectives: p.objectives,
        impact: p.impact
      }))
    }));

    return NextResponse.json(formattedRoadmaps);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
