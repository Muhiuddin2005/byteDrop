import { useQuery } from '@tanstack/react-query';
import React from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Legend, Pie, PieChart, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiActivity, FiUsers, FiPackage } from 'react-icons/fi';
import Loading from '../../../components/Loading/Loading';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboardHome = () => {
    const axiosSecure = useAxiosSecure();
    const { data: deliveryStats = [], isLoading } = useQuery({
        queryKey: ['delivery-status-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels/delivery-status/stats');
            return res.data;
        }
    });

    const getPieChartData = data => {
        return data.map(item => {
            const formattedName = (item.status || item._id || 'unknown')
                .replace('_', ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
            return { name: formattedName, value: item.count };
        });
    };

    if (isLoading) {
        return <Loading />;;
    }

    const statsArray = Array.isArray(deliveryStats) ? deliveryStats : [];
    const totalParcels = statsArray.reduce((sum, stat) => sum + (stat.count || 0), 0);

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
                <p className="text-base-content/70 mt-1">Platform-wide overview of delivery operations and status breakdown.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total System Bookings */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">System Total</span>
                            <h2 className="text-3xl font-black mt-1">{totalParcels}</h2>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                            <FiPackage size={28} />
                        </div>
                    </div>
                </div>

                {
                    statsArray.slice(0, 3).map((stat, i) => {
                        const statusLabel = (stat._id || 'Other')
                            .replace('_', ' ')
                            .replace(/\b\w/g, c => c.toUpperCase());

                        const bgColors = [
                            'bg-emerald-500/10 text-emerald-500',
                            'bg-amber-500/10 text-amber-500',
                            'bg-purple-500/10 text-purple-500'
                        ];

                        return (
                            <div key={stat._id || i} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                                <div className="card-body flex-row items-center justify-between p-6">
                                    <div>
                                        <span className="text-sm font-medium text-base-content/60 uppercase">{statusLabel}</span>
                                        <h2 className="text-3xl font-black mt-1">{stat.count}</h2>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${bgColors[i % bgColors.length]}`}>
                                        <FiActivity size={28} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Delivery breakdown pie */}
                <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-4">
                    <h3 className="text-xl font-bold">Delivery status breakdown</h3>
                    <p className="text-sm text-base-content/60">Overview of all active and completed shipments</p>
                    <div className="h-80 w-full flex items-center justify-center">
                        {statsArray.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getPieChartData(statsArray)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {getPieChartData(deliveryStats).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', color: 'var(--color-base-content)', borderRadius: '12px', border: '1px solid var(--color-base-300)' }} />
                                    <Legend formatter={(value) => <span className="text-xs font-semibold text-base-content/85">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-base-content/50">No delivery statistics recorded.</div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="card bg-base-100 shadow-xl border border-base-200 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Management Insights</h3>
                        <p className="text-sm text-base-content/70 leading-relaxed">
                            Ensure riders are promptly assigned to incoming orders. Keep track of pending statuses as high volumes of pending shipments may affect customer satisfaction ratings.
                        </p>
                    </div>

                    <div className="mt-6 p-4 bg-base-200 rounded-2xl space-y-3">
                        <div className="flex items-center space-x-3">
                            <FiTrendingUp className="text-primary text-xl" />
                            <span className="text-sm font-semibold">Total active shipments: {totalParcels}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FiUsers className="text-secondary text-xl" />
                            <span className="text-sm font-semibold">Operations health check: OK</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;