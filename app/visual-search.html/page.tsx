import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('visual-search');

export default function Page() {
  return <SpringsPage slug="visual-search" />;
}
