import { generateBlogPostingSchema } from '@/lib/seo';

interface BlogSchemaServerProps {
  blog: {
    title: string;
    description: string;
    image?: string;
    slug: string;
    author?: {
      name: string;
      image?: string;
    };
    publishedTime?: string;
    modifiedTime?: string;
    content?: string;
  };
}

export default function BlogSchemaServer({ blog }: BlogSchemaServerProps) {
  const blogSchema = generateBlogPostingSchema(blog);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(blogSchema),
      }}
    />
  );
}

