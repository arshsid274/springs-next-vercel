import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('infrastructure');

export default function Page() {
  return <SpringsPage slug="infrastructure" />;
}
