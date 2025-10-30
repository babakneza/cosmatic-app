'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';

export default function AuthTestPage() {
    const { is_authenticated, user, access_token, refresh_token, token_expires_at, logout } = useAuth();
    const [isHydrated, setIsHydrated] = useState(false);

    // Use a more reliable hydration detection
    useEffect(() => {
        // Check if we're on the client side and have access to localStorage
        if (typeof window !== 'undefined') {
            // Small delay to ensure Zustand has had time to hydrate
            const timer = setTimeout(() => {
                setIsHydrated(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>

                {/* Authentication Status */}
                <div className="mb-6 p-4 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
                    {!isHydrated ? (
                        <p className="text-yellow-600" data-testid="auth-status-loading">🔄 Hydrating...</p>
                    ) : is_authenticated ? (
                        <div className="text-green-600" data-testid="auth-status-authenticated">
                            <p>✅ Status: AUTHENTICATED</p>
                            {user && (
                                <div className="mt-2">
                                    <p><strong>User:</strong> {user.email}</p>
                                    <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-red-600" data-testid="auth-status-not-authenticated">❌ Status: NOT AUTHENTICATED</p>
                    )}
                </div>

                {/* Token Information */}
                <div className="mb-6 p-4 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Token Information</h2>
                    {access_token ? (
                        <div className="text-sm">
                            <p><strong>Access Token:</strong> {access_token?.substring(0, 20)}...</p>
                            <p><strong>Refresh Token:</strong> {refresh_token?.substring(0, 20)}...</p>
                            {token_expires_at && <p><strong>Expires:</strong> {new Date(token_expires_at).toLocaleString()}</p>}
                        </div>
                    ) : (
                        <p className="text-gray-500">No token information available</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-6">
                    {is_authenticated ? (
                        <button
                            onClick={logout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            id="logout-btn"
                        >
                            Logout
                        </button>
                    ) : (
                        <a
                            href="/en/auth/login"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Go to Login
                        </a>
                    )}
                    <a
                        href="/en"
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        </div>
    );
}