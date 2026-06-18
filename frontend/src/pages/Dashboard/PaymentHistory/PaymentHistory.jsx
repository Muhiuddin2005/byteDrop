import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaCreditCard, FaCopy, FaCalendarAlt, FaDollarSign, FaHistory, FaCheckCircle, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments?email=${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            title: "Copied!",
            text: "Transaction ID copied to clipboard.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    // Calculate Stats
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const formattedTotalAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount);

    // Filter payments based on search term (Transaction ID or Tracking ID)
    const filteredPayments = payments.filter(payment => {
        return (payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (payment.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn text-base-content">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <FaHistory className="text-primary text-2xl" /> Payment History
                    </h2>
                    <p className="text-base-content/70 mt-1">Review all your completed transactions and delivery payments.</p>
                </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <FaCreditCard className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Total Transactions</div>
                        <div className="stat-value text-primary text-3xl font-bold mt-1">{payments.length}</div>
                        <div className="stat-desc mt-1">Successful payments</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <FaDollarSign className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Total Amount Spent</div>
                        <div className="stat-value text-success text-3xl font-bold mt-1">{formattedTotalAmount}</div>
                        <div className="stat-desc mt-1">Direct shipping costs</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <FaCheckCircle className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Status</div>
                        <div className="stat-value text-info text-3xl font-bold mt-1">100% SECURE</div>
                        <div className="stat-desc mt-1">Stripe verified gateway</div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Panel */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200 shadow-md">
                <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by Transaction ID or Tracking ID..."
                        className="input input-bordered pl-10 w-full rounded-xl text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden rounded-2xl">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-ring loading-lg text-primary"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full text-base-content">
                            <thead>
                                <tr className="text-base-content/70 bg-base-200">
                                    <th className="pl-6">#</th>
                                    <th>Payer Name</th>
                                    <th>Tracking ID</th>
                                    <th>Amount Paid</th>
                                    <th>Payment Time</th>
                                    <th className="pr-6">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment, index) => (
                                        <tr key={payment._id || index} className="hover:bg-base-200/50 transition-colors duration-150">
                                            <td className="pl-6 font-semibold opacity-70">{index + 1}</td>
                                            <td>
                                                <div>
                                                    <div className="font-bold text-base-content">{user?.displayName || "Valued Customer"}</div>
                                                    <div className="text-xs text-base-content/50">{payment.customerEmail || user?.email}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-mono text-xs font-semibold badge badge-outline border-base-300 py-2.5 px-3 rounded-lg text-primary bg-primary/5">
                                                    {payment.trackingId || "N/A"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-bold text-success">
                                                    ${parseFloat(payment.amount || 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <FaCalendarAlt className="text-base-content/40" />
                                                    <div>
                                                        <div className="font-semibold">
                                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                        <div className="text-[10px] text-base-content/50">
                                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="pr-6">
                                                <div className="flex items-center gap-2 justify-between max-w-[200px]">
                                                    <span className="font-mono text-xs font-semibold text-base-content/80 select-all truncate">
                                                        {payment.transactionId || 'N/A'}
                                                    </span>
                                                    {payment.transactionId && (
                                                        <button 
                                                            onClick={() => copyToClipboard(payment.transactionId)}
                                                            className="btn btn-xs btn-ghost btn-circle text-primary hover:bg-primary/10"
                                                            title="Copy Transaction ID"
                                                        >
                                                            <FaCopy className="text-xs" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-base-content/50 font-medium">
                                            No payment records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;