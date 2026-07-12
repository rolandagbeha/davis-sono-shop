import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description?: string;
}

const SITE_NAME = 'Davis Sono Shop';

export function useDocumentMeta({ title, description }: DocumentMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} — ${SITE_NAME}`;

    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content') ?? '';

    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription) {
        metaDescription.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
