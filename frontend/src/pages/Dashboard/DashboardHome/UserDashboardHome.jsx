import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FiPackage, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import Loading from '../../../components/Loading/Loading';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const UserDashboardHome = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    const { data: parcels = [], isLoading } = useQuery({
        queryKey: ['user-parcels', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels');
            return res.data;
        },
        enabled: !!user?.email
    });

    if (isLoading) {
        return <Loading />;;
    }

    const parcelsArray = Array.isArray(parcels) ? parcels : [];

    // Calculations
    const totalParcels = parcelsArray.length;
    const totalSpent = parcelsArray.reduce((sum, p) => sum + (parseFloat(p.cost) || 0), 0);
    const pendingParcels = parcelsArray.filter(p => p.deliveryStatus === 'pending').length;
    const deliveredParcels = parcelsArray.filter(p => p.deliveryStatus === 'parcel_delivered').length;

    // Chart 1: Status Distribution
    const statusCounts = parcelsArray.reduce((acc, p) => {
        const status = p.deliveryStatus || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusChartData = Object.keys(statusCounts).map(status => {
        const formattedName = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
        return { name: formattedName, value: statusCounts[status] };
    });

    // Chart 2: Bookings over time (grouped by date)
    const bookingsByDate = parcelsArray.reduce((acc, p) => {
        if (!p.createdAt) return acc;
        const date = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const timelineData = Object.keys(bookingsByDate).map(date => ({
        date,
        bookings: bookingsByDate[date]
    })).reverse().slice(-10); // Last 10 days of bookings

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back, {user?.displayName || 'User'}!</h1>
                <p className="text-base-content/70 mt-1">Here is a snapshot of your parcel bookings and delivery costs.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Bookings */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Total Booked</span>
                            <h2 className="text-3xl font-black mt-1">{totalParcels}</h2>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                            <FiPackage size={28} />
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Total Spent</span>
                            <h2 className="text-3xl font-black mt-1">${totalSpent}</h2>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                            <FiDollarSign size={28} />
                        </div>
                    </div>
                </div>

                {/* Pending */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Pending</span>
                            <h2 className="text-3xl font-black mt-1">{pendingParcels}</h2>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <FiClock size={28} />
                        </div>
                    </div>
                </div>

                {/* Delivered */}
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                    <div className="card-body flex-row items-center justify-between p-6">
                        <div>
                            <span className="text-sm font-medium text-base-content/60 uppercase">Delivered</span>
                            <h2 className="text-3xl font-black mt-1">{deliveredParcels}</h2>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                            <FiCheckCircle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Timeline */}
                <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-4">
                    <h3 className="text-xl font-bold">Booking Timeline</h3>
                    <p className="text-sm text-base-content/60">Number of parcels booked over the recent days</p>
                    <div className="h-72 w-full">
                        {timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" opacity={0.4} />
                                    <XAxis dataKey="date" tick={{ fill: 'var(--color-base-content)', fontSize: 11 }} opacity={0.7} />
                                    <YAxis tick={{ fill: 'var(--color-base-content)', fontSize: 11 }} opacity={0.7} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', color: 'var(--color-base-content)', borderRadius: '12px', border: '1px solid var(--color-base-300)' }} />
                                    <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-base-content/50">No booking activity recorded yet.</div>
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-4">
                    <h3 className="text-xl font-bold">Delivery Status Distribution</h3>
                    <p className="text-sm text-base-content/60">Breakdown of your parcel delivery stages</p>
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
                            <div className="flex items-center justify-center h-full text-base-content/50">No status data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardHome;