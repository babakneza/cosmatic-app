import type { Metadata } from 'next';
import ReturnsExchangesContent from './ReturnsExchangesContent';

export const metadata: Metadata = {
    title: 'Returns & Exchanges - BuyJan',
    description: 'Learn about our hassle-free returns and exchanges policy at BuyJan.',
};

export default function ReturnsExchangesPage() {
    return <ReturnsExchangesContent />;
}
