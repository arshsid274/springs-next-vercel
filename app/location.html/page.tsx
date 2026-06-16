import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('location');

export default function Page() {
  return <SpringsPage slug="location" />;
}
