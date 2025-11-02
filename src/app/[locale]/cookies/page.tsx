import type { Metadata } from 'next';
import CookiesContent from './CookiesContent';

export const metadata: Metadata = {
    title: 'Cookies Policy - BuyJan',
    description: 'Learn about how BuyJan uses cookies and similar technologies on our website.',
};

export default function CookiesPage() {
    return <CookiesContent />;
}
