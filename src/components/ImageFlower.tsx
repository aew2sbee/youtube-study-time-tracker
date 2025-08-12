import Image from 'next/image';

const FALLBACK_IMAGE_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnMB9QkQeQAAAABJRU5ErkJggg==";

export default function FlowerImage({ key, src, alt }: { key: number; src: string; alt: string }) {
  return (
    <Image
      key={key}
      src={src}
      alt={alt}
      width={600}
      height={600}
      className="w-64 h-64 object-contain transition-all duration-300 ease-in-out"
      onError={e => { e.currentTarget.src = FALLBACK_IMAGE_DATA_URL; }}
    />
  );
}
