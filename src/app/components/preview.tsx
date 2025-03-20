"use client";
import React, { useContext } from "react";
import { FormContext } from "../context/FormContext"; 
import "./PreviewPage.css"; 

interface PreviewPageProps {
  onPrev: () => void;
  onNext: () => void;
}

export default function PreviewPage({ onPrev, onNext }: PreviewPageProps) {
  const formContext = useContext(FormContext)!;
  const { personalDetails, nominees, assets, setPersonalDetails, setNominees, setAssets } = formContext;
  
  const handleConfirmSubmit = () => {
    console.log("Final Form Submission:");
    console.log("Personal Details:", personalDetails);
    console.log("Nominee Details:", nominees);
    console.log("Asset Distribution:", assets);
    
    setPersonalDetails({} as any);
    setNominees([]);
    setAssets([]);
    
    alert("Form submitted successfully!"); 
    onNext();
  };
  
  return (
    <div className="preview-container">
      <h2 className="preview-title">Preview Your Details</h2>
      <p className="preview-subtitle">Review your information before final submission</p>
      
      <div className="section-container">
        <h3 className="section-title">Personal Details</h3>
        <div className="detail-table">
          <div className="detail-row">
            <div className="detail-label">Full Name</div>
            <div className="detail-value">{personalDetails.name}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Date of Birth</div>
            <div className="detail-value">{personalDetails.dob}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Age</div>
            <div className="detail-value">{personalDetails.age} years</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Gender</div>
            <div className="detail-value">{personalDetails.gender}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Marital Status</div>
            <div className="detail-value">{personalDetails.maritalStatus}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Nationality</div>
            <div className="detail-value">{personalDetails.nationality}</div>
          </div>
        </div>
      </div>
  
      <div className="section-container">
        <h3 className="section-title">Nominee Details</h3>
        {nominees.length > 0 ? (
          nominees.map((nominee, index) => (
            <div key={index} className="nominee-card">
              <div className="nominee-title">
                Nominee {index + 1}: {nominee.name}
                <span className="relation-tag">{nominee.relation}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">No nominees have been added yet.</div>
        )}
      </div>
  
      <div className="section-container">
        <h3 className="section-title">Asset Distribution</h3>
        {assets.filter(asset => asset.nomineeName).length > 0 ? (
  assets.filter(asset => asset.nomineeName).map((asset, index) => (
    <div key={index} className="asset-card">
      <div className="asset-title">
        Distribution {index + 1}
      </div>
      <div className="detail-row">
        <div className="detail-label">Nominee</div>
        <div className="detail-value">
          {asset.nomineeName}
          {asset.relation && <span className="relation-tag">{asset.relation}</span>}
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Allocation</div>
        <div className="detail-value">
          <span className="percentage-value">{asset.bequeathShare}%</span> of total assets
        </div>
      </div>
    </div>
  ))
) : (
  <div className="empty-message">No asset distributions have been defined yet.</div>
)}
      </div>
  
      <div className="button-container">
        <button
          className="button-prev"
          onClick={onPrev}
        >
          Previous Page
        </button>
        <button
          className="button-submit"
          onClick={handleConfirmSubmit}
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}