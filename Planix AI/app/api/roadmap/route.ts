import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoadmap, refineRoadmap } from '@/lib/gemini';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If we have a userId, fetch roadmaps for that user
    // For now, we'll fetch all roadmaps since auth isn't fully implemented
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        phases: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to match frontend RoadmapData structure
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
    return NextResponse.json({ error: 'Failed to fetch roadmaps' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data.action === 'generate') {
      const roadmapData = await generateRoadmap(data.goal, data.timeline, data.hours);
      return NextResponse.json(roadmapData);
    }

    if (data.action === 'refine') {
      const updatedRoadmap = await refineRoadmap(data.currentRoadmap, data.prompt);
      return NextResponse.json(updatedRoadmap);
    }
    
    const newRoadmap = await prisma.roadmap.create({
      data: {
        goal: data.goal,
        timeline: data.totalDuration,
        hoursPerDay: data.hoursPerDay || '2', // Default if not provided
        phases: {
          create: data.nodes.map((node: any) => ({
            title: node.title,
            duration: node.duration,
            completed: node.status === 'completed',
            objectives: node.objectives || [],
            impact: node.impact || ''
          }))
        }
      },
      include: {
        phases: true
      }
    });

    return NextResponse.json({ success: true, roadmap: newRoadmap });
  } catch (error: any) {
    console.error("API /api/roadmap POST error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process roadmap request' }, { status: 500 });
  }
}
