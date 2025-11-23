import { NextRequest, NextResponse } from 'next/server';
import { generateWOD } from '@/lib/azure-openai';
import { WODOutput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, available_equipment, preferences, limitations, notes } = body;

    if (!goal || !available_equipment) {
      return NextResponse.json(
        { error: 'Missing required fields: goal and available_equipment are required' },
        { status: 400 }
      );
    }

    const jsonResponse = await generateWOD({
      goal: goal || '',
      available_equipment: available_equipment || '',
      preferences: preferences || '',
      limitations: limitations || '',
      notes: notes || '',
    });

    // Parse and validate the JSON response
    let wodData: WODOutput;
    try {
      wodData = JSON.parse(jsonResponse);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', jsonResponse);
      return NextResponse.json(
        { error: 'Invalid JSON response from AI. Please try again.' },
        { status: 500 }
      );
    }

    // Basic validation
    if (!wodData.wod_title || !wodData.format || !wodData.sections) {
      return NextResponse.json(
        { error: 'Invalid WOD structure returned from AI. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(wodData);
  } catch (error) {
    console.error('Error generating WOD:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate WOD' },
      { status: 500 }
    );
  }
}

