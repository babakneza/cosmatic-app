import type { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
    title: 'About BuyJan - Premium Beauty Products in Oman',
    description: 'Learn about BuyJan, your trusted destination for authentic premium beauty and cosmetics products in Oman. Discover our story, mission, and values.',
    keywords: ['about BuyJan', 'luxury beauty', 'premium cosmetics', 'Oman beauty store'],
};

export default function AboutPage() {
    return <AboutContent />;
}
