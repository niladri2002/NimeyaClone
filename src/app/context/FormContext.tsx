"use client";
import React, { createContext, useState, ReactNode } from "react";

export interface PersonalDetails {
    title: string;
    name: string;
    dob: string;
    age: string;
    gender: string;
    maritalStatus: string;
    marriageDate?: string; 
    religion: string;
    nationality: string;
    occupation: string;
    residentialStatus: string;
    address: string;
    idType: string;
    idNumber?: string; 
  }

export interface Nominee {
  relation: string;
  title: string;
  name: string;
  dob: string;
  age: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  occupation: string;
  residentialStatus: string;
  nationality: string;
  address: string;
  idType: string;
  idNumber: string;
}

export interface Asset {
  nomineeName: string;
  relation: string;
  bequeathShare: number;
}


interface FormContextType {
  personalDetails: PersonalDetails;
  setPersonalDetails: (data: PersonalDetails) => void;
  nominees: Nominee[];
  setNominees: (data: Nominee[]) => void;
  assets: Asset[];
  setAssets: (data: Asset[]) => void;
}


export const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    title: "Mr.",
    name: "",
    dob: "",
    age: "",
    gender: "Male",
    maritalStatus: "",
    marriageDate: "",
    religion: "",
    nationality: "",
    occupation: "",
    residentialStatus: "",
    address: "",
    idType: "",
    idNumber: "",
  });

  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  return (
    <FormContext.Provider value={{ personalDetails, setPersonalDetails, nominees, setNominees, assets, setAssets }}>
      {children}
    </FormContext.Provider>
  );
};
