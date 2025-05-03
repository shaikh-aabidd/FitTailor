import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useGetCurrentUserQuery
} from '../features/api/user.api';
import {
  useGetMeasurementByIdQuery
} from '../features/api/measurement.api';
import {
  setMeasurementData,
  setCurrentStep,
  completeStep,
  setMeasurementProfileId
} from '../features/CustomizationSlice';
import MeasurementCard from '../components/MeasurementCard';
import Loader from '../components/Loader';

export default function Step3Measurements() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = useSelector((state) => state.auth.user);
  const measurementProfileId = authUser?.measurementProfileId;

  const {
    data: userResp,
    isLoading: userLoading
  } = useGetCurrentUserQuery();

  const {
    data: measurementResp,
    isLoading: measurementLoading
  } = useGetMeasurementByIdQuery(measurementProfileId, {
    skip: !measurementProfileId
  });

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [formData, setFormData] = useState({
    height: '',
    chest: '',
    waist: '',
    sleeve: '',
    neck: ''
  });

  // Preload form from measurement profile
  useEffect(() => {
    if (measurementResp?.data?._id) {
      const data = measurementResp.data;
      setSelectedProfileId(data._id);
      setFormData({
        height: data.height || '',
        chest: data.chest || '',
        waist: data.waist || '',
        sleeve: data.sleeve || '',
        neck: data.neck || ''
      });
    }
  }, [measurementResp]);

  // If selecting other profile from UI
  useEffect(() => {
    if (selectedProfileId && userResp?.data?.measurementProfiles?.length) {
      const selected = userResp.data.measurementProfiles.find(
        (p) => p._id === selectedProfileId
      );
      if (selected) {
        setFormData({
          height: selected.height || '',
          chest: selected.chest || '',
          waist: selected.waist || '',
          sleeve: selected.sleeve || '',
          neck: selected.neck || ''
        });
      }
    }
  }, [selectedProfileId, userResp]);

  if (userLoading || measurementLoading) return <Loader fullScreen />;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    // Submit updated data
    dispatch(setMeasurementData({ ...formData, _id: selectedProfileId }));
    dispatch(setMeasurementProfileId(selectedProfileId));
    dispatch(completeStep(3));
    dispatch(setCurrentStep(4));
    navigate('/customize/step4');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        Step 3: Select or Update Your Measurements
      </h2>

      {/* Profile Selection */}
      <div className="space-y-4 mb-8">
        <p className="font-medium text-gray-700">Select a saved profile:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userResp?.data?.measurementProfiles?.map((profile) => (
            <label
              key={profile._id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                selectedProfileId === profile._id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input
                type="radio"
                name="measurementProfile"
                value={profile._id}
                checked={selectedProfileId === profile._id}
                onChange={() => setSelectedProfileId(profile._id)}
                className="hidden"
              />
              <MeasurementCard data={profile} />
            </label>
          ))}
        </div>
      </div>

      {/* Form Section */}
      <div className="mb-6 border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Edit or Add Measurements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['height', 'chest', 'waist', 'sleeve', 'neck'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field}
              </label>
              <input
                type="number"
                name={field}
                value={formData[field]}
                onChange={handleFormChange}
                placeholder={`Enter ${field}`}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate('/customize/step2')}
          className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Continue to Step 4
        </button>
      </div>
    </div>
  );
}
