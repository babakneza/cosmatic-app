import type { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
    title: 'Contact Us - BuyJan Premium Beauty Products',
    description: 'Get in touch with BuyJan. Contact our customer support team for any questions about our beauty products and services in Oman.',
    keywords: ['contact BuyJan', 'customer support', 'beauty products', 'Oman'],
};

export default function ContactPage() {
    return <ContactContent />;
}
