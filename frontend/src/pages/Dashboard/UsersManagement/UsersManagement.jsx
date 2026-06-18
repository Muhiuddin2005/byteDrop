import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaUserShield, FaSearch, FaUsers, FaUserTie, FaMotorcycle, FaEnvelope, FaUser } from 'react-icons/fa';
import { FiShieldOff } from 'react-icons/fi';
import Swal from 'sweetalert2';

const UsersManagement = () => {
    const axiosSecure = useAxiosSecure();
    const [searchText, setSearchText] = useState('');

    const { refetch, data: users = [], isLoading } = useQuery({
        queryKey: ['users', searchText],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users?searchText=${searchText}`);
            return res.data;
        }
    });

    const handleMakeAdmin = user => {
        Swal.fire({
            title: "Promote User?",
            text: `You are about to promote ${user.displayName} to an Admin!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "var(--color-primary, #10b981)",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, make Admin!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Updating Role...',
                    text: 'Please wait...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                const roleInfo = { role: 'admin' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount || res.data.matchedCount || res.data.acknowledged) {
                            refetch();
                            Swal.fire({
                                icon: "success",
                                title: "Promoted!",
                                text: `${user.displayName} is now an Admin`,
                                showConfirmButton: false,
                                timer: 2000
                            });
                        }
                    });
            }
        });
    };

    const handleRemoveAdmin = user => {
        Swal.fire({
            title: "Revoke Privileges?",
            text: `Remove Admin privileges from ${user.displayName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, remove!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Revoking Role...',
                    text: 'Please wait...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                const roleInfo = { role: 'user' };
                axiosSecure.patch(`/users/${user._id}/role`, roleInfo)
                    .then(res => {
                        if (res.data.modifiedCount || res.data.matchedCount || res.data.acknowledged) {
                            refetch();
                            Swal.fire({
                                icon: "success",
                                title: "Demoted!",
                                text: `${user.displayName} removed from Admin`,
                                showConfirmButton: false,
                                timer: 2000
                            });
                        }
                    });
            }
        });
    };

    const usersArray = Array.isArray(users) ? users : [];

    // Calculate Role Counts
    const totalUsers = usersArray.length;
    const adminsCount = usersArray.filter(u => u.role === 'admin').length;
    const ridersCount = usersArray.filter(u => u.role === 'rider').length;
    const normalUsersCount = usersArray.filter(u => !u.role || u.role === 'user').length;

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn text-base-content">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Users Management</h2>
                    <p className="text-base-content/70 mt-1">Manage platform users, roles, and administrative privileges.</p>
                </div>
            </div>

            {/* Role Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <FaUsers className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Total Accounts</div>
                        <div className="stat-value text-primary text-3xl font-bold mt-1">{totalUsers}</div>
                        <div className="stat-desc mt-1">Registered members</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-purple-500">
                            <FaUserTie className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Admins</div>
                        <div className="stat-value text-purple-500 text-3xl font-bold mt-1">{adminsCount}</div>
                        <div className="stat-desc mt-1">System managers</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <FaMotorcycle className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Riders</div>
                        <div className="stat-value text-info text-3xl font-bold mt-1">{ridersCount}</div>
                        <div className="stat-desc mt-1">Active logistics personnel</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <FaUser className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Standard Users</div>
                        <div className="stat-value text-success text-3xl font-bold mt-1">{normalUsersCount}</div>
                        <div className="stat-desc mt-1">General clients</div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Panel */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200 shadow-md">
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                        <FaSearch />
                    </span>
                    <input
                        onChange={(e) => setSearchText(e.target.value)}
                        type="search"
                        value={searchText}
                        className="input input-bordered pl-10 w-full rounded-xl focus:border-primary"
                        placeholder="Search users by name..."
                    />
                </div>
            </div>

            {/* Users Card / Table */}
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
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Toggle Role</th>
                                    <th className="pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersArray.length > 0 ? (
                                    usersArray.map((user, index) => (
                                        <tr key={user._id || index} className="hover:bg-base-200/50 transition-colors duration-150">
                                            <td className="pl-6 font-semibold opacity-70">{index + 1}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle h-11 w-11 bg-base-300">
                                                            <img
                                                                src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                                                                alt={user.displayName}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-base-content">{user.displayName}</div>
                                                        <div className="text-xs text-base-content/50">{user.district || 'Member'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-medium opacity-85">
                                                <div className="flex items-center gap-1.5">
                                                    <FaEnvelope className="text-xs opacity-50" /> {user.email}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge py-3 px-4 font-bold border-none rounded-xl text-xs uppercase tracking-wider ${
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-500/15 text-purple-600' 
                                                        : user.role === 'rider'
                                                        ? 'bg-blue-500/15 text-blue-600'
                                                        : 'bg-base-200 text-base-content/75'
                                                }`}>
                                                    {user.role || 'user'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleRemoveAdmin(user)}
                                                        className="btn btn-error btn-sm rounded-xl px-4 flex gap-2 font-bold text-white hover:scale-105 transition-all"
                                                        title="Revoke Admin status"
                                                    >
                                                        <FiShieldOff /> Demote
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMakeAdmin(user)}
                                                        className="btn btn-primary btn-sm rounded-xl px-4 flex gap-2 font-bold text-primary-content hover:scale-105 transition-all"
                                                        title="Make Admin"
                                                    >
                                                        <FaUserShield /> Promote
                                                    </button>
                                                )}
                                            </td>
                                            <td className="pr-6 text-right">
                                                <button className="btn btn-ghost btn-sm text-base-content/65 hover:text-base-content font-bold">
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-base-content/50 font-medium">
                                            No users found matching your search.
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

export default UsersManagement;