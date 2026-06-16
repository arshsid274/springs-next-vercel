import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('design');

export default function Page() {
  return <SpringsPage slug="design" />;
}
