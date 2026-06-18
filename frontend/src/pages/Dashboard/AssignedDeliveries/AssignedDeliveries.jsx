import { useQuery } from '@tanstack/react-query';
import React from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { FaTasks, FaBoxOpen, FaTruckLoading, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AssignedDeliveries = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: parcels = [], refetch, isLoading } = useQuery({
        queryKey: ['parcels', user?.email, 'driver_assigned'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels/rider?riderEmail=${user?.email}&deliveryStatus=driver_assigned`);
            return res.data;
        },
        enabled: !!user?.email
    });

    const handleDeliveryStatusUpdate = (parcel, status) => {
        Swal.fire({
            title: 'Updating Status...',
            text: `Please wait while we update the parcel to: ${status.split('_').join(' ')}.`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const statusInfo = { 
            deliveryStatus: status, 
            riderId: parcel.riderId,
            trackingId: parcel.trackingId
        };

        const readableStatus = status.split('_').join(' ');
        const message = `Parcel status has been successfully updated to "${readableStatus}".`;

        axiosSecure.patch(`/parcels/${parcel._id}/status`, statusInfo)
            .then(res => {
                if (res.data.modifiedCount || res.data.matchedCount) {
                    refetch();
                    Swal.fire({
                        icon: "success",
                        title: "Status Updated!",
                        text: message,
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Failed to update parcel status.",
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.response?.data?.message || "An error occurred while updating status.",
                    timer: 2000,
                    showConfirmButton: false
                });
            });
    };

    // Derived states
    const pendingAcceptance = parcels.filter(p => p.deliveryStatus === 'driver_assigned').length;
    const acceptedCount = parcels.filter(p => p.deliveryStatus === 'rider_arriving' || p.deliveryStatus === 'parcel_picked_up').length;

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn text-base-content">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <FaTasks className="text-primary text-2xl" /> Assigned Deliveries
                    </h2>
                    <p className="text-base-content/70 mt-1">Accept driver assignments, mark packages picked up, and confirm deliveries.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-warning">
                            <FaExclamationCircle className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Pending Acceptance</div>
                        <div className="stat-value text-warning text-3xl font-bold mt-1">{pendingAcceptance}</div>
                        <div className="stat-desc mt-1">Awaiting your response</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <FaTruckLoading className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Active Assignments</div>
                        <div className="stat-value text-primary text-3xl font-bold mt-1">{acceptedCount}</div>
                        <div className="stat-desc mt-1">Accepted / In transit</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <FaCheckCircle className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Total Assigned</div>
                        <div className="stat-value text-success text-3xl font-bold mt-1">{parcels.length}</div>
                        <div className="stat-desc mt-1">All current tasks</div>
                    </div>
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
                                    <th>Parcel Item</th>
                                    <th>Tracking ID</th>
                                    <th>Acceptance Status</th>
                                    <th className="pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parcels.length > 0 ? (
                                    parcels.map((parcel, index) => (
                                        <tr key={parcel._id || index} className="hover:bg-base-200/50 transition-colors duration-150">
                                            <td className="pl-6 font-semibold opacity-70">{index + 1}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                                        <FaBoxOpen className="text-lg" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-base-content">{parcel.parcelName}</div>
                                                        <div className="text-xs text-base-content/50">Sender: {parcel.senderName || parcel.senderEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-mono text-xs font-semibold badge badge-outline border-base-300 py-2.5 px-3 rounded-lg text-primary bg-primary/5">
                                                    {parcel.trackingId || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                {parcel.deliveryStatus === 'driver_assigned' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDeliveryStatusUpdate(parcel, 'rider_arriving')}
                                                            className="btn btn-xs btn-success text-white rounded-lg px-3 font-bold"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeliveryStatusUpdate(parcel, 'pending')}
                                                            className="btn btn-xs btn-error text-white rounded-lg px-3 font-bold"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="badge badge-success py-2.5 px-3 font-bold border-none rounded-lg text-xs uppercase tracking-wider text-white">
                                                        Accepted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="pr-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeliveryStatusUpdate(parcel, 'parcel_picked_up')}
                                                        disabled={parcel.deliveryStatus !== 'rider_arriving'}
                                                        className={`btn btn-sm rounded-xl font-bold transition-all ${
                                                            parcel.deliveryStatus === 'parcel_picked_up'
                                                                ? 'btn-success text-white'
                                                                : 'btn-primary text-white'
                                                        }`}
                                                    >
                                                        {parcel.deliveryStatus === 'parcel_picked_up' ? 'Picked Up' : 'Mark as Picked Up'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeliveryStatusUpdate(parcel, 'parcel_delivered')}
                                                        disabled={parcel.deliveryStatus !== 'parcel_picked_up'}
                                                        className="btn btn-sm btn-accent text-white rounded-xl font-bold transition-all"
                                                    >
                                                        Mark as Delivered
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-base-content/50 font-medium">
                                            No assigned deliveries found.
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

export default AssignedDeliveries;