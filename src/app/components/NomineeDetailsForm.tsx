"use client";
import { useContext, useState } from "react";
import { FormContext, Nominee } from "../context/FormContext"; 
import * as Yup from "yup";
import "./NomineeDetails.css";

interface NomineeDetailsFormProps {
  onNext: () => void;
  onPrev: () => void;
}



type NomineeSchemaFields = "relation" | "title" | "name" | "dob" | "gender" | "idType" | "idNumber";

const nomineeSchema = Yup.object().shape({
  relation: Yup.string().required("Relation is required"),
  title: Yup.string().required("Title is required"),
  name: Yup.string().required("Name is required"),
  dob: Yup.string()
     .required("Date of Birth is required")
     .test("dob", "Date of Birth cannot be today or in the future", (value) => {
       if (!value) return false;
       const selectedDate = new Date(value);
       const today = new Date();
       today.setHours(0, 0, 0, 0); 
       return selectedDate < today;
     }),
  gender: Yup.string().required("Gender is required"),
idType: Yup.string().required("ID Type is required"),
  idNumber: Yup.string()
    .when("idType", {
      is: "Aadhar",
      then: (schema) =>
        schema
          .matches(/^\d{12}$/, "Aadhar must be a 12-digit number")
          .required("Aadhar Number is required"),
    })
    .when("idType", {
      is: "PAN",
      then: (schema) =>
        schema
          .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
          .required("PAN Number is required"),
    })
    .when("idType", {
      is: "Passport",
      then: (schema) =>
        schema
          .matches(/^[A-Z]{1}[0-9]{7}$/, "Invalid Passport format (e.g., A1234567)")
          .required("Passport Number is required"),
    })
});

