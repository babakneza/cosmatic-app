'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';

export default function DebugPage() {
    // Use selector hooks to ensure proper reactivity
    const isAuthenticated = useAuth((state) => state.is_authenticated);
    const hasAccessToken = useAuth((state) => !!state.access_token);
    const user = useAuth((state) => state.user);
    const _hasHydrated = useAuth((state) => state._hasHydrated);

    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [updateCount, setUpdateCount] = useState(0);

    useEffect(() => {
        // Log everything about the store
        console.log('[DEBUG] Store updated! Update #' + (updateCount + 1), {
            isAuthenticated,
            hasAccessToken,
            hasUser: !!user,
            _hasHydrated,
            userEmail: user?.email,
        });

        // Also log localStorage
        const stored = localStorage.getItem('auth-store');
        console.log('[DEBUG] localStorage auth-store:', {
            exists: !!stored,
            length: stored?.length || 0,
            data: stored ? JSON.parse(stored) : null,
        });

        setDebugInfo({
            store: {
                isAuthenticated,
                hasAccessToken,
                hasUser: !!user,
                _hasHydrated,
                user,
            },
            localStorage: stored ? JSON.parse(stored) : null,
            timestamp: new Date().toISOString(),
        });

        setPageLoaded(true);
        setUpdateCount(c => c + 1);
    }, [isAuthenticated, hasAccessToken, user, _hasHydrated]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">🔍 Debug Page</h1>

                {!pageLoaded ? (
                    <p className="text-yellow-400">Loading...</p>
                ) : (
                    <div className="space-y-6">
                        {/* Store State */}
                        <div className="bg-slate-800 p-4 rounded border border-slate-700">
                            <h2 className="text-xl font-bold mb-2">📦 Zustand Store State</h2>
                            <pre className="bg-slate-900 p-3 rounded overflow-auto text-sm">
                                {JSON.stringify(debugInfo?.store, null, 2)}
                            </pre>
                        </div>

                        {/* localStorage */}
                        <div className="bg-slate-800 p-4 rounded border border-slate-700">
                            <h2 className="text-xl font-bold mb-2">💾 localStorage auth-store</h2>
                            <pre className="bg-slate-900 p-3 rounded overflow-auto text-sm">
                                {JSON.stringify(debugInfo?.localStorage, null, 2)}
                            </pre>
                        </div>

                        {/* Status Indicator */}
                        <div className="bg-slate-800 p-4 rounded border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">⚡ Status</h2>
                            <div className="space-y-2">
                                <div className={debugInfo?.store?._hasHydrated ? 'text-green-400' : 'text-red-400'}>
                                    Hydrated: {debugInfo?.store?._hasHydrated ? '✅ YES' : '❌ NO'}
                                </div>
                                <div className={debugInfo?.store?.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                                    Authenticated: {debugInfo?.store?.isAuthenticated ? '✅ YES' : '❌ NO'}
                                </div>
                                <div className={debugInfo?.store?.hasAccessToken ? 'text-green-400' : 'text-red-400'}>
                                    Has Access Token: {debugInfo?.store?.hasAccessToken ? '✅ YES' : '❌ NO'}
                                </div>
                                {debugInfo?.store?.user?.email && (
                                    <div className="text-blue-400">
                                        User: {debugInfo?.store?.user?.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-2">
                            <a href="/en/auth-test" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                                Go to Auth Test Page
                            </a>
                            <a href="/en/auth/login" className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">
                                Go to Login
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}