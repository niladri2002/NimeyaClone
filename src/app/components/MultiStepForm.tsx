"use client";
import React, { useState } from "react";
import PersonalDetailsForm from "./PersonalDetailsForm";
import NomineeDetailsForm from "./NomineeDetailsForm";
import AssetDistributionForm from "./AssetDistributionForm";
import PreviewPage from "./preview";
import Home from "./Home";

const MultiStepForm = () => {
  const [step, setStep] = useState(0); 

  const nextStep = () => setStep((prev) => (prev + 1)%5);
  const prevStep = () => setStep((prev) => (prev - 1)%5);
  console.log("Step:",step);

  return (
    <div>
      {step === 0 && <Home onNext={nextStep} />}
      {step === 1 && <PersonalDetailsForm onNext={nextStep} />}
      {step === 2 && <NomineeDetailsForm onNext={nextStep} onPrev={prevStep} />}
      {step === 3 && <AssetDistributionForm onNext={nextStep} onPrev={prevStep} />}
      {step === 4 && <PreviewPage onPrev={prevStep} onNext={nextStep}/>}
    </div>
  );
};

export default MultiStepForm;
