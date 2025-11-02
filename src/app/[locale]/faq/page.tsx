import type { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
    title: 'FAQ - BuyJan',
    description: 'Find answers to frequently asked questions about BuyJan products, orders, and services.',
};

export default function FAQPage() {
    return <FAQContent />;
}
