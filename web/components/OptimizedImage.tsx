import Image, { ImageProps } from 'next/image';

export default function OptimizedImage({
  priority = false,
  alt,
  ...props
}: ImageProps) {
  return (
    <Image
      alt={alt || ''}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
}
