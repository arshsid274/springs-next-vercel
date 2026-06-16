import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('agreement');

export default function Page() {
  return <SpringsPage slug="agreement" />;
}
