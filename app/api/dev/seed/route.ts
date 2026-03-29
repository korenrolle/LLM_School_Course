import { NextResponse } from 'next/server';
import { seedService } from '@/lib/services/seedService';

export async function POST() {
  const result = seedService.seedExampleData();
  return NextResponse.json({ data: result, error: null });
}
