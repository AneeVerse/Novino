import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  author: {
    name: string;
    role?: string;
    image?: string;
  };
  readTime?: number; // in minutes
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the blog'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug for the blog'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the blog'],
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content for the blog']
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL for the blog']
  },
  author: {
    name: {
      type: String,
      required: [true, 'Please provide an author name']
    },
    role: {
      type: String,
      default: 'Writer'
    },
    image: {
      type: String,
      default: '/images/default-author.png'
    }
  },
  readTime: {
    type: Number,
    default: 5
  },
  publishedAt: {
    type: Date,
    default: Date.now
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

// Generate slug from title if not provided
BlogSchema.pre('save', function(this: IBlog, next) {
  if (!this.isModified('title') || this.slug) {
    return next();
  }
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  next();
});

// Check if the model is already defined to prevent overwrite during hot reloads
const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog; 