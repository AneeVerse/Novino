import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Testimonial from '@/models/Testimonial';

// GET all testimonials
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const testimonials = await Testimonial.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10); // Limit to 10 testimonials for now
    
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST a new testimonial
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    
    // Validate required fields
    const { name, location, avatar, rating, comment } = body;
    
    if (!name || !location || !avatar || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Create a new testimonial
    const newTestimonial = await Testimonial.create({
      name,
      location,
      avatar,
      rating,
      comment,
      socialIcon: body.socialIcon || '/images/Capa 2.png' // Default social icon
    });
    
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
} 