'use client';

import { useEffect } from 'react';

interface SchemaInjectorProps {
  schemas: Array<{ id: string; json: object }>;
}

/**
 * Client-side schema injector that adds JSON-LD to the document head
 * This ensures schemas are available even in client components
 */
export default function SchemaInjector({ schemas }: SchemaInjectorProps) {
  useEffect(() => {
    // Remove existing schemas with same IDs to avoid duplicates
    schemas.forEach(({ id }) => {
      const existing = document.getElementById(`schema-${id}`);
      if (existing) {
        existing.remove();
      }
    });

    // Inject new schemas into head
    schemas.forEach(({ id, json }) => {
      const script = document.createElement('script');
      script.id = `schema-${id}`;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(json);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      schemas.forEach(({ id }) => {
        const existing = document.getElementById(`schema-${id}`);
        if (existing) {
          existing.remove();
        }
      });
    };
  }, [schemas]);

  return null;
}

