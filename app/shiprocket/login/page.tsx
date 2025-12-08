"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Shiprocket Auto-Login Page
 * This page helps facilitate login to Shiprocket dashboard
 */
export default function ShiprocketLoginPage() {
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'info'>('loading');

    useEffect(() => {
        const formatShiprocketDate = (date: Date) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${date.getFullYear()}-${months[date.getMonth()]}-${String(date.getDate()).padStart(2, '0')}`;
        };

        const openShiprocket = async () => {
            try {
                setStatus('loading');

                // Verify we have Shiprocket credentials configured
                const response = await fetch('/api/shiprocket/auth-token');
                const data = await response.json();

                if (data.success && data.token) {
                    setStatus('redirecting');

                    // Store login intent in sessionStorage
                    sessionStorage.setItem('shiprocket_auto_login', 'true');

                    // Wait a moment to show the message
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Redirect to Shiprocket orders page with a rolling last-30-days range
                    const toDate = new Date();
                    const fromDate = new Date();
                    fromDate.setDate(toDate.getDate() - 30);
                    const from = formatShiprocketDate(fromDate);
                    const to = formatShiprocketDate(toDate);

                    const shiprocketUrl = `https://app.shiprocket.in/seller/orders/new?sku=&order_ids=&order_status=&channel_id=&payment_method=&pickup_address_id=&delivery_country=&quantity=&is_order_verified=&ship_weight=&previously_cancelled=&from=${from}&to=${to}`;
                    window.location.href = shiprocketUrl;
                } else {
                    throw new Error('Shiprocket credentials not configured');
                }
            } catch (error) {
                console.error('Shiprocket login error:', error);
                setStatus('info');
            }
        };

        openShiprocket();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#222222] border border-white/10 rounded-2xl p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white mb-2">
                            Preparing Shiprocket Access
                        </h1>
                        <p className="text-white/60">
                            Verifying credentials...
                        </p>
                    </>
                )}

                {status === 'redirecting' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white mb-2">
                            Redirecting to Shiprocket
                        </h1>
                        <p className="text-white/60">
                            Opening Shiprocket dashboard...
                        </p>
                    </>
                )}

                {status === 'info' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-semibold text-white mb-2">
                            Shiprocket Login Required
                        </h1>
                        <p className="text-white/60 mb-6">
                            Please log in to Shiprocket using your credentials.
                        </p>
                        <a
                            href="https://app.shiprocket.in/login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg font-medium transition-colors"
                        >
                            Open Shiprocket Login
                        </a>
                    </>
                )}

                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-white/30">
                        Note: Shiprocket requires manual login through their web interface
                    </p>
                </div>
            </div>
        </div>
    );
}
