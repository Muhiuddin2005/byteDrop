import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useLoaderData } from 'react-router';
import Swal from 'sweetalert2';

const Rider = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors } 
    } = useForm();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const serviceCenters = useLoaderData();
    const regionsDuplicate = serviceCenters.map(c => c.region);

    const regions = [...new Set(regionsDuplicate)];
    const districtsByRegion = (region) => {
        const regionDistricts = serviceCenters.filter(c => c.region === region);
        const districts = regionDistricts.map(d => d.district);
        return districts;
    }

    const riderRegion = useWatch({ control, name: 'region' });

    const handleRiderApplication = data => {
        axiosSecure.post('/riders', data)
            .then(res => {
                if (res.data.message === 'already applied') {
                    Swal.fire({
                        icon: "warning",
                        title: "Already Applied",
                        text: "You have already submitted a rider application!",
                        confirmButtonColor: "var(--color-primary, #3b82f6)",
                    });
                }
                else if (res.data.insertedId) {
                    Swal.fire({
                        icon: "success",
                        title: "Application Submitted!",
                        text: "Your application has been submitted. We will contact you soon.",
                        showConfirmButton: false,
                        timer: 2500
                    });
                }
            })
    }
    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-primary mb-2">Be a Rider</h2>
            <p className="text-base-content/75 mb-6">Complete all fields below to apply as a Rider in our logistics system.</p>
            <form onSubmit={handleSubmit(handleRiderApplication)} className='mt-8 p-6 bg-base-200 rounded-3xl border border-base-300 text-base-content shadow-lg space-y-6'>

                {/* two column */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {/* rider Details */}

                    <fieldset className="fieldset flex flex-col gap-2">
                        <legend className="text-2xl font-bold mb-2">Rider Details</legend>
                        
                        {/* rider name */}
                        <div className="form-control">
                            <label className="label font-semibold">Rider Name</label>
                            <input type="text" {...register('name', { required: "Rider Name is required" })}
                                defaultValue={user?.displayName}
                                className="input input-bordered w-full" placeholder="Rider Name" />
                            {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                        </div>

                        {/* rider email */}
                        <div className="form-control">
                            <label className="label font-semibold">Email</label>
                            <input type="email" {...register('email', { required: "Email is required" })}
                                defaultValue={user?.email}
                                className="input input-bordered w-full" placeholder="Email" />
                            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                        </div>

                        {/* rider region */}
                        <div className="form-control">
                            <label className="label font-semibold">Region</label>
                            <select {...register('region', { required: "Region selection is required", validate: value => value !== "Pick a region" || "Please select a region" })} defaultValue="Pick a region" className="select select-bordered w-full">
                                <option disabled={true}>Pick a region</option>
                                {
                                    regions.map((r, i) => <option key={i} value={r}>{r}</option>)
                                }
                            </select>
                            {errors.region && <span className="text-red-500 text-xs mt-1">{errors.region.message}</span>}
                        </div>

                        {/* rider districts */}
                        <div className="form-control">
                            <label className="label font-semibold">District</label>
                            <select {...register('district', { required: "District selection is required", validate: value => value !== "Pick a district" || "Please select a district" })} defaultValue="Pick a district" className="select select-bordered w-full">
                                <option disabled={true}>Pick a district</option>
                                {
                                    districtsByRegion(riderRegion).map((r, i) => <option key={i} value={r}>{r}</option>)
                                }
                            </select>
                            {errors.district && <span className="text-red-500 text-xs mt-1">{errors.district.message}</span>}
                        </div>

                        {/* rider address */}
                        <div className="form-control">
                            <label className="label font-semibold">Your Address</label>
                            <input type="text" {...register('address', { required: "Address is required" })} className="input input-bordered w-full" placeholder="Your Address" />
                            {errors.address && <span className="text-red-500 text-xs mt-1">{errors.address.message}</span>}
                        </div>
                    </fieldset>

                    {/* More Details */}
                    <fieldset className="fieldset flex flex-col gap-2">
                        <legend className="text-2xl font-bold mb-2">More Details</legend>
                        
                        {/* Driving License */}
                        <div className="form-control">
                            <label className="label font-semibold">Driving License</label>
                            <input type="text" {...register('license', { required: "Driving License number is required" })} className="input input-bordered w-full" placeholder="Driving License" />
                            {errors.license && <span className="text-red-500 text-xs mt-1">{errors.license.message}</span>}
                        </div>

                        {/* NID */}
                        <div className="form-control">
                            <label className="label font-semibold">NID</label>
                            <input type="text" {...register('nid', { required: "NID number is required" })} className="input input-bordered w-full" placeholder="NID" />
                            {errors.nid && <span className="text-red-500 text-xs mt-1">{errors.nid.message}</span>}
                        </div>

                        {/* Bike */}
                        <div className="form-control">
                            <label className="label font-semibold">BIKE</label>
                            <input type="text" {...register('bike', { required: "Bike model/info is required" })} className="input input-bordered w-full" placeholder="Bike Info" />
                            {errors.bike && <span className="text-red-500 text-xs mt-1">{errors.bike.message}</span>}
                        </div>
                    </fieldset>
                </div>
                <div className="pt-4 flex justify-end">
                    <input type="submit" className='btn btn-primary px-8 text-primary-content font-bold shadow-md hover:scale-105 transition-all' value="Apply as a Rider" />
                </div>
            </form>
        </div>
    );
};

export default Rider;
