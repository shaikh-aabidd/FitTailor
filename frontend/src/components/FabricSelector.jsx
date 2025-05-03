import { useEffect, useState } from 'react';
import { useGetAllProductsQuery } from "../features/api/product.api";

const fabricChoices = ['cotton', 'silk', 'linen'];

export default function FabricSelector() {
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  
  const { data: fabricOptions = [], isLoading } = useGetAllProductsQuery({
    category: 'unstitched',
    fabricType: selectedFabrics,
    limit: 12,
    page: 1
  });

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setSelectedFabrics(prev => 
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    );
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2">Select Fabric Types</h3>
      <div className="flex gap-4 mb-4">
        {fabricChoices.map((fabric) => (
          <label key={fabric} className="flex items-center space-x-2">
            <input
              type="checkbox"
              value={fabric}
              checked={selectedFabrics.includes(fabric)}
              onChange={handleCheckboxChange}
              className="accent-blue-600"
            />
            <span className="capitalize">{fabric}</span>
          </label>
        ))}
      </div>

      {isLoading ? (
        <p>Loading fabrics...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fabricOptions?.docs?.map((fabric) => (
            <div key={fabric._id} className="border p-4 rounded shadow">
              <img src={fabric.images?.[0]} alt={fabric.name} className="h-40 w-full object-cover mb-2" />
              <h4 className="font-medium">{fabric.name}</h4>
              <p className="text-gray-600">₹{fabric.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
