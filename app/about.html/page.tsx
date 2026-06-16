import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('about');

export default function Page() {
  return <SpringsPage slug="about" />;
}
