import type { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
    title: 'Privacy Policy - BuyJan',
    description: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
    return <PrivacyContent />;
}
