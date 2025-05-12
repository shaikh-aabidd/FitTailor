import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetCurrentUserQuery
} from '../features/api/user.api';
import {
  useGetMeasurementByIdQuery,
  useAddMeasurementMutation
} from '../features/api/measurement.api';
import {
  setCurrentStep,
  completeStep,
  setMeasurementProfileId
} from '../features/CustomizationSlice';
import MeasurementCard from '../components/MeasurementCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Button from './Button';

export default function Step3Measurements() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = useSelector((state) => state.auth.user);
  const customization = useSelector((state) => state.customization);
  const measurementProfileId = customization?.measurementProfileId;

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

  const [addMeasurement, { isLoading: isSaving }] = useAddMeasurementMutation();

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [initialFormData, setInitialFormData] = useState({});
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
      dispatch(setMeasurementProfileId(data._id))
      const measurements = {
        height: data.height || '',
        chest: data.chest || '',
        waist: data.waist || '',
        sleeve: data.sleeve || '',
        neck: data.neck || ''
      };
      setFormData(measurements);
      setInitialFormData(measurements);
    }
  }, [measurementResp]);

  // If selecting other profile from UI
  useEffect(() => {
    if (selectedProfileId && userResp?.data?.measurementProfiles?.length) {
      const selected = userResp.data.measurementProfiles.find(
        (p) => p._id === selectedProfileId
      );
      if (selected) {
        const measurements = {
          height: selected.height || '',
          chest: selected.chest || '',
          waist: selected.waist || '',
          sleeve: selected.sleeve || '',
          neck: selected.neck || ''
        };
        setFormData(measurements);
        setInitialFormData(measurements);
      }
    }
  }, [selectedProfileId, userResp]);

  if (userLoading || measurementLoading || isSaving) return <Loader fullScreen />;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if measurements have been modified
  const isMeasurementModified = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const handleContinue = async () => {
    try {
      let finalMeasurementId = selectedProfileId;
      
      // If values are modified or no profile is selected, create a new measurement
      if (isMeasurementModified() || !selectedProfileId) {
        // Generate a name based on the garment being customized
        const garmentType = customization.garment +" "+ customization.fabric || 'Garment';
        const measurementName = `Custom ${garmentType} Measurement`;
        
        // Create new measurement
        const response = await addMeasurement({
          profileName: measurementName,
          ...formData
        }).unwrap();
        
        // Use the newly created measurement ID
        finalMeasurementId = response.data._id;
        
        toast.success('New measurement profile created');
      }
      
      // Only set the ID, not the full measurement data
      dispatch(setMeasurementProfileId(finalMeasurementId));
      dispatch(completeStep(3));
      dispatch(setCurrentStep(4));
      navigate('/customize/step4');
    } catch (error) {
      toast.error('Failed to save measurement: ' + (error.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
       <Link to="/customize/step2"><Button className="mb-1"> ← Previous step</Button></Link>
            <Link to="/customize"><Button className="mb-3 ml-2"> : Steps Page</Button></Link>
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
        
        {isMeasurementModified() && selectedProfileId && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              You've modified the selected measurement. A new custom measurement profile will be created.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate('/customize/step2')}
          className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
          disabled={isSaving}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Continue to Step 4'}
        </button>
      </div>
    </div>
  );
}