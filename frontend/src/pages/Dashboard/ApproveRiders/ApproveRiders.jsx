import { useQuery } from '@tanstack/react-query';
import React, { useState, useRef, useEffect } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaEye, FaUserCheck, FaSearch, FaMapMarkerAlt, FaIdCard, FaMotorcycle, FaCalendarAlt, FaEnvelope, FaCompass } from 'react-icons/fa';
import { IoPersonRemoveSharp } from 'react-icons/io5';
import { FaTrashCan, FaGlobe } from 'react-icons/fa6';
import Swal from 'sweetalert2';

const ApproveRiders = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [activeRider, setActiveRider] = useState(null);
    const detailModalRef = useRef(null);
    const [warehouseDistricts, setWarehouseDistricts] = useState([]);

    useEffect(() => {
        fetch('/serviceCenters.json')
            .then(res => res.json())
            .then(data => {
                const uniqueDistricts = [...new Set(data.map(item => item.district))].filter(Boolean).sort();
                setWarehouseDistricts(uniqueDistricts);
            })
            .catch(err => console.error("Error loading warehouse districts:", err));
    }, []);

    const { refetch, data: riders = [], isLoading } = useQuery({
        queryKey: ['riders', 'pending'],
        queryFn: async () => {
            const res = await axiosSecure.get('/riders');
            return res.data;
        }
    });

    const updateRiderStatus = (rider, status) => {
        // Show processing loader overlay
        Swal.fire({
            title: 'Updating Status...',
            text: `Please wait while we set ${rider.name}'s status to ${status}.`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            target: detailModalRef.current?.open ? detailModalRef.current : 'body'
        });

        const updateInfo = { status: status, email: rider.email };
        axiosSecure.patch(`/riders/${rider._id}`, updateInfo)
            .then(res => {
                if (res.data.modifiedCount || res.data.matchedCount) {
                    refetch();
                    if (detailModalRef.current) {
                        detailModalRef.current.close();
                    }
                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        text: `Rider status is successfully set to ${status}.`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Failed to update rider status.",
                        timer: 2000,
                        showConfirmButton: false,
                        target: detailModalRef.current?.open ? detailModalRef.current : 'body'
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.response?.data?.message || "An error occurred while updating status.",
                    timer: 2000,
                    showConfirmButton: false,
                    target: detailModalRef.current?.open ? detailModalRef.current : 'body'
                });
            });
    };

    const handleApproval = rider => {
        Swal.fire({
            title: "Approve Application?",
            text: `Promote ${rider.name} to registered rider status?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "var(--color-primary, #10b981)",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Approve!",
            target: detailModalRef.current?.open ? detailModalRef.current : 'body'
        }).then((result) => {
            if (result.isConfirmed) {
                updateRiderStatus(rider, 'approved');
            }
        });
    };

    const handleRejection = rider => {
        Swal.fire({
            title: "Reject Application?",
            text: `Set ${rider.name}'s application status to rejected?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Reject!",
            target: detailModalRef.current?.open ? detailModalRef.current : 'body'
        }).then((result) => {
            if (result.isConfirmed) {
                updateRiderStatus(rider, 'rejected');
            }
        });
    };

    const handleDeleteRider = rider => {
        Swal.fire({
            title: "Are you sure?",
            text: `This will permanently delete the application of ${rider.name}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            target: detailModalRef.current?.open ? detailModalRef.current : 'body'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleting...',
                    text: `Please wait while we delete ${rider.name}'s application.`,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    target: detailModalRef.current?.open ? detailModalRef.current : 'body'
                });

                axiosSecure.delete(`/riders/${rider._id}`)
                    .then(res => {
                        refetch();
                        if (detailModalRef.current) {
                            detailModalRef.current.close();
                        }
                        Swal.fire({
                            title: "Deleted!",
                            text: "The application has been deleted.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });
                    })
                    .catch(err => {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: err.response?.data?.message || "An error occurred while deleting.",
                            timer: 2000,
                            showConfirmButton: false,
                            target: detailModalRef.current?.open ? detailModalRef.current : 'body'
                        });
                    });
            }
        });
    };

    const openDetailsModal = (rider) => {
        setActiveRider(rider);
        detailModalRef.current.showModal();
    };

    // Filter logic
    const filteredRiders = riders.filter(rider => {
        const matchesSearch = rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              rider.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDistrict = !selectedDistrict || rider.district === selectedDistrict;
        return matchesSearch && matchesDistrict;
    });

    // Unique districts for filter dropdown
    const districts = [...new Set(riders.map(r => r.district))].filter(Boolean);
    const totalPending = riders.filter(r => r.status === 'pending').length;
    const totalApproved = riders.filter(r => r.status === 'approved').length;
    const uniqueRegions = [...new Set(riders.map(r => r.region))].filter(Boolean).length;

    return (
        <div className="p-6 w-full space-y-8 animate-fadeIn text-base-content">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Rider Applications</h2>
                    <p className="text-base-content/70 mt-1">Review, approve, and manage driver applications.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-warning">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
                            </span>
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Pending Approval</div>
                        <div className="stat-value text-warning text-3xl font-bold mt-1">{totalPending}</div>
                        <div className="stat-desc mt-1">Awaiting action</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <FaUserCheck className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Approved Riders</div>
                        <div className="stat-value text-success text-3xl font-bold mt-1">{totalApproved}</div>
                        <div className="stat-desc mt-1">Ready for deliveries</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <FaMapMarkerAlt className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Districts Active</div>
                        <div className="stat-value text-info text-3xl font-bold mt-1">{districts.length}</div>
                        <div className="stat-desc mt-1">Local distribution bases</div>
                    </div>
                </div>

                <div className="stats shadow-lg bg-base-100 border border-base-200 p-2 rounded-2xl">
                    <div className="stat">
                        <div className="stat-figure text-purple-500">
                            <FaGlobe className="text-2xl" />
                        </div>
                        <div className="stat-title text-base-content/60 font-semibold">Regions Covered</div>
                        <div className="stat-value text-purple-500 text-3xl font-bold mt-1">{uniqueRegions}</div>
                        <div className="stat-desc mt-1">Broad logistics hubs</div>
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
                        type="text"
                        placeholder="Search by name or email..."
                        className="input input-bordered pl-10 w-full rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <select
                        className="select select-bordered w-full md:w-56 rounded-xl"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                        <option value="">All Districts</option>
                        {warehouseDistricts.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
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
                                    <th>Rider</th>
                                    <th>District</th>
                                    <th>Application Status</th>
                                    <th>Work Status</th>
                                    <th className="pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRiders.length > 0 ? (
                                    filteredRiders.map((rider, index) => (
                                        <tr key={rider._id || index} className="hover:bg-base-200/50 transition-colors duration-150">
                                            <td className="pl-6 font-semibold opacity-70">{index + 1}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary/20 text-primary-content rounded-xl w-10 h-10 font-bold flex items-center justify-center">
                                                            {rider.name ? rider.name.charAt(0).toUpperCase() : 'R'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-base-content">{rider.name}</div>
                                                        <div className="text-xs text-base-content/50 flex items-center gap-1">
                                                            <FaEnvelope className="text-[10px]" /> {rider.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-medium opacity-85">{rider.district}</td>
                                            <td>
                                                <span className={`badge py-3 px-4 font-bold border-none rounded-xl text-xs uppercase tracking-wider ${
                                                    rider.status === 'approved' 
                                                        ? 'bg-success/15 text-success' 
                                                        : rider.status === 'rejected'
                                                        ? 'bg-error/15 text-error'
                                                        : 'bg-warning/15 text-warning-content animate-pulse'
                                                }`}>
                                                    {rider.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge py-3 px-3 font-semibold border-none rounded-lg text-xs ${
                                                    rider.workStatus === 'available'
                                                        ? 'bg-info/10 text-info'
                                                        : 'bg-base-300 text-base-content/60'
                                                }`}>
                                                    {rider.workStatus || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openDetailsModal(rider)}
                                                        className="btn btn-sm btn-circle btn-ghost text-info hover:bg-info/10"
                                                        title="View Details"
                                                    >
                                                        <FaEye className="text-base" />
                                                    </button>
                                                    
                                                    {rider.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleApproval(rider)}
                                                            className="btn btn-sm btn-circle btn-ghost text-success hover:bg-success/10"
                                                            title="Approve Rider"
                                                        >
                                                            <FaUserCheck className="text-base" />
                                                        </button>
                                                    )}

                                                    {rider.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleRejection(rider)}
                                                            className="btn btn-sm btn-circle btn-ghost text-warning hover:bg-warning/10"
                                                            title="Reject Rider"
                                                        >
                                                            <IoPersonRemoveSharp className="text-base" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteRider(rider)}
                                                        className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error/10"
                                                        title="Delete Application"
                                                    >
                                                        <FaTrashCan className="text-base" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-base-content/50 font-medium">
                                            No applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rider Details Modal */}
            <dialog ref={detailModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-2xl bg-base-100 rounded-3xl border border-base-200 shadow-2xl p-6">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60">✕</button>
                    </form>
                    
                    {activeRider && (
                        <div className="space-y-6">
                            {/* Modal Header */}
                            <div className="flex items-center gap-4 border-b border-base-200 pb-4">
                                <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-2xl w-16 h-16 font-extrabold text-2xl flex items-center justify-center">
                                        {activeRider.name ? activeRider.name.charAt(0).toUpperCase() : 'R'}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl">{activeRider.name}</h3>
                                    <p className="text-base-content/60 text-sm flex items-center gap-1.5 mt-0.5">
                                        <FaEnvelope className="text-xs" /> {activeRider.email}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-base-200 rounded-xl text-primary mt-0.5">
                                            <FaCompass />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider">Region</div>
                                            <div className="font-semibold text-base-content/95 mt-0.5">{activeRider.region || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-base-200 rounded-xl text-primary mt-0.5">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider">District</div>
                                            <div className="font-semibold text-base-content/95 mt-0.5">{activeRider.district || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-base-200 rounded-xl text-primary mt-0.5">
                                            <FaMapMarkerAlt className="opacity-60" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider">Home Address</div>
                                            <div className="font-semibold text-base-content/95 mt-0.5">{activeRider.address || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-base-200 rounded-xl text-primary mt-0.5">
                                            <FaIdCard />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider">Driving License</div>
                                            <div className="font-mono font-semibold text-base-content/95 mt-0.5">{activeRider.license || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-base-200 rounded-xl text-primary mt-0.5">
                                            <FaIdCard className="opacity-60" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider">National ID (NID)</div>
                                            <div className="font-mono font-semibold text-base-content/95 mt-0.5">{activeRider.nid || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-base-200 rounded-xl text-primary mt-0.5">
                                            <FaMotorcycle />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content/40 uppercase tracking-wider">Bike Specifications</div>
                                            <div className="font-semibold text-base-content/95 mt-0.5">{activeRider.bike || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Status Bar */}
                            <div className="flex items-center justify-between bg-base-200/50 p-4 rounded-2xl border border-base-200/60 mt-4">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-base-content/40 text-sm" />
                                    <span className="text-xs text-base-content/50 font-medium">Applied Date:</span>
                                    <span className="text-xs font-bold text-base-content/85">
                                        {activeRider.createdAt ? new Date(activeRider.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-base-content/50 font-medium">Current Status:</span>
                                    <span className={`badge font-bold uppercase text-[10px] py-2.5 px-3 border-none rounded-lg ${
                                        activeRider.status === 'approved' 
                                            ? 'bg-success/15 text-success' 
                                            : activeRider.status === 'rejected'
                                            ? 'bg-error/15 text-error'
                                            : 'bg-warning/15 text-warning-content'
                                    }`}>
                                        {activeRider.status}
                                    </span>
                                </div>
                            </div>

                            {/* Actions inside Modal */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
                                {activeRider.status !== 'approved' && (
                                    <button
                                        onClick={() => handleApproval(activeRider)}
                                        className="btn btn-success text-white rounded-xl gap-2 font-bold shadow-md shadow-success/15"
                                    >
                                        <FaUserCheck /> Approve Rider
                                    </button>
                                )}
                                {activeRider.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleRejection(activeRider)}
                                        className="btn btn-error text-white rounded-xl gap-2 font-bold shadow-md shadow-error/15"
                                    >
                                        <IoPersonRemoveSharp /> Reject Rider
                                    </button>
                                )}
                                <form method="dialog">
                                    <button className="btn btn-outline border-base-300 hover:bg-base-200 rounded-xl px-5">Close</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </dialog>
        </div>
    );
};

export default ApproveRiders;

