import { useQuery } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { FaMotorcycle, FaSearch, FaBox, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

const AssignRiders = () => {
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const axiosSecure = useAxiosSecure();
    const riderModalRef = useRef();

    const { data: parcels = [], refetch: parcelsRefetch, isLoading } = useQuery({
        queryKey: ['parcels', 'pending-pickup'],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels?deliveryStatus=pending-pickup');
            return res.data;
        }
    });

    const { data: riders = [], refetch: riderRefetch, isLoading: isLoadingRiders } = useQuery({
        queryKey: ['riders', selectedParcel?.senderDistrict, 'available'],
        enabled: !!selectedParcel,
        queryFn: async () => {
            const res = await axiosSecure.get(`/riders?status=approved&district=${selectedParcel?.senderDistrict}&workStatus=available`);
            return res.data;
        }
    });

    const openAssignRiderModal = parcel => {
        setSelectedParcel(parcel);
        riderModalRef.current.showModal();
    };

    const handleAssignRider = rider => {
        const riderAssignInfo = {
            riderId: rider._id,
            riderEmail: rider.email,
            riderName: rider.name,
            parcelId: selectedParcel._id,
            trackingId: selectedParcel.trackingId
        };
        Swal.fire({
            title: 'Assigning Rider...',
            text: 'Please wait...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        axiosSecure.patch(`/parcels/${selectedParcel._id}`, riderAssignInfo)
            .then(res => {
                if (res.data.modifiedCount || res.data.matchedCount) {
                    riderModalRef.current.close();
                    parcelsRefetch();
                    riderRefetch();
                    Swal.fire({
                        icon: "success",
                        title: "Rider Assigned!",
                        text: `Rider has been assigned successfully.`,
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Assignment Failed",
                        text: "Failed to assign rider to the parcel.",
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.response?.data?.message || "An error occurred during assignment.",
                    timer: 2000,
                    showConfirmButton: false
                });
            });
    };

    // Filters
    const filteredParcels = parcels.filter(parcel => {
        const matchesSearch = parcel.parcelName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              parcel.senderDistrict?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const totalCost = parcels.reduce((sum, p) => sum + (p.cost || 0), 0);
    const uniqueDistricts = [...new Set(parcels.map(p => p.senderDistrict))].filter(Boolean).length;

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn text-base-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Assign Riders</h2>
                    <p className="text-base-content/70 mt-1">Match pending shipments with available local couriers.</p>
                </div>
            </div>

            {/* Logistics Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <FaBox className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Pending Pickup</div>
                        <div className="stat-value text-primary text-3xl font-bold mt-1">{parcels.length}</div>
                        <div className="stat-desc mt-1">Parcels awaiting rider assignment</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <FaDollarSign className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Total Revenue Value</div>
                        <div className="stat-value text-success text-3xl font-bold mt-1">${totalCost.toFixed(2)}</div>
                        <div className="stat-desc mt-1">Sum of pending pickup costs</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <FaMapMarkerAlt className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Pickup Hubs</div>
                        <div className="stat-value text-info text-3xl font-bold mt-1">{uniqueDistricts}</div>
                        <div className="stat-desc mt-1">Active delivery source districts</div>
                    </div>
                </div>
            </div>

            {/* Search filter bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200 shadow-md">
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        placeholder="Search parcels or districts..."
                        className="input input-bordered pl-10 w-full rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
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
                                    <th>Cost</th>
                                    <th>Created At</th>
                                    <th>Pickup District</th>
                                    <th className="pr-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParcels.length > 0 ? (
                                    filteredParcels.map((parcel, index) => (
                                        <tr key={parcel._id} className="hover:bg-base-200/50 transition-colors duration-150">
                                            <td className="pl-6 font-semibold opacity-70">{index + 1}</td>
                                            <td>
                                                <div className="font-bold text-base-content">{parcel.parcelName}</div>
                                                <div className="text-xs text-base-content/50">ID: {parcel._id}</div>
                                            </td>
                                            <td className="font-bold text-success">${parcel.cost}</td>
                                            <td className="text-xs font-medium text-base-content/75 flex items-center gap-1.5 py-4">
                                                <FaCalendarAlt className="opacity-55" /> 
                                                {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </td>
                                            <td>
                                                <span className="badge bg-info/10 text-info font-semibold rounded-lg py-3 px-3.5">
                                                    {parcel.senderDistrict}
                                                </span>
                                            </td>
                                            <td className="pr-6 text-right">
                                                <button
                                                    onClick={() => openAssignRiderModal(parcel)}
                                                    className="btn btn-primary btn-sm text-primary-content font-bold rounded-xl shadow-md shadow-primary/25 hover:scale-105 transition-all"
                                                >
                                                    <FaMotorcycle className="mr-1.5" /> Find Riders
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-base-content/50 font-medium">
                                            No pending pickup parcels found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rider Assignment Modal */}
            <dialog ref={riderModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-xl bg-base-100 rounded-3xl border border-base-200 shadow-2xl p-6">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60">✕</button>
                    </form>

                    {selectedParcel && (
                        <div className="space-y-6">
                            {/* Modal Header */}
                            <div>
                                <h3 className="font-extrabold text-2xl text-base-content">Match Available Riders</h3>
                                <p className="text-sm text-base-content/60 mt-1.5">
                                    Displaying active, approved riders available in <span className="font-bold text-primary">{selectedParcel.senderDistrict}</span>.
                                </p>
                            </div>

                            {/* Parcel Quick Details */}
                            <div className="bg-base-200/60 border border-base-200 p-4 rounded-2xl flex items-center justify-between text-sm">
                                <div>
                                    <span className="text-base-content/50">Parcel:</span> <span className="font-bold">{selectedParcel.parcelName}</span>
                                </div>
                                <div>
                                    <span className="text-base-content/50">Tracking:</span> <span className="font-mono font-bold text-xs">{selectedParcel.trackingId}</span>
                                </div>
                            </div>

                            {/* Riders List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-base-content/55">Available Riders ({riders.length})</h4>
                                
                                {isLoadingRiders ? (
                                    <div className="flex justify-center py-8">
                                        <span className="loading loading-spinner text-primary"></span>
                                    </div>
                                ) : riders.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                                        {riders.map((rider, i) => (
                                            <div key={rider._id || i} className="flex items-center justify-between p-3.5 bg-base-100 border border-base-200 hover:border-primary/40 rounded-xl transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 font-bold flex items-center justify-center">
                                                            {rider.name ? rider.name.charAt(0).toUpperCase() : 'R'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-base-content">{rider.name}</div>
                                                        <div className="text-xs text-base-content/50 flex items-center gap-1">
                                                            <FaEnvelope className="text-[10px]" /> {rider.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignRider(rider)}
                                                    className="btn btn-sm btn-success text-white font-bold rounded-lg px-4 hover:scale-105 transition-all"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert bg-warning/10 text-warning-content border border-warning/20 p-4 rounded-xl flex items-start gap-3">
                                        <FaExclamationTriangle className="text-warning text-lg mt-0.5" />
                                        <div>
                                            <div className="font-bold text-sm">No couriers available!</div>
                                            <p className="text-xs opacity-80 mt-0.5">
                                                There are currently no approved riders registered or available in {selectedParcel.senderDistrict}.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-end pt-3 border-t border-base-200">
                                <form method="dialog">
                                    <button className="btn btn-outline border-base-300 hover:bg-base-200 rounded-xl px-6">Close</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </dialog>
        </div>
    );
};

export default AssignRiders;