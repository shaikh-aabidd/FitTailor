import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1,
  completedSteps: [],
  garment: '',           // Step 1
  designChoices: {       // Step 2
    collar: '',
    sleeves: '',
  },
  fabric: '',
  measurementData: [],   // Full measurement object if newly created
  measurementProfileId: null, // ✅ ID if existing profile is selected
  selectedTailorId: '',
  addOns: {
    monogramming: false,
    giftWrapping: false,
    expressDelivery: false,
    careKit: false,
  },
  tailorInfo: {}, //
  newProductId:null
};

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    setGarment: (state, action) => {
      state.garment = action.payload;
    },
    setDesignChoices: (state, action) => {
      state.designChoices = action.payload;
    },
    setFabric: (state, action) => {
      state.fabric = action.payload;
    },
    completeStep: (state, action) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setMeasurementData: (state, action) => {
      state.measurementData = action.payload;
    },
    setMeasurementProfileId: (state, action) => {
      state.measurementProfileId = action.payload;
    },
    setSelectedTailorId: (state, action) => {
      state.selectedTailorId = action.payload;
    },
    setAddOns: (state, action) => {
      state.addOns = action.payload;
    },
    setTailorInfo: (state, action) => {
      state.tailorInfo = action.payload;
    },    
    setNewProductId:(state,action) => {
      state.newProductId = action.payload;
    }
  },
});

export const {
  setGarment,
  setDesignChoices,
  setFabric,
  completeStep,
  setCurrentStep,
  setMeasurementData,
  setMeasurementProfileId,
  setSelectedTailorId,
  setAddOns,
  setTailorInfo,
  setNewProductId
} = customizationSlice.actions;

export default customizationSlice.reducer;
