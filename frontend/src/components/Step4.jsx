import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllTailorsQuery } from '../features/api/tailor.api';
import {
  setSelectedTailorId,
  completeStep,
  setCurrentStep,
} from '../features/CustomizationSlice';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';

const Step4Tailor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedTailorId } = useSelector((state) => state.customization);
  const { data: tailors = [], isLoading } = useGetAllTailorsQuery();
  const [autoAssign, setAutoAssign] = useState(false);

  const handleSelect = (id) => {
    dispatch(setSelectedTailorId(id));
    dispatch(completeStep(4));
    dispatch(setCurrentStep(5));
    navigate('/customize/step5'); // 👈 Route navigation
  };

  const handleAutoAssignToggle = () => {
    const newValue = !autoAssign;
    setAutoAssign(newValue);
  
    if (newValue && tailors?.data?.docs?.length > 0) {
      const bestTailor = [...tailors.data.docs].sort((a, b) => b.rating - a.rating)[0];
      if (bestTailor) {
        dispatch(setSelectedTailorId(bestTailor._id));
        dispatch(completeStep(4));
        dispatch(setCurrentStep(5));
        navigate('/customize/step5'); // ✅ Navigates now
      }
    }
  };
  useEffect(() => {
    if (autoAssign && tailors.length > 0 && !selectedTailorId) {
      const bestTailor = [...tailors].sort((a, b) => b.rating - a.rating)[0];
      if (bestTailor) {
        handleSelect(bestTailor._id);
      }
    }
  }, [autoAssign, tailors]);

  if (isLoading) return <div>Loading tailors...</div>;

  return (
    <div className="space-y-4">
      <Link to="/customize/step3"><Button className="mb-1"> ← Previous step</Button></Link>
                  <Link to="/customize"><Button className="mb-3 ml-2"> : Steps Page</Button></Link>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoAssign"
          checked={autoAssign}
          onChange={handleAutoAssignToggle}
          className="w-4 h-4"
        />
        <label htmlFor="autoAssign" className="text-sm font-medium">
          Auto‑assign Best Fit Tailor
        </label>
      </div>

      {!autoAssign && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tailors?.data?.docs?.map((tailor) => (
            <div
              key={tailor._id}
              onClick={() => handleSelect(tailor._id)}
              className={`border rounded p-4 cursor-pointer transition ${
                selectedTailorId === tailor._id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
              }`}
            >
              <h3 className="text-lg font-semibold">{tailor.name}</h3>
              <p>Rating: {tailor.rating}/5</p>
              <p>Turnaround: {tailor.avgTurnaroundTime} days</p>
              <p>Price: 800$</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step4Tailor;
