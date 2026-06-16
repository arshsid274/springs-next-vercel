import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('privacy-policy');

export default function Page() {
  return <SpringsPage slug="privacy-policy" />;
}
