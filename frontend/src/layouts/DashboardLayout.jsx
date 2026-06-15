import React from 'react';
import { CiDeliveryTruck } from 'react-icons/ci';
import { FaMotorcycle, FaRegCreditCard, FaTasks, FaUsers } from 'react-icons/fa';
import { Link, NavLink, Outlet } from 'react-router';
import useRole from '../hooks/useRole';
import { RiEBikeFill } from 'react-icons/ri';
import { SiGoogletasks } from 'react-icons/si';
import logoImg from '../assets/logo.png';

const DashboardLayout = () => {
    const { role } = useRole();
    return (
        <div className="drawer lg:drawer-open max-w-7xl mx-auto ">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col min-h-screen bg-base-100 text-base-content">
                {/* Navbar */}
                <nav className="navbar w-full bg-base-200 border-b border-base-300 px-4 flex justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost lg:hidden">
                            {/* Sidebar toggle icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-5"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                        </label>
                        <div className="text-xl font-bold tracking-tight text-primary">ByteDrop Dashboard</div>
                    </div>
                </nav>

                {/* Animated Parcel Path */}
                <div className="relative w-full h-8 bg-base-200 border-b border-base-300 overflow-hidden flex items-center shadow-inner">
                    {/* Dashed Road line */}
                    <div className="w-full border-t-2 border-dashed border-base-content/10 absolute"></div>
                    {/* Moving parcel/truck */}
                    <div className="animate-drive flex items-center gap-2 text-primary">
                        <CiDeliveryTruck className="text-2xl animate-bounce" />
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-content px-2 py-0.5 rounded-full shadow-md">
                            In Transit
                        </span>
                    </div>
                </div>

                {/* Page content here */}
                <main className="flex-grow p-4 md:p-6 lg:p-8">
                    <Outlet></Outlet>
                </main>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible z-30">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-200 border-r border-base-300 is-drawer-close:w-14 is-drawer-open:w-64">
                    {/* Logo Header Area */}
                    <div className="w-full p-4 flex justify-center border-b border-base-300 bg-base-200/50">
                        <Link to="/" className="flex items-center justify-center hover:opacity-85 transition-opacity duration-200">
                            <img src={logoImg} alt="ByteDrop Logo" className="h-8 w-auto object-contain is-drawer-close:h-5" />
                        </Link>
                    </div>

                    {/* Sidebar content here */}
                    <ul className="menu w-full grow gap-1 p-2 mt-2">
                        <li>
                            <Link to="/dashboard" className="is-drawer-close:tooltip is-drawer-close:tooltip-right py-3" data-tip="Homepage">
                                {/* Home icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-5"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                                <span className="is-drawer-close:hidden font-semibold">Home page</span>
                            </Link>
                        </li>

                        {role !== 'admin' && role !== 'rider' && (
                            <>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right py-3" data-tip="MyParcels" to="/dashboard/my-parcels">
                                        <CiDeliveryTruck className="text-xl" />
                                        <span className="is-drawer-close:hidden font-semibold">My Parcels</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right py-3" data-tip="Payment History" to="/dashboard/payment-history">
                                        <FaRegCreditCard className="text-lg" />
                                        <span className="is-drawer-close:hidden font-semibold">Payment History</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                        {
                            role === 'rider' && <>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Assigned Deliveries" to="/dashboard/assigned-deliveries">
                                        <FaTasks />
                                        <span className="is-drawer-close:hidden">Assigned Deliveries</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Completed Deliveries" to="/dashboard/completed-deliveries">
                                        <SiGoogletasks />
                                        <span className="is-drawer-close:hidden">Completed Deliveries</span>
                                    </NavLink>
                                </li>
                            </>
                        }


                        {/* admin only links */}
                        {
                            role === 'admin' && <>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Approve Riders" to="/dashboard/approve-riders">
                                        <FaMotorcycle />
                                        <span className="is-drawer-close:hidden">Approve Riders</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Assign Riders" to="/dashboard/assign-riders">
                                        <RiEBikeFill />
                                        <span className="is-drawer-close:hidden">Assign Riders</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Users Management" to="/dashboard/users-management">
                                        <FaUsers></FaUsers>
                                        <span className="is-drawer-close:hidden">Users Management</span>
                                    </NavLink>
                                </li>
                            </>
                        }

                        {/* List item */}
                        <li>
                            <NavLink to="/dashboard/settings" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
                                {/* Settings icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                                <span className="is-drawer-close:hidden">Settings</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;