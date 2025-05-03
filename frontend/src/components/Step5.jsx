import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTailorByIdQuery } from '../features/api/tailor.api';
import {
  setAddOns,
  completeStep,
  setCurrentStep,
  setTailorInfo,
  setFabric,
} from '../features/CustomizationSlice';
import { useNavigate } from 'react-router-dom';
import { useGetProductByIdQuery } from '../features/api/product.api';


const Step5ReviewAddOns = () => {
    const navigate = useNavigate();

    

  const dispatch = useDispatch();
  const {
    garment,
    designChoices,
    fabric,
    measurementData,
    selectedTailorId,
    addOns,
  } = useSelector((state) => state.customization);

  const {data,isError,isLoading} = useGetProductByIdQuery(fabric);
  // console.log(data.data.name)

  const [localAddOns, setLocalAddOns] = useState(addOns);

  const { data: tailor } = useGetTailorByIdQuery(selectedTailorId, {
    skip: !selectedTailorId,
  });

  console.log(tailor) 

  useEffect(() => {
    if (tailor) {
      dispatch(setTailorInfo(tailor));
    }
  }, [tailor, dispatch]);

  const handleToggleAddOn = (key) => {
    const updated = { ...localAddOns, [key]: !localAddOns[key] };
    setLocalAddOns(updated);
  };

  const handleNext = () => {
    
    dispatch(setFabric(data?.data?.name))
    dispatch(setTailorInfo({name:tailor?.data?.user?.name}))
    dispatch(setAddOns(localAddOns));
    dispatch(completeStep(5));
    dispatch(setCurrentStep(6));
    navigate('/checkout');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review Your Customization</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summary Left */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Summary</h3>
          <p><strong>Garment:</strong> {garment}</p>
          <p><strong>Collar:</strong> {designChoices?.collar}</p>
          <p><strong>Sleeves:</strong> {designChoices?.sleeves}</p>
          <p><strong>Fabric:</strong> {data?.data?.name}</p>
          <p><strong>Measurements:</strong> {measurementData?.chest} in chest, {measurementData?.waist} in waist</p>
          {tailor && (
            <>
              <p><strong>Tailor:</strong> {tailor?.data?.user?.name}</p>
              <p><strong>Rating:</strong> {tailor?.data?.rating}/5</p>
              <p><strong>Availability:</strong> {tailor?.data.availability && "True"}</p>
            </>
          )}
        </div>

        {/* Add‑Ons Right */}
        <div className="space-y-3 bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Add‑On Services</h3>
          {['monogramming', 'giftWrapping', 'expressDelivery', 'careKit'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localAddOns[item]}
                onChange={() => handleToggleAddOn(item)}
                className="w-4 h-4"
              />
              <label className="capitalize">{item.replace(/([A-Z])/g, ' $1')}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Next: Checkout
        </button>
      </div>
    </div>
  );
};

export default Step5ReviewAddOns;
