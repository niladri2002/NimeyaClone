"use client";

import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormContext } from "../context/FormContext"; 
import "./personalDetailsForm.css"; 

interface PersonalDetailsProps {
    onNext: () => void;
}

const personalDetailsSchema = Yup.object().shape({
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
  age: Yup.string().required("Age is required"),
  gender: Yup.string().required("Gender is required"),
  maritalStatus: Yup.string().required("Marital Status is required"),
  marriageDate: Yup.string().when("maritalStatus", {
    is: "Married",
    then: (schema) => schema
      .required("Marriage Date is required")
      .test(
        "marriage-after-birth",
        "Marriage date must be after date of birth",
        function(value) {
          const { dob } = this.parent;
          if (!value || !dob) return true; 
          
          const marriageDate = new Date(value);
          const birthDate = new Date(dob);
          
          return marriageDate > birthDate;
        }
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  religion: Yup.string().required("Religion is required"),
  nationality: Yup.string().required("Nationality is required"),
  occupation: Yup.string().required("Occupation is required"),
  residentialStatus: Yup.string().required("Residential Status is required"),
  address: Yup.string().required("Address is required"),
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


export default function PersonalDetailsForm({ onNext }: PersonalDetailsProps) {
  const { personalDetails, setPersonalDetails } = useContext(FormContext)!;
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(personalDetailsSchema),
    defaultValues: personalDetails,
  });
  
  const dobValue = watch("dob");
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  if (dobValue) {
    setValue("age", calculateAge(dobValue));
  }

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
    try {
      setPersonalDetails(data);
      onNext();
    } catch (error) {
      console.error("Error updating context:", error);
    }
  };

  const maritalStatus = watch("maritalStatus");
  const idType = watch("idType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="personal-details-form">
      <div className="form-header">
        <h2>Personal Details</h2>
        <div className="form-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Fill in your personal information
        </div>
      </div>
      
      <div className="step-indicator">
        <div className="step-text">Step 1 of 7: Fill up Personal Details</div>
      </div>
      
      <div className="form-note">
        Note: * indicates mandatory field
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Title<span className="required">*</span></label>
          <select {...register("title")} className="form-select" defaultValue="Mr.">
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
          </select>
          {errors.title && <p className="error-message">{errors.title.message}</p>}
        </div>
        
        <div className="form-field">
          <label className="form-label">Name<span className="required">*</span></label>
          <input {...register("name")} className="form-input" />
          {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Date of Birth<span className="required">*</span></label>
          <div className="date-input-container">
            <input type="date" {...register("dob")} className="form-input" />
          </div>
          {errors.dob && <p className="error-message">{errors.dob.message}</p>}
        </div>
        
        <div className="form-field">
          <label className="form-label">Age</label>
          <input {...register("age")} className="form-input" disabled />
        </div>
      </div>
      
     <div className="form-field">
  <label className="form-label">Gender<span className="required">*</span></label>
  <div className="radio-group">
    <label className={`radio-button ${watch("gender") === "Male" ? "selected" : ""}`}>
      <input 
        type="radio" 
        {...register("gender")} 
        value="Male"
      />
      Male
    </label>
    <label className={`radio-button ${watch("gender") === "Female" ? "selected" : ""}`}>
      <input 
        type="radio" 
        {...register("gender")} 
        value="Female"
      />
      Female
    </label>
    <label className={`radio-button ${watch("gender") === "Others" ? "selected" : ""}`}>
      <input 
        type="radio" 
        {...register("gender")} 
        value="Others"
      />
      Others
    </label>
  </div>
  {errors.gender && <p className="error-message">{errors.gender.message}</p>}
</div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Marital Status<span className="required">*</span></label>
          <select {...register("maritalStatus")} className="form-select">
            <option value="">Select</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
          {errors.maritalStatus && <p className="error-message">{errors.maritalStatus.message}</p>}
        </div>
        
        {(maritalStatus ==="Married" || maritalStatus ==="Divorced" || maritalStatus ==="Widowed")  && (
          <div className="form-field">
            <label className="form-label">Marriage Date<span className="required">*</span></label>
            <div className="date-input-container">
              <input type="date" {...register("marriageDate")} className="form-input" />
              <div className="calendar-icon">
              </div>
            </div>
            {errors.marriageDate && <p className="error-message">{errors.marriageDate.message}</p>}
          </div>
        )}
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Religion<span className="required">*</span></label>
          <select {...register("religion")} className="form-select" defaultValue="">
            <option value="" disabled>Select Religion</option>
            <option value="Hinduism">Hinduism</option>
            <option value="Islam">Islam</option>
            <option value="Sikhism">Sikhism</option>
            <option value="Buddhism">Buddhism</option>
            <option value="Jainism">Jainism</option>
            <option value="Other">Other</option>
          </select>
          {errors.religion && <p className="error-message">{errors.religion.message}</p>}
        </div>
        
        <div className="form-field">
  <label className="form-label">Nationality<span className="required">*</span></label>
  <div className="radio-group">
    <label className={`radio-button ${watch("nationality") === "Indian" ? "selected" : ""}`}>
      <input 
        type="radio" 
        {...register("nationality")} 
        value="Indian" 
        style={{ position: 'absolute', opacity: 0 }}
      />
      Indian
    </label>
    <label className={`radio-button ${watch("nationality") === "Foreign" ? "selected" : ""}`}>
      <input 
        type="radio" 
        {...register("nationality")} 
        value="Foreign" 
        style={{ position: 'absolute', opacity: 0 }}
      />
      Foreign
    </label>
  </div>
  {errors.nationality && <p className="error-message">{errors.nationality.message}</p>}
</div>
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Occupation<span className="required">*</span></label>
          <select {...register("occupation")} className="form-select" defaultValue="">
            <option value="" disabled>Select Occupation</option>
            <option value="Service">Service</option>
            <option value="Doctor">Doctor</option>
            <option value="Engineer">Engineer</option>
            <option value="Lawyer">Lawyer</option>
            <option value="Teacher">Teacher</option>
            <option value="Business">Business</option>
            <option value="Government Employee">Government Employee</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Student">Student</option>
            <option value="Retired">Retired</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Other">Other</option>
          </select>
          {errors.occupation && <p className="error-message">{errors.occupation.message}</p>}
        </div>
        
        <div className="form-field">
          <label className="form-label">Residential Status<span className="required">*</span></label>
          <select {...register("residentialStatus")} className="form-select" defaultValue="">
            <option value="" disabled>Select Residential Status</option>
            <option value="Resident (ROR)">Resident (ROR)</option>
            <option value="Resident but Not Ordinarily Resident (RNOR)">Resident but Not Ordinarily Resident (RNOR)</option>
            <option value="Non-Resident (NR)">Non-Resident (NR)</option>
          </select>
          {errors.residentialStatus && <p className="error-message">{errors.residentialStatus.message}</p>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Address<span className="required">*</span></label>
          <textarea {...register("address")} className="form-textarea" rows={3} />
          {errors.address && <p className="error-message">{errors.address.message}</p>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">ID Type<span className="required">*</span></label>
          <select {...register("idType")} className="form-select">
            <option value="">Select</option>
            <option value="Aadhar">Aadhar</option>
            <option value="PAN">PAN</option>
            <option value="Passport">Passport</option>
          </select>
          {errors.idType && <p className="error-message">{errors.idType.message}</p>}
        </div>
        
        {idType && (
          <div className="form-field">
            <label className="form-label">ID Number<span className="required">*</span></label>
            <input {...register("idNumber")} className="form-input" />
            {errors.idNumber && <p className="error-message">{errors.idNumber.message}</p>}
          </div>
        )}
      </div>
      
      <button type="submit" className="next-button">
        Next Page
      </button>
    </form>
  );
}