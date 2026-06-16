import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('flats');

export default function Page() {
  return <SpringsPage slug="flats" />;
}
