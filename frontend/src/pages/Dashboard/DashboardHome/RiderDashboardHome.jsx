import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { FiTruck, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import Loading from '../../../components/Loading/Loading';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

const RiderDashboardHome = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    // Fetch all parcels for the logged-in rider
    const { data: parcels = [], isLoading } = useQuery({
        queryKey: ['rider-parcels', user?.email],
        queryFn: async () => {
            // Note: The endpoint returns all parcels assigned to the current rider
            const res = await axiosSecure.get('/parcels/rider');
            return res.data;
        },
        enabled: !!user?.email
    });

    if (isLoading) {
        return <Loading />;;
    }

    const parcelsArray = Array.isArray(parcels) ? parcels : [];

    // Calculations
    const totalAssigned = parcelsArray.length;
    const completedDeliveries = parcelsArray.filter(p => p.deliveryStatus === 'parcel_delivered').length;
    const pendingDeliveries = totalAssigned - completedDeliveries;
    
    // Assume rider earns 50 Taka/Dollars per completed delivery
    const earningsPerDelivery = 50;
    const totalEarnings = completedDeliveries * earningsPerDelivery;

    // Chart 1: Delivery status distribution
    const statusCounts = parcelsArray.reduce((acc, p) => {
        const status = p.deliveryStatus === 'parcel_delivered' ? 'Completed' : 'Assigned/In Transit';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusChartData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
    }));

    // Chart 2: Earnings projection / Parcel Type distribution
    const typeCounts = parcelsArray.reduce((acc, p) => {
        const type = p.parcelType === 'document' ? 'Document' : 'Parcel / Non-Doc';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const typeChartData = Object.keys(typeCounts).map(type => ({
        name: type,
        count: typeCounts[type]
    }));

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Rider Dashboard</h1>
                <p className="text-base-content/70 mt-1">Manage and track your delivery statistics, assignments, and earnings.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Assigned */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Total Assigned</span>
                            <h2 className="text-3xl font-black mt-1">{totalAssigned}</h2>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                            <FiTruck size={28} />
                        </div>
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Total Earnings</span>
                            <h2 className="text-3xl font-black mt-1">${totalEarnings}</h2>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                            <FiDollarSign size={28} />
                        </div>
                    </div>
                </div>

                {/* Pending Deliveries */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Pending</span>
                            <h2 className="text-3xl font-black mt-1">{pendingDeliveries}</h2>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <FiClock size={28} />
                        </div>
                    </div>
                </div>

                {/* Completed Deliveries */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Completed</span>
                            <h2 className="text-3xl font-black mt-1">{completedDeliveries}</h2>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                            <FiCheckCircle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Delivery Overview Pie */}
                <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-4">
                    <h3 className="text-xl font-bold">Delivery Performance</h3>
                    <p className="text-sm text-base-content/60">Ratio of completed vs pending delivery jobs</p>
                    <div className="h-72 w-full">
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', color: 'var(--color-base-content)', borderRadius: '12px', border: '1px solid var(--color-base-300)' }} />
                                    <Legend formatter={(value) => <span className="text-xs font-semibold text-base-content/85">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-base-content/50">No delivery data available.</div>
                        )}
                    </div>
                </div>

                {/* Parcel Types Bar Chart */}
                <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-4">
                    <h3 className="text-xl font-bold">Delivery Types</h3>
                    <p className="text-sm text-base-content/60">Comparison of documents vs packages assigned to you</p>
                    <div className="h-72 w-full">
                        {typeChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" opacity={0.4} />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--color-base-content)', fontSize: 11 }} opacity={0.7} />
                                    <YAxis tick={{ fill: 'var(--color-base-content)', fontSize: 11 }} opacity={0.7} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', color: 'var(--color-base-content)', borderRadius: '12px', border: '1px solid var(--color-base-300)' }} />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                                        {typeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Document' ? '#3b82f6' : '#8b5cf6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-base-content/50">No parcel type data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboardHome;