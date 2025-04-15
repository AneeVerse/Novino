import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Testimonial from '@/models/Testimonial';

interface RequestParams {
  params: {
    id: string;
  };
}

// GET a single testimonial
export async function GET(req: NextRequest, { params }: RequestParams) {
  try {
    await connectToDatabase();
    
    const testimonial = await Testimonial.findById(params.id);
    
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    
    return NextResponse.json(testimonial, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 });
  }
}

// UPDATE a testimonial
export async function PUT(req: NextRequest, { params }: RequestParams) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    
    // Find and update the testimonial
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedTestimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTestimonial, { status: 200 });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE a testimonial
export async function DELETE(req: NextRequest, { params }: RequestParams) {
  try {
    await connectToDatabase();
    
    const deletedTestimonial = await Testimonial.findByIdAndDelete(params.id);
    
    if (!deletedTestimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Testimonial deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
} 