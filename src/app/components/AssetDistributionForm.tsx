"use client";
import React, { useState, useContext, useEffect } from "react";
import { FormContext,Asset } from "../context/FormContext";
import "./AssetDistribution.css";

interface NomineeAsset extends Asset {
  _tempId?: string;
}

const AssetDistributionForm: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const formContext = useContext(FormContext);

  if (!formContext) {
    return <p>Error: Form context is not available.</p>;
  }

  const { assets, setAssets, nominees } = formContext;
  

  const [nomineesList, setNomineesList] = useState<NomineeAsset[]>(() => {
    if (assets && assets.length > 0) {
      return assets.map(asset => ({
        ...asset,
        _tempId: Math.random().toString(36).substring(2, 9)
      }));
    }
    
 
    return [{
      nomineeName: "",
      relation: "",
      bequeathShare: 0,
      _tempId: Math.random().toString(36).substring(2, 9)
    }];
  });


  const [errors, setErrors] = useState<{
    totalShare?: string;
    duplicateNominees?: string;
  }>({});

 
  const totalSharePercentage = nomineesList.reduce(
    (sum, nominee) => sum + nominee.bequeathShare, 
    0
  );

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

 
  useEffect(() => {
   
    const assetsToSave = nomineesList.map(({ _tempId, ...rest }) => rest);
    setAssets(assetsToSave);
  }, [nomineesList, setAssets]);
  

 
  useEffect(() => {
    const newErrors: {
      totalShare?: string;
      duplicateNominees?: string;
    } = {};
    
   
    if (totalSharePercentage > 100) {
      newErrors.totalShare = "Total bequeath share cannot exceed 100%";
    }
    
   
    const nomineeNames = nomineesList.map(n => n.nomineeName).filter(name => name !== "");
    const hasDuplicates = new Set(nomineeNames).size !== nomineeNames.length;
    if (hasDuplicates) {
      newErrors.duplicateNominees = "Each nominee can only be selected once";
    }
    
    setErrors(newErrors);
  }, [nomineesList, totalSharePercentage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, tempId: string) => {
    const { name, value } = e.target;
    
    if (name === "nomineeName") {
    
      const isAlreadySelected = nomineesList.some(
        nominee => nominee.nomineeName === value && nominee._tempId !== tempId
      );
      
      if (isAlreadySelected && value !== "") {
        setErrors(prev => ({
          ...prev,
          duplicateNominees: "This nominee is already selected"
        }));
        return;
      }
    }
    
    if (name === "bequeathShare") {
      
      const shareValue = Number(value);
      if (shareValue > 100) {
        return;
      }
      
      
      const otherShares = nomineesList
        .filter(nominee => nominee._tempId !== tempId)
        .reduce((sum, nominee) => sum + nominee.bequeathShare, 0);
        
      if (otherShares + shareValue > 100) {
        setErrors(prev => ({
          ...prev,
          totalShare: "Total bequeath share cannot exceed 100%"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          totalShare: undefined
        }));
      }
    }
    
    setNomineesList(prevList => 
      prevList.map(nominee => 
        nominee._tempId === tempId 
          ? { 
              ...nominee, 
              [name]: name === "bequeathShare" ? Number(value) : value,
            
              ...(name === "nomineeName" && {
                relation: nominees.find(n => n.name === value)?.relation || ""
              })
            } 
          : nominee
      )
    );
  };

  const handleAddNominee = () => {
     
    const availableNominees = nominees.filter(n => 
      !nomineesList.some(nominee => nominee.nomineeName === n.name)
    );
  
    if (availableNominees.length === 0) {
      alert("No more nominees available to assign.");
      return;
    }
    
    const newNominee: NomineeAsset = {
      nomineeName: "",
      relation: "",
      bequeathShare: 0,
      _tempId: generateId(),
    };
    
    setNomineesList(prev => [newNominee, ...prev]);
  };



  const handleRemoveNominee = (tempId: string) => {
    setNomineesList(prev => prev.filter(nominee => nominee._tempId !== tempId));
  };

  const getAvailableNominees = (currentNomineeId: string) => {
    const selectedNominees = new Set(
      nomineesList
        .filter(n => n._tempId !== currentNomineeId && n.nomineeName !== "")
        .map(n => n.nomineeName)
    );
    
    return nominees.filter(n => !selectedNominees.has(n.name));
  };

  const handleNextClick = () => {
    
    if (Object.keys(errors).length > 0) {
      return; 
    }
    
    
    if (totalSharePercentage < 100 && totalSharePercentage > 0) {
      if (window.confirm(`Total bequeath share is only ${totalSharePercentage}%. Do you want to continue?`)) {
        onNext();
      }
    } else if (totalSharePercentage === 0) {
      if (window.confirm("No assets have been distributed. Do you want to continue?")) {
        onNext();
      }
    } else {
      onNext();
    }
  };

  useEffect(() => {
    if (nominees && nominees.length > 0) {
      
      const validNomineeNames = new Set(nominees.map(n => n.name));
      
      
      setNomineesList(prevList => 
        prevList.filter(asset => 
          asset.nomineeName === "" || validNomineeNames.has(asset.nomineeName)
        )
      );
    }
  }, [nominees]);

  return (
    <div className="asset-distribution-container">
      <h1 className="asset-distribution-heading">Asset Distribution</h1>
     
      <div className="asset-tabs">
        <div className="asset-tab active">Deposits</div>
      </div>
      
      <h2 className="deposits-heading">Deposits</h2>
      
    
      <div className="total-share-indicator">
        <div className="total-share-label">
          Total Bequeath Share: <span className={totalSharePercentage > 100 ? "error" : ""}>{totalSharePercentage}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${Math.min(totalSharePercentage, 100)}%`,
              backgroundColor: totalSharePercentage > 100 ? '#ff4d4d' : '#4CAF50'
            }}
          ></div>
        </div>
      </div>
      
      
      {Object.values(errors).map((error, index) => (
        <div key={index} className="error-message">
          {error}
        </div>
      ))}
      
      <div className="add-nominee-button" onClick={handleAddNominee}>
        <span className="add-icon">+</span> Add Nominee
      </div>
      
      {nomineesList.map((nominee, index) => (
        <div className="nominee-card" key={nominee._tempId}>
          <div className="nominee-card-header">
            <h3>Nominee {index + 1}</h3>
            <button 
              className="remove-button" 
              onClick={() => handleRemoveNominee(nominee._tempId!)}
              disabled={nomineesList.length <= 1}
            >
              <span className="remove-icon">✕</span>
            </button>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nominee Name</label>
              <select 
                className="form-control"
                name="nomineeName" 
                value={nominee.nomineeName} 
                onChange={(e) => handleChange(e, nominee._tempId!)}
              >
                <option value="">Select Nominee</option>
                {getAvailableNominees(nominee._tempId!).map((n, idx) => (
                  <option key={idx} value={n.name}>
                    {n.name}
                  </option>
                ))}
                
                {nominee.nomineeName && !getAvailableNominees(nominee._tempId!).some(n => n.name === nominee.nomineeName) && (
                  <option value={nominee.nomineeName}>{nominee.nomineeName}</option>
                )}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Relation</label>
              <input 
                type="text" 
                className="form-control"
                name="relation" 
                value={nominee.relation} 
                readOnly
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Bequeath Share
                <span className="info-icon" title="Percentage of assets to be distributed to this nominee">ⓘ</span>
              </label>
              <input 
                type="number" 
                className="form-control"
                name="bequeathShare" 
                value={nominee.bequeathShare} 
                onChange={(e) => handleChange(e, nominee._tempId!)} 
                min="0" 
                max="100" 
              />
            </div>
          </div>
        </div>
      ))}

      <div className="navigation-buttons">
        <button className="prev-button" onClick={onPrev}>
          Previous
        </button>
        <button 
          className="next-button" 
          onClick={handleNextClick}
          disabled={Object.keys(errors).length > 0}
        >
          Next 
        </button>
      </div>
    </div>
  );
};

export default AssetDistributionForm;