import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAddMeasurementMutation,
  useUpdateMeasurementMutation,
  useGetMeasurementByIdQuery,
} from '../features/api/measurement.api';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import MeasurementCard from '../components/MeasurementCard'; // Make sure this exists

const MeasurementForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const viewOnly = useMemo(() => new URLSearchParams(location.search).get('view') === 'true', [location]);

  const { data, isLoading: isFetching } = useGetMeasurementByIdQuery(id, {
    skip: !id,
  });

  const [createMeasurement, { isLoading: creating }] = useAddMeasurementMutation();
  const [updateMeasurement, { isLoading: updating }] = useUpdateMeasurementMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      profileName: 'My Measurements',
      chest: '',
      waist: '',
      hips: '',
      shoulderWidth: '',
      armLength: '',
      inseam: '',
      height: '',
      notes: '',
    }
  });

  useEffect(() => {
    if (data?.data && !viewOnly) {
      reset(data.data);
    }
  }, [data, reset, viewOnly]);

  const onSubmit = async (formData) => {
    try {
      if (id) {
        const res = await updateMeasurement({ id, updates: { ...formData } }).unwrap();
        toast.success('Measurement updated!');
      } else {
        await createMeasurement(formData).unwrap();
        toast.success('Measurement saved!');
      }
      navigate(`/profile`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save');
    }
  };

  if (isFetching) return <Loader />;
  const isBusy = creating || updating;

  // ✅ View-only mode: show the measurement card
  if (id && viewOnly && data?.data) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-neutral-default p-4">
        <MeasurementCard data={data.data} />
      </div>
    );
  }

  // ✅ Form mode
  return (
    <div className="flex items-center justify-center px-6 ">
      <div className="w-full max-w-5xl bg-white p-10 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {id ? 'Update Your Measurements' : 'Enter Your Measurements'}
        </h2>
  
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Profile Name - full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <input
              placeholder="Profile Name"
              {...register('profileName')}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Chest *"
              {...register('chest', { required: true })}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
            {errors.chest && <p className="text-red-500 text-sm mt-1">Required</p>}
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Waist *"
              {...register('waist', { required: true })}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
            {errors.waist && <p className="text-red-500 text-sm mt-1">Required</p>}
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Hips"
              {...register('hips')}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Shoulder Width"
              {...register('shoulderWidth')}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Arm Length"
              {...register('armLength')}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Inseam"
              {...register('inseam')}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
          </div>
  
          <div>
            <input
              type="number"
              placeholder="Height *"
              {...register('height', { required: true })}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
            {errors.height && <p className="text-red-500 text-sm mt-1">Required</p>}
          </div>
  
          {/* Notes - full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <textarea
              placeholder="Additional Notes"
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white text-black"
            />
          </div>
  
          {/* Submit button - full width */}
          <div className="md:col-span-2 lg:col-span-3 text-center mt-4">
            <button
              type="submit"
              disabled={isBusy}
              className={`w-full py-3 bg-yellow-600 text-white font-semibold transition duration-300 ease-in-out ${
                isBusy ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-700'
              }`}
            >
              {isBusy ? <Loader /> : id ? 'Update Measurement' : 'Save Measurements'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasurementForm;
