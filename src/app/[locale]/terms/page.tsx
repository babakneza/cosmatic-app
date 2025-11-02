import type { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
    title: 'Terms & Conditions - BuyJan',
    description: 'Read our terms and conditions to understand the terms of service and user agreement for BuyJan.',
};

export default function TermsPage() {
    return <TermsContent />;
}
