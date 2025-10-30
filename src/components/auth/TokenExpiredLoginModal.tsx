'use client';

import { useState } from 'react';
import { useLoginModal } from '@/store/modal';
import { useAuth } from '@/store/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

/**
 * Modal that appears when user's token expires
 * Allows user to login again without leaving the page
 */
export function TokenExpiredLoginModal() {
    const { isOpen, isLoading, error, closeLoginModal, setLoading, setError, clearError } = useLoginModal();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearError();

        try {
            await login({
                email: email.trim(),
                password,
                remember_me: false,
            });

            // Clear form
            setEmail('');
            setPassword('');

            // Close modal on successful login
            closeLoginModal();
        } catch (err: any) {
            setError(err?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !isLoading) {
                closeLoginModal();
            }
        }}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <DialogTitle>Session Expired</DialogTitle>
                    </div>
                    <DialogDescription>
                        Your login session has expired. Please login again to continue.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            required
                            className="w-full"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-black font-semibold"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <p className="text-xs text-gray-500 text-center">
                    Your session will remain active for up to 24 hours.
                </p>
            </DialogContent>
        </Dialog>
    );
}