const NomineeDetailsForm: React.FC<NomineeDetailsFormProps> = ({ onNext, onPrev }) => {
  const formContext = useContext(FormContext);
  
  if (!formContext) {
    throw new Error("NomineeDetailsForm must be used within a FormProvider");
  }
  
  const { nominees, setNominees, assets  } = formContext;
  const [showForm, setShowForm] = useState(false);
  const [currentNomineeIndex, setCurrentNomineeIndex] = useState<number | null>(null);
  
  const [newNominee, setNewNominee] = useState<Nominee>({
    relation: "",
    title: "",
    name: "",
    dob: "",
    age: "",
    gender: "",
    maritalStatus: "",
    religion: "",
    occupation: "",
    residentialStatus: "",
    nationality: "",
    address: "",
    idType: "",
    idNumber: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = async () => {
    if (nominees.length === 0) {
      setErrors({ general: "Please add at least one nominee" });
      return;
    }

    try {
      await Promise.all(nominees.map(nominee => nomineeSchema.validate(nominee, { abortEarly: false })));
      onNext();
    } catch (err) {
      setErrors({ general: "Please ensure all nominees have complete information" });
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };
                            
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "dob") {
      setNewNominee({ ...newNominee, [name]: value, age: calculateAge(value) });
    } else {
      setNewNominee({ ...newNominee, [name]: value });
    }
    
    validateField(name as NomineeSchemaFields, value);
  };

  const validateField = async (name: NomineeSchemaFields, value: any) => {
    try {
      if (!(name in nomineeSchema.fields)) {
        return;
      }
      
      const fieldSchema = Yup.object().shape({
        [name]: nomineeSchema.fields[name]
      });
      
      await fieldSchema.validate({ [name]: value }, { abortEarly: false });
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach(error => {
          if (error.path) {
            setErrors(prev => ({
              ...prev,
              [error.path!]: error.message
            }));
          }
        });
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    validateField(name as NomineeSchemaFields, newNominee[name as keyof Nominee]);
  };

  const handleAddNominee = async () => {
    try {
      await nomineeSchema.validate(newNominee, { abortEarly: false });
      
      let updatedNominees = [...nominees];
      
      if (currentNomineeIndex !== null) {
        updatedNominees[currentNomineeIndex] = newNominee;
      } else {
        updatedNominees = [...updatedNominees, newNominee];
      }  
      setNominees(updatedNominees);
      
      setNewNominee({
        relation: "",
        title: "",
        name: "",
        dob: "",
        age: "",
        gender: "",
        maritalStatus: "",
        religion: "",
        occupation: "",
        residentialStatus: "",
        nationality: "",
        address: "",
        idType: "",
        idNumber: "",
      });
      setErrors({});
      setShowForm(false);
      setCurrentNomineeIndex(null);
    } catch (err) {
      const validationErrors: { [key: string]: string } = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          if (error.path) validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
    }
  };

  const handleEditNominee = (index: number) => {
    setCurrentNomineeIndex(index);
    setNewNominee(nominees[index]);
    setShowForm(true);
    setErrors({});
  };

  const checkNomineeHasAssets = (nomineeIndex: number) => {
    if (!assets || assets.length === 0) return false;
  
  
    const nomineeName = nominees[nomineeIndex]?.name;
    
    
    return assets.some(asset => 
      asset.nomineeName === nomineeName && asset.bequeathShare > 0
    );
  };

  const handleRemoveNominee = (index: number) => {
    if (checkNomineeHasAssets(index)) {

      const confirmDelete = window.confirm("This nominee has allocated assets. Do you still want to remove them?");
  if (!confirmDelete) return; 
      else{
        const updatedNominees = [...nominees];
          updatedNominees.splice(index, 1);
          setNominees(updatedNominees);
      }
      
      
    } else
     {
     
      const updatedNominees = [...nominees];
      updatedNominees.splice(index, 1);
      setNominees(updatedNominees);
    }

    
    
  };

  const handleCalendarClick = () => {
    const dateInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.type = "date"; 
      dateInput.focus();
      dateInput.click();
    }
  };

  return (
    <div className="nominee-details-container">
      <div className="nominee-header">
        <h2>Nominee Details</h2>
        
        <div className="info-icon">i</div>
       
      </div>
      <div className="step-indicator">
        <div className="step-text">Step 2 of 7: Fill up Nominee Details</div>
      </div>
      
      {!showForm ? (
        <div className="add-nominee-btn-container">
          <button className="add-nominee-btn" onClick={() => setShowForm(true)}>
            <span className="plus-icon">+</span> Add Nominee
          </button>
        </div>
      ) : (
        <div className="nominee-form">
          <div className="nominee-header-with-actions">
            <div className="nominee-title">
              <span className="user-icon">👤</span>
              <h3>Nominee {currentNomineeIndex !== null ? currentNomineeIndex + 1 : nominees.length + 1}</h3>
            </div>
            {currentNomineeIndex !== null && (
              <button className="remove-btn" onClick={() => handleRemoveNominee(currentNomineeIndex)}>
                🗑️ Remove
              </button>
            )}
          </div>
          
         
          <select 
  name="relation" 
  value={newNominee.relation} 
  onChange={(e) => {
    handleChange(e);
    
    
    const relation = e.target.value;
    let gender = "";
    
    
    if (["Daughter", "Daughter In Law", "Grandmother", "Mother", "Aunt", "Granddaughter"].includes(relation)) {
      gender = "Female";
    } else if (["Son", "Son In Law", "Grandfather", "Father", "Brother", "Uncle", "Grandson", "Nephew"].includes(relation)) {
      gender = "Male";
    }
    
    
    if (gender) {
      setNewNominee(prev => ({...prev, gender}));
   
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.gender;
        return newErrors;
      });
    }
  }}
  onBlur={handleBlur}
  className={errors.relation ? "error-input" : ""}
>
  <option value="">Select a relation</option>
  <option value="Aunt">Aunt</option>
  <option value="Brother">Brother</option>
  <option value="Cousin">Cousin</option>
  <option value="Daughter">Daughter</option>
  <option value="Daughter In Law">Daughter In Law</option>
  <option value="Father">Father</option>
  <option value="Friend">Friend</option>
  <option value="Granddaughter">Granddaughter</option>
  <option value="Grandfather">Grandfather</option>
  <option value="Grandmother">Grandmother</option>
  <option value="Grandson">Grandson</option>
  <option value="Mother">Mother</option>
  <option value="Nephew">Nephew</option>
  <option value="Son">Son</option>
  <option value="Son In Law">Son In Law</option>
  <option value="Uncle">Uncle</option>
</select>
          
          <div className="form-row">
            <div className="form-group">
              <label>Title*</label>
              <select 
                name="title" 
                value={newNominee.title} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.title ? "error-input" : ""}
              >
                <option value="">Select Title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
              </select>
              {errors.title && <p className="error-text">{errors.title}</p>}
            </div>
            
            <div className="form-group">
              <label>Name*</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter Full Name"
                value={newNominee.name} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.name ? "error-input" : ""}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth*</label>
              <div className="date-input-container">
                <input 
                  type="date" 
                  name="dob" 
                  placeholder="DD-MM-YYYY"
                  value={newNominee.dob} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.dob ? "error-input" : ""}
                />
                <span className="calendar-icon" onClick={handleCalendarClick}></span>
              </div>
              {errors.dob && <p className="error-text">{errors.dob}</p>}
            </div>
          </div>
          
          <div className="form-group">
  <label>Gender*</label>
  <div className="radio-group">
    <label className={`radio-label ${newNominee.gender === "Male" ? "selected" : ""}`}>
      <input 
        type="radio" 
        name="gender" 
        value="Male" 
        checked={newNominee.gender === "Male"} 
        onChange={handleChange}
      />
      <span>Male</span>
    </label>
    <label className={`radio-label ${newNominee.gender === "Female" ? "selected" : ""}`}>
      <input 
        type="radio" 
        name="gender" 
        value="Female" 
        checked={newNominee.gender === "Female"} 
        onChange={handleChange}
      />
      <span>Female</span>
    </label>
    <label className={`radio-label ${newNominee.gender === "Other" ? "selected" : ""}`}>
      <input 
        type="radio" 
        name="gender" 
        value="Other" 
        checked={newNominee.gender === "Other"} 
        onChange={handleChange}
      />
      <span>Other</span>
    </label>
  </div>
  {errors.gender && <p className="error-text">{errors.gender}</p>}
</div>
          
          <div className="form-row">
  <div className="form-group">
    <label>ID Type*</label>
    <select 
      name="idType" 
      value={newNominee.idType} 
      onChange={handleChange}
      onBlur={handleBlur}
      className={errors.idType ? "error-input" : ""}
    >
      <option value="">Select ID Type</option>
      <option value="Aadhar">Aadhar</option>
      <option value="PAN">PAN</option>
      <option value="Passport">Passport</option>
    </select>
    {errors.idType && <p className="error-text">{errors.idType}</p>}
  </div>
  
  {newNominee.idType && (
    <div className="form-group">
      <label>ID Number*</label>
      <input 
        type="text" 
        name="idNumber" 
        placeholder="Enter ID Number"
        value={newNominee.idNumber} 
        onChange={handleChange}
        onBlur={handleBlur}
        className={errors.idNumber ? "error-input" : ""}
      />
      {errors.idNumber && <p className="error-text">{errors.idNumber}</p>}
    </div>
  )}
</div>
          
          <div className="form-group">
            <button className="save-nominee-btn" onClick={handleAddNominee}>
              {currentNomineeIndex !== null ? "Update Nominee" : "Save Nominee"}
            </button>
            <button className="cancel-btn" onClick={() => {
              setShowForm(false);
              setErrors({});
              setCurrentNomineeIndex(null);
              setNewNominee({
                relation: "",
                title: "",
                name: "",
                dob: "",
                age: "",
                gender: "",
                maritalStatus: "",
                religion: "",
                occupation: "",
                residentialStatus: "",
                nationality: "",
                address: "",
                idType: "",
                idNumber: "",
              });
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {nominees.length > 0 && !showForm && (
        <div className="nominees-list">
          {nominees.map((nominee, index) => (
            <div key={index} className="nominee-item">
              <div className="nominee-info">
                <span className="user-icon">👤</span>
                <div className="nominee-details">
                  <h3>Nominee {index + 1}</h3>
                  <p>{nominee.name} ({nominee.relation})</p>
                </div>
              </div>
              <div className="nominee-actions">
                <button className="edit-btn" onClick={() => handleEditNominee(index)}>Edit</button>
                <button className="remove-btn" onClick={() => handleRemoveNominee(index)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="navigation-buttons">
        <button className="prev-btn" onClick={onPrev}>
          ← Previous
        </button>
        <button className="next-btn" onClick={handleNext}>
          Next →
        </button>
      </div>
      
      {errors.general && <p className="error-text general-error">{errors.general}</p>}
    </div>
  );
};

export default NomineeDetailsForm;