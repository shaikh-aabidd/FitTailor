
// components/customization/Step1Garment.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setGarment,
  completeStep,
  setCurrentStep,
} from '../features/CustomizationSlice';

const garments = [
  { id: 'shirt', label: 'Shirt', imageUrl: '/images/shirt3.jpg' },
  { id: 'suit', label: 'Suit', imageUrl: '/images/suit2.jpg' },
  { id: 'jacket', label: 'Jacket', imageUrl: '/images/jacket.jpg' },
  { id: 'pants', label: 'Pants', imageUrl: '/images/pant2.webp' },
];

export default function Step1Garment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selected = useSelector((state) => state.customization.garment);

  const handleSelect = (id) => {
    dispatch(setGarment(id));
    dispatch(completeStep(1));
    dispatch(setCurrentStep(2));
    navigate('/customize/step2'); // Step 2 route
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Step 1: Choose Your Garment</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 ">
        {garments.map((g) => {
          const isSelected = selected === g.id;
          return (
            <div
              key={g.id}
              onClick={() => handleSelect(g.id)}
              className={
                `className='flex justify-end align-bottom' relative bg-cover bg-center h-96 cursor-pointer border-2 p-4 flex flex-col items-center transition ` +
                (isSelected
                  ? 'border-green-600 shadow-lg shadow-green-700'
                  : 'border-gray-300')
              }
              style={{ backgroundImage: `url(${g.imageUrl})` }} 
            >
              <div className='text-white text-lg'>{g.label}</div>

            </div>
          
          );
        })}
      </div>
    </div>
  );
}
