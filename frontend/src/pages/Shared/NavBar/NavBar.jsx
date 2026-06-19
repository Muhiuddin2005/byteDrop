import React from 'react';
import Logo from '../../../components/Logo/Logo';
import { Link, NavLink } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import useRole from '../../../hooks/useRole';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const NavBar = () => {
    const { user, logOut } = useAuth();
    const { role } = useRole();
    const axiosSecure = useAxiosSecure();

    // Check if the user has already submitted a rider application
    const { data: riderApplication = [] } = useQuery({
        queryKey: ['rider-application', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/riders?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    const hasApplied = Array.isArray(riderApplication) && riderApplication.length > 0;
    const shouldHideRiderAction = role === 'admin' || role === 'rider' || hasApplied;

    const handleLogOut = () => {
        logOut()
            .then()
            .catch(error => {
            })
    }

    const links = <>
        <li><NavLink to="">Services</NavLink></li>
        {role !== 'rider' && <li><NavLink to="/send-parcel">Send a Parcel</NavLink></li>}
        {!shouldHideRiderAction && <li><NavLink to="/rider">Be a Rider</NavLink></li>}
        <li><NavLink to="/coverage">Coverage Areas</NavLink></li>
        {
            user && <>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            </>
        }
    </>

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        {links}
                    </ul>
                </div>
                <div className="flex items-center hover:opacity-85 transition-opacity px-2">
                    <Logo></Logo>
                </div>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    {links}
                </ul>
            </div>
            <div className="navbar-end">
                {
                    user ?
                        <a onClick={handleLogOut} className="btn">Log Out</a>
                        : <Link className='btn' to="/login">Log in</Link>
                }
                {!shouldHideRiderAction && (
                    <Link
                        className='btn btn-primary text-primary-content mx-4'
                        to="/rider">Be a Rider</Link>
                )}
            </div>
        </div>
    );
};

export default NavBar;
