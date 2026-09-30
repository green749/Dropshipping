import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses DOMPurify under the hood.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml);
}

/**
 * Escapes characters for basic text content rendering if raw text is needed.
 */
export function escapeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
