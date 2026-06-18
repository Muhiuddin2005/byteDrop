import React, { useEffect, useState } from 'react';
import { Link } from 'react-router'; 
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FiUser, FiImage, FiLock, FiSettings, FiCheck, FiUploadCloud } from 'react-icons/fi';

const Settings = () => {
    const { user, updateUserProfile, updateUserPassword } = useAuth();
    
    // Initialize theme from local storage or default to 'light'
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    
    // Profile form states
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [password, setPassword] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Sync profile values when user updates
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setPhotoURL(user.photoURL || '');
        }
    }, [user]);

    // Update the HTML data-theme attribute whenever the theme changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.querySelector('html').setAttribute('data-theme', theme);
    }, [theme]);

    const handleThemeChange = (e) => {
        setTheme(e.target.value);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const imageHostKey = import.meta.env.VITE_image_host_key;
            if (!imageHostKey) {
                throw new Error("Hosting API Key not configured.");
            }
            const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imageHostKey}`, formData);
            if (res.data.success) {
                setPhotoURL(res.data.data.display_url);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Upload failed',
                text: error.message || 'Failed to upload image. Please try again.'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) {
            return Swal.fire({ icon: 'error', title: 'Oops...', text: 'Display Name cannot be empty!' });
        }
        setProfileLoading(true);
        try {
            await updateUserProfile({ displayName, photoURL });
            Swal.fire({
                icon: 'success',
                title: 'Profile updated successfully!',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: error.message || 'Failed to update profile.'
            });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!password || password.length < 6) {
            return Swal.fire({ icon: 'error', title: 'Oops...', text: 'Password must be at least 6 characters long!' });
        }
        setPasswordLoading(true);
        try {
            await updateUserPassword(password);
            setPassword('');
            Swal.fire({
                icon: 'success',
                title: 'Password updated successfully!',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: error.message || 'Failed to update password. You may need to log out and log in again to perform this operation.'
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="p-6 w-full max-w-4xl mx-auto space-y-8 animate-fadeIn text-base-content">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
                <p className="text-base-content/70 mt-1">Manage your profile details, passwords, and workspace preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview (Left) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card bg-base-100 shadow-xl border border-base-200 p-6 flex flex-col items-center text-center">
                        <div className="avatar mb-4">
                            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300">
                                <img 
                                    src={photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                                    alt="Profile avatar" 
                                />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold">{displayName || 'User'}</h2>
                        <p className="text-xs text-base-content/65 mb-2">{user?.email}</p>
                        <div className="badge badge-primary font-bold uppercase tracking-wider text-xs text-primary-content">
                            Active Session
                        </div>
                    </div>

                    {/* Appearance & Navigation */}
                    <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-6">
                        <section className="space-y-3">
                            <h3 className="text-lg font-bold flex items-center gap-2"><FiSettings className="text-primary" /> Appearance</h3>
                            <p className="text-xs text-base-content/60">Select your preferred dashboard theme:</p>
                            <select 
                                className="select select-bordered select-sm w-full" 
                                value={theme} 
                                onChange={handleThemeChange}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="cupcake">Cupcake</option>
                                <option value="corporate">Corporate</option>
                                <option value="synthwave">Synthwave</option>
                                <option value="retro">Retro</option>
                                <option value="cyberpunk">Cyberpunk</option>
                                <option value="dim">Dim</option>
                            </select>
                        </section>

                        <div className="divider my-0"></div>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold">Main Website</h3>
                            <Link to="/" className="btn btn-outline btn-sm w-full font-bold">
                                Exit Dashboard
                            </Link>
                        </section>
                    </div>
                </div>

                {/* Profile Edit Forms (Right) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Profile Info */}
                    <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-6">
                        <h3 className="text-xl font-bold border-b border-base-200 pb-3 flex items-center gap-2">
                            <FiUser className="text-primary" /> Edit Profile Details
                        </h3>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label font-semibold">Display Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content/40"><FiUser /></span>
                                    <input 
                                        type="text" 
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="input input-bordered w-full pl-10" 
                                        placeholder="Enter your name" 
                                    />
                                </div>
                            </div>

                            <div className="form-control w-full">
                                <label className="label font-semibold">Upload Profile Image</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-4 cursor-pointer hover:border-primary hover:bg-base-200/50 transition-all duration-200">
                                        <FiUploadCloud className="text-3xl text-base-content/40 mb-1" />
                                        <span className="text-xs font-bold text-base-content/60">
                                            {uploading ? "Uploading to Imgbb..." : "Click to upload avatar"}
                                        </span>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={uploading}
                                            className="hidden" 
                                        />
                                    </label>
                                    {photoURL && (
                                        <div className="w-16 h-16 rounded-xl border overflow-hidden bg-base-300 shadow-inner shrink-0">
                                            <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={profileLoading || uploading}
                                    className="btn btn-primary px-6 text-primary-content font-bold shadow-md hover:scale-105 transition-all flex gap-2"
                                >
                                    {profileLoading ? <span className="loading loading-spinner loading-xs"></span> : <FiCheck />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="card bg-base-100 shadow-xl border border-base-200 p-6 space-y-6">
                        <h3 className="text-xl font-bold border-b border-base-200 pb-3 flex items-center gap-2">
                            <FiLock className="text-secondary" /> Security settings
                        </h3>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label font-semibold">New Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content/40"><FiLock /></span>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input input-bordered w-full pl-10" 
                                        placeholder="••••••••" 
                                    />
                                </div>
                                <span className="label-text-alt text-base-content/50 mt-1">Minimum 6 characters required.</span>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={passwordLoading}
                                    className="btn btn-secondary px-6 text-secondary-content font-bold shadow-md hover:scale-105 transition-all flex gap-2"
                                >
                                    {passwordLoading ? <span className="loading loading-spinner loading-xs"></span> : <FiLock />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
