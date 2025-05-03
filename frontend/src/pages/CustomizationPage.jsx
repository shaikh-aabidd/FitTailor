import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Choose Your Garment', path: '/customize/step1' },
  { id: 2, title: 'Pick Your Style & Fabric', path: '/customize/step2' },
  { id: 3, title: 'Measurements', path: '/customize/step3' },
  { id: 4, title: 'Tailor Selection', path: '/customize/step4' },
  { id: 5, title: 'Review & Add‑Ons', path: '/customize/step5' },
  { id: 6, title: 'Checkout', path: '/customize/step6' },
];

export default function CustomizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const isAtIndex = location.pathname === '/customize';

  const startWizard = () => {
    setCurrentStep(1);
    navigate(steps[0].path);
  };

  const goToStep = (stepId) => {
    if (stepId <= currentStep && stepId > 0) {
      setCurrentStep(stepId);
      const step = steps.find(s => s.id === stepId);
      navigate(step.path);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {isAtIndex && (
        <>
          {/* Hero Section */}
          <section className="relative w-full h-96 flex flex-col justify-center items-center text-center mb-10 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/images/customizeBanner4.png')",
  }}
>
           
            <button
              onClick={startWizard}
              className="absolute bottom-8 right-8 p-2 bg-transparent border-2 border-white text-2xl font-extrabold text-white 
               hover:text-black hover:bg-green-50 transition duration-700"
            > 
              Start Customizing
            </button>
          </section>

          {/* Steps Tracker */}
          <div className="space-y-4">
            {steps.map((step) => {
              const completed = step.id < currentStep;
              const active = step.id === currentStep;
              return (
                <div
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center justify-between p-4 w-full cursor-pointer
                    ${completed
                      ? 'bg-green-100 text-green-800'
                      : active
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-500'}`}
                >
                  <span className="font-medium">
                    Step {step.id}: {step.title}
                  </span>
                  <span className="text-sm uppercase">{completed || active ? '✔' : ''}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 
        Always render the nested route here.
        On `/customize` (index), Outlet is empty.
        On `/customize/step1`, it will render <Step1Garment />, etc.
      */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}