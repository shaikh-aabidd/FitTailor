import { useDispatch, useSelector } from 'react-redux';
import {
  setDesignChoices,
  setFabric,
  completeStep,
  setCurrentStep,
  setNewProductId,
} from '../features/CustomizationSlice';
import { data, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCreateCustomProductMutation, useGetAllProductsQuery, useGetProductByIdQuery } from '../features/api/product.api';
import { toast } from 'react-toastify'

const collarOptions = [
  { label: 'Classic', value: 'classic', image: '/images/classicCollar.png' },
  { label: 'Mandarin', value: 'mandarin', image: '/images/mandarinCollar2.webp' },
  { label: 'Spread', value: 'spread', image: '/images/spreadCollar.webp' }
];

const sleeveOptions = [
  { label: 'Short', value: 'short', image: '/images/halfSeleeves.png' },
  { label: 'Long', value: 'long', image: '/images/fullSeleeves.png' }
];

const fabricChoices = ['cotton', 'silk', 'linen'];

export default function Step2StyleFabric() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { designChoices, fabric } = useSelector((state) => state.customization);
  const [createCustomProduct, { isLoading: isCreating }] = useCreateCustomProductMutation();

  const [collar, setCollar] = useState(designChoices.collar);
  const [sleeves, setSleeves] = useState(designChoices.sleeves);
  const [selectedFabric, setSelectedFabric] = useState(fabric);
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  const { data: fabricOptions = [], isLoading } = useGetAllProductsQuery({
    category: 'unstiched',
    fabricType: selectedFabrics,
    limit: 12,
    page: 1
  });

  // console.log("DATA",fabricOptions)
  console.log("Selected fabrics",selectedFabric)

  const { data: fab } = useGetProductByIdQuery(selectedFabric, { skip: !selectedFabric })

  console.log("Selected fabrics",fab)

  // helper: price = fabric.price + 300 (collar) + 300 (sleeves)
  const calculatePrice = () => {
    if (!fab) return 0
    return fab.data?.price + 300 + 300
  }

  const handleNext = async () => {
    if (!collar || !sleeves || !selectedFabric)
      return alert('Please complete all fields');
    const price =  calculatePrice()
    const payload = {
      fabricId: fab.data?.fabricType,
      collarStyle: collar,
      sleeveStyle: sleeves,           // or get from your slice
      price,           // or calculate based on add-ons
    }

    try {
      const result = await createCustomProduct(payload).unwrap()
      // store the new productId in Redux
      dispatch(setNewProductId(result.data?._id))

      // mark step done & go to measurements
      dispatch(completeStep(2))
      dispatch(setCurrentStep(3))
      dispatch(setDesignChoices({ collar, sleeves }));
      dispatch(setFabric(selectedFabric));
      navigate('/customize/step3');
    } catch (err) {
      console.error('failed to create custom product', err)
      toast.error(err.data?.message || 'Could not create custom product')
    }
  };

  const handleFabricCheckboxChange = (e) => {
    const value = e.target.value;
    setSelectedFabrics((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const renderSelectionGrid = (options, selected, setSelected, label) => (
    <div className="text-center">
      <h3 className="font-medium mb-4 text-lg">{label}</h3>
      <div className="flex justify-center flex-wrap gap-6">
        {options.map((option) => (
          <div
            key={option.value}
            className={`cursor-pointer border-2 rounded-xl p-2 w-40 h-52 flex flex-col items-center justify-center transition-all duration-200 ${
              selected === option.value ? 'border-blue-600 shadow-lg' : 'border-gray-300'
            }`}
            onClick={() => setSelected(option.value)}
          >
            <img
              src={option.image}
              alt={option.label}
              className="w-28 h-28 object-cover rounded-md"
            />
            <p className="text-center mt-2 font-semibold">{option.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // if(isLoading || isCreating){
  //   return <Loader />
  // }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Step 2: Pick Your Style & Fabric</h2>

      <div className="space-y-6">
        {renderSelectionGrid(collarOptions, collar, setCollar, 'Collar Style')}
        {renderSelectionGrid(sleeveOptions, sleeves, setSleeves, 'Sleeves')}

        {/* Fabric Type Checkboxes */}
        <div>
          <h3 className="font-medium mb-2">Filter by Fabric Type</h3>
          <div className="flex gap-4 flex-wrap">
            {fabricChoices.map((fabric) => (
              <label key={fabric} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={fabric}
                  checked={selectedFabrics.includes(fabric)}
                  onChange={handleFabricCheckboxChange}
                  className="accent-blue-600"
                />
                <span className="capitalize">{fabric}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fabric Selection Grid */}
        <div>
          <h3 className="font-medium mb-2">Select Fabric</h3>
          {isLoading ? (
            <p>Loading fabrics...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fabricOptions?.docs?.map((fab) => (
                <div
                  key={fab._id}
                  className={`cursor-pointer border-2 rounded-lg p-2 ${
                    selectedFabric === fab._id ? 'border-blue-600 shadow-md' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedFabric(fab._id)}
                >
                  <img
                    src={fab.images?.[0]}
                    alt={fab.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="mt-2 text-center font-medium">{fab.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md"
          onClick={handleNext}
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
}
