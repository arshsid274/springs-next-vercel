import SpringsPage, { pageMetadata } from '@/lib/springs-page';

export const generateMetadata = () => pageMetadata('index');

export default function Home() {
  return <SpringsPage slug="index" />;
}
