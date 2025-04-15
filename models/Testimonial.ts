import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  socialIcon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the testimonial'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  avatar: {
    type: String,
    required: [true, 'Please provide an avatar URL']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  socialIcon: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if the model is already defined to prevent overwrite during hot reloads
const Testimonial: Model<ITestimonial> = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial; 