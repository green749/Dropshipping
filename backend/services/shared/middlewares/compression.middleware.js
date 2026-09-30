import compression from 'compression';

/**
 * Production-tuned compression middleware
 * Compresses JSON, HTML, and text payloads > 1KB using Gzip/Deflate
 */
export const compressionMiddleware = compression({
  level: 6, // Optimal CPU vs compression ratio
  threshold: 1024, // Only compress responses larger than 1 KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Fall back to standard compression filter (checks mime types)
    return compression.filter(req, res);
  },
});
