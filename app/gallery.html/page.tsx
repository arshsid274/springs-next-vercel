import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('gallery');

export default function Page() {
  return <SpringsPage slug="gallery" />;
}
