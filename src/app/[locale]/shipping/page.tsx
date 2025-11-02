import type { Metadata } from 'next';
import ShippingContent from './ShippingContent';

export const metadata: Metadata = {
    title: 'Shipping Information - BuyJan',
    description: 'Learn about shipping options, delivery times, and shipping rates at BuyJan.',
};

export default function ShippingPage() {
    return <ShippingContent />;
}
