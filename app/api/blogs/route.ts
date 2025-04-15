import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Blog from '@/models/Blog';

// GET all blogs
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10); // Limit to 10 blogs for now
    
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST - Create a new blog
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    
    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Check if slug already exists
    if (body.slug) {
      const existingBlog = await Blog.findOne({ slug: body.slug });
      if (existingBlog) {
        // Append a timestamp to make the slug unique
        body.slug = `${body.slug}-${Date.now().toString().slice(-6)}`;
      }
    }
    
    const newBlog = new Blog(body);
    await newBlog.save();
    
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    
    if (error.name === 'ValidationError') {
      // Return validation errors
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }
    
    // Check for duplicate slug error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return NextResponse.json({ 
        error: 'A blog with this slug already exists. Please use a different title or provide a custom slug.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
} 