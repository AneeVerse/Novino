import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Blog from '@/models/Blog';

interface RequestParams {
  params: {
    slug: string;
  };
}

// GET a single blog by slug
export async function GET(req: NextRequest, { params }: RequestParams) {
  try {
    await connectToDatabase();
    
    const blog = await Blog.findOne({ slug: params.slug });
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
} 