import type { Metadata } from 'next';
import WarrantyContent from './WarrantyContent';

export const metadata: Metadata = {
    title: 'Warranty Information - BuyJan',
    description: 'Learn about product warranties and guarantees at BuyJan.',
};

export default function WarrantyPage() {
    return <WarrantyContent />;
}
