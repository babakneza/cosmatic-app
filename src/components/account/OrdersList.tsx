'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getCustomerOrders } from '@/lib/api/orders';
import { Order, OrderStatus } from '@/types/collections';
import { Package, ChevronRight, Search, Filter, Truck, RotateCcw, Download, TrendingUp } from 'lucide-react';
import { formatOMR } from '@/lib/currency';

interface OrdersListProps {
    customerId: string;
    accessToken: string;
    locale: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type StatusFilter = OrderStatus | 'all';

export default function OrdersList({ customerId, accessToken, locale }: OrdersListProps) {
    const t = useTranslations();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!customerId || !accessToken) {
                    setError('Unable to load orders - user information missing');
                    setLoading(false);
                    return;
                }

                setLoading(true);
                setError(null);
                const result = await getCustomerOrders(customerId, accessToken, { limit: 50 });
                setOrders(result.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [customerId, accessToken]);

    // Filter and sort orders
    const filteredAndSortedOrders = useMemo(() => {
        let filtered = orders;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.order_number.toLowerCase().includes(term) ||
                order.customer_email?.toLowerCase().includes(term) ||
                order.items?.some(item => item.product_name?.toLowerCase().includes(term))
            );
        }

        // Apply sorting
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                case 'highest':
                    return b.total - a.total;
                case 'lowest':
                    return a.total - b.total;
                case 'newest':
                default:
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            }
        });

        return sorted;
    }, [orders, statusFilter, searchTerm, sortBy]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (orders.length === 0) return null;

        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const averageOrderValue = totalSpent / orders.length;
        const lastOrder = orders.length > 0 ? new Date(orders[0].created_at || '').toLocaleDateString() : null;

        return {
            totalOrders: orders.length,
            totalSpent,
            averageOrderValue,
            lastOrder,
        };
    }, [orders]);

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'delivered':
                return '✓';
            case 'shipped':
                return '📦';
            case 'processing':
                return '⚙️';
            case 'cancelled':
                return '✕';
            case 'refunded':
                return '↩️';
            default:
                return '⏳';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string }> = {
            pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '⏳' },
            confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '✓' },
            processing: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '⚙️' },
            shipped: { bg: 'bg-cyan-50', text: 'text-cyan-700', icon: '📦' },
            delivered: { bg: 'bg-green-50', text: 'text-green-700', icon: '✓' },
            cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: '✕' },
            refunded: { bg: 'bg-gray-50', text: 'text-gray-700', icon: '↩️' },
        };
        return colors[status] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: '•' };
    };

    const getPaymentStatusColor = (status: string) => {
        return status === 'completed'
            ? 'bg-green-100 text-green-800'
            : status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-lg">
                <p className="font-medium">{t('common.error')}</p>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">Start your luxury beauty journey with BuyJan</p>
                <Link
                    href={`/${locale}/shop`}
                    className="inline-block px-8 py-3 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl"
                >
                    Shop Now
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Statistics Dashboard */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                    <div className="bg-gradient-to-br from-gold/10 to-amber-100/10 border border-gold/20 rounded-lg p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Total Orders</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                            </div>
                            <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-gold opacity-50 flex-shrink-0" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-lg p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Total Spent</p>
                                <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">{formatOMR(stats.totalSpent, locale as 'ar' | 'en')}</p>
                            </div>
                            <span className="text-2xl md:text-3xl flex-shrink-0">💳</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-lg p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Avg. Order</p>
                                <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">{formatOMR(stats.averageOrderValue, locale as 'ar' | 'en')}</p>
                            </div>
                            <span className="text-2xl md:text-3xl flex-shrink-0">📊</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 rounded-lg p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Last Order</p>
                                <p className="text-lg md:text-xl font-bold text-gray-900 mt-1 truncate">{stats.lastOrder}</p>
                            </div>
                            <span className="text-2xl md:text-3xl flex-shrink-0">📅</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 space-y-3">
                {/* Search Bar */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-2.5 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1 md:gap-2 font-medium text-gray-700 text-sm flex-shrink-0"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 md:pt-3 border-t">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Price</option>
                                <option value="lowest">Lowest Price</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Active Filters Info */}
                {(statusFilter !== 'all' || searchTerm) && (
                    <div className="flex items-center justify-between gap-2 pt-2 md:pt-3 border-t flex-wrap">
                        <p className="text-xs md:text-sm text-gray-600 min-w-0">
                            {filteredAndSortedOrders.length} order(s) found
                            {searchTerm && ` for "${searchTerm}"`}
                            {statusFilter !== 'all' && ` / ${statusFilter}`}
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            className="text-xs md:text-sm text-gold hover:text-amber-600 font-medium whitespace-nowrap flex-shrink-0"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Orders List */}
            {filteredAndSortedOrders.length === 0 ? (
                <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <Package className="w-10 md:w-12 h-10 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm md:text-base text-gray-600">No orders match your search criteria</p>
                </div>
            ) : (
                <div className="space-y-2 md:space-y-3">
                    {filteredAndSortedOrders.map((order) => {
                        const statusColor = getStatusColor(order.status);
                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                            >
                                <Link href={`/${locale}/account/orders/${order.id}`}>
                                    <div className="p-3 md:p-5 cursor-pointer">
                                        <div className="flex items-start justify-between gap-2 md:gap-4 mb-3 md:mb-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 md:gap-3 mb-1.5 md:mb-2">
                                                    <span className="text-lg md:text-xl flex-shrink-0">{getStatusIcon(order.status)}</span>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-gray-900 text-sm md:text-lg group-hover:text-gold transition break-words">
                                                            Order #{order.order_number}
                                                        </h3>
                                                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                                            {new Date(order.created_at || '').toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xl md:text-3xl font-bold text-gold">{formatOMR(order.total, locale as 'ar' | 'en')}</p>
                                                <ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-gray-300 group-hover:text-gold transition float-right mt-0.5" />
                                            </div>
                                        </div>

                                        {/* Order Info Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">
                                            <div className={`${statusColor.bg} ${statusColor.text} px-2 md:px-3 py-1.5 md:py-2 rounded-lg`}>
                                                <p className="text-xs font-semibold uppercase tracking-wide">Status</p>
                                                <p className="text-xs md:text-sm font-bold mt-0.5 md:mt-1 capitalize">{order.status}</p>
                                            </div>

                                            <div className="bg-blue-50 text-blue-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                                                <p className="text-xs font-semibold uppercase tracking-wide">Payment</p>
                                                <p className={`text-xs md:text-sm font-bold mt-0.5 md:mt-1 capitalize ${order.payment_status === 'completed' ? 'text-green-700' : 'text-yellow-700'}`}>
                                                    {order.payment_status}
                                                </p>
                                            </div>

                                            <div className="bg-amber-50 text-amber-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                                                <p className="text-xs font-semibold uppercase tracking-wide">Items</p>
                                                <p className="text-xs md:text-sm font-bold mt-0.5 md:mt-1">{order.items?.length || 0}</p>
                                            </div>

                                            {order.tracking_number && (
                                                <div className="bg-teal-50 text-teal-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wide">Tracking</p>
                                                    <p className="text-xs md:text-sm font-mono font-bold mt-0.5 md:mt-1 truncate">{order.tracking_number}</p>
                                                </div>
                                            )}

                                            {order.payment_method && (
                                                <div className="bg-purple-50 text-purple-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                                                    <p className="text-xs font-semibold uppercase tracking-wide">Method</p>
                                                    <p className="text-xs md:text-sm font-bold mt-0.5 md:mt-1 capitalize truncate">{order.payment_method}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Preview of Items */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs font-semibold text-gray-600 mb-1.5">Items Preview</p>
                                                <div className="space-y-0.5">
                                                    {order.items.slice(0, 2).map((item) => (
                                                        <p key={item.id} className="text-xs md:text-sm text-gray-700 truncate">
                                                            • {item.product_name} <span className="text-gray-500">×{item.quantity}</span>
                                                        </p>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <p className="text-xs md:text-sm text-gray-600 font-medium">
                                                            +{order.items.length - 2} more item(s)
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Quick Action Buttons */}
                                <div className="border-t border-gray-100 px-3 md:px-5 py-2 md:py-3 bg-gray-50 flex flex-wrap gap-1.5 md:gap-3 justify-end">
                                    <Link
                                        href={`/${locale}/account/orders/${order.id}`}
                                        className="px-3 md:px-4 py-1 md:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-xs md:text-sm"
                                    >
                                        Details
                                    </Link>
                                    {(order.status === 'delivered' || order.status === 'shipped') && (
                                        <button className="px-3 md:px-4 py-1 md:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-xs md:text-sm flex items-center gap-1.5">
                                            <Truck className="w-3 md:w-4 h-3 md:h-4" />
                                            <span className="hidden sm:inline">Track</span>
                                        </button>
                                    )}
                                    {order.status === 'delivered' && (
                                        <button className="px-3 md:px-4 py-1 md:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-xs md:text-sm flex items-center gap-1.5">
                                            <RotateCcw className="w-3 md:w-4 h-3 md:h-4" />
                                            <span className="hidden sm:inline">Reorder</span>
                                        </button>
                                    )}
                                    <button className="px-3 md:px-4 py-1 md:py-2 bg-gold hover:bg-amber-600 text-white rounded-lg font-medium transition text-xs md:text-sm flex items-center gap-1.5">
                                        <Download className="w-3 md:w-4 h-3 md:h-4" />
                                        <span className="hidden sm:inline">Invoice</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}