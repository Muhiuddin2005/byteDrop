import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaCheckCircle, FaReceipt, FaTruck, FaArrowRight, FaHome } from 'react-icons/fa';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [paymentInfo, setPaymentInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const sessionId = searchParams.get('session_id');
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (sessionId) {
            axiosSecure.patch(`/payment-success?session_id=${sessionId}`)
                .then(res => {
                    setPaymentInfo({
                        transactionId: res.data.transactionId,
                        trackingId: res.data.trackingId
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [sessionId, axiosSecure]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col justify-center items-center">
                <span className="loading loading-ring loading-lg text-primary scale-125"></span>
                <p className="text-base-content/60 mt-4 font-medium animate-pulse">Verifying payment details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[75vh] flex items-center justify-center p-4">
            <div className="card w-full max-w-lg bg-base-100/70 backdrop-blur-xl border border-base-200/80 shadow-2xl rounded-3xl overflow-hidden animate-fadeIn relative">
                {/* Visual Accent Top Bar */}
                <div className="h-2 bg-gradient-to-r from-success via-emerald-400 to-success" />

                <div className="card-body items-center text-center p-8 space-y-6">
                    {/* Success Animation Circle */}
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-success/10 text-success animate-bounce">
                        <FaCheckCircle className="text-6xl animate-pulse" />
                        <span className="absolute inline-flex h-full w-full rounded-full bg-success/20 animate-ping opacity-30"></span>
                    </div>

                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-base-content">Payment Success!</h2>
                        <p className="text-success font-semibold mt-1">Thank you for your transaction.</p>
                        <p className="text-base-content/60 text-sm max-w-sm mx-auto mt-2">
                            Your shipment payment has been verified. Our delivery agents will be dispatched shortly.
                        </p>
                    </div>

                    {/* Receipt Details Card */}
                    <div className="w-full bg-base-200/50 rounded-2xl p-5 border border-base-200 text-left space-y-4 shadow-inner">
                        <div className="flex justify-between items-center pb-2 border-b border-base-200/80">
                            <span className="text-xs text-base-content/50 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <FaReceipt className="text-primary" /> Transaction Details
                            </span>
                            <span className="badge badge-success badge-sm font-bold uppercase py-2 px-2.5 rounded-lg border-none text-[10px]">Paid</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-base-content/50 block">Transaction ID</span>
                                <span className="font-mono text-sm font-bold text-base-content/90 select-all break-all">
                                    {paymentInfo.transactionId || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="text-xs text-base-content/50 block">Parcel Tracking ID</span>
                                <span className="font-mono text-sm font-bold text-primary select-all flex items-center gap-1.5">
                                    <FaTruck className="text-xs" /> {paymentInfo.trackingId || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                        <Link 
                            to="/dashboard/my-parcels" 
                            className="btn btn-primary rounded-xl font-bold gap-2 text-white shadow-md shadow-primary/10 transition-all hover:scale-[1.02]"
                        >
                            Track Parcel <FaArrowRight className="text-xs" />
                        </Link>
                        <Link 
                            to="/dashboard/payment-history" 
                            className="btn btn-outline border-base-300 hover:bg-base-200 rounded-xl font-bold gap-2 transition-all hover:scale-[1.02]"
                        >
                            Payment History
                        </Link>
                    </div>

                    <Link 
                        to="/" 
                        className="btn btn-ghost btn-sm rounded-lg text-base-content/50 hover:text-base-content font-medium gap-1.5 mt-2"
                    >
                        <FaHome className="text-xs" /> Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;