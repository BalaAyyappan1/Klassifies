// components/MultiStepForm.tsx
"use client";
import React, { useState } from "react";
import axios from "axios";
import LabelInput from "../ReusableComponents/LabelInput";
import { Button } from "../ui/button";
import { categoryData } from "@/Data/Categories";
import { MainCategory, Subcategory, Subcategory2 } from "@/types/categories";
import { ImageUploadIcon } from "../ReusableComponents/Icons";
import Image from "next/image";

interface FormData {
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  subCategory2: string;
  images: File[];
  mobile: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  showAllStates: boolean;
}

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [autoFilled, setAutoFilled] = useState(false);
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const [subCategories2, setSubCategories2] = useState<Subcategory2[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    mainCategory: "",
    subCategory: "",
    subCategory2: "",
    images: [],
    mobile: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    showAllStates: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      setFormData({
        ...formData,
        images: Array.from(files), // Convert FileList to an array of File
      });
    }
  };

  const handleMainCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      mainCategory: value,
      subCategory: "",
      subCategory2: "",
    }));

    // Find the selected mainCategory and update the subCategories state
    const selectedMainCategory = categoryData.mainCategories.find(
      (category) => category.name === value
    );
    setSubCategories(selectedMainCategory?.subcategories || []);
    setSubCategories2([]); // Reset subcategories2
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      subCategory: value,
      subCategory2: "",
    }));

    // Find the selected subCategory and update the subCategories2 state
    const selectedSubCategory = subCategories.find(
      (subcategory) => subcategory.name === value
    );
    setSubCategories2(selectedSubCategory?.subcategories2 || []);
  };

  const handleSubCategory2Change = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      subCategory2: value,
    }));
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  const handlePincodeChange = async (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (value.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData({
            ...formData,
            city: postOffice.District,
            state: postOffice.State,
          });
          setAutoFilled(true);
        } else {
          setAutoFilled(false);
        }
      } catch (error) {
        console.error('Error fetching pincode details:', error);
        setAutoFilled(false);
      }
    } else {
      setAutoFilled(false);
    }
  };
  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify(formData));
    formData.images.forEach((file) => {
      formDataToSend.append("file", file);
    });

    try {
      const response = await axios.post("/api/ad", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Ad created successfully:", response.data);
    } catch (error) {
      console.error("Error creating ad:", error);
    }
  };
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Update formData with the new value for the description field
    });
  };

  return (
    <div>
      {step === 1 && (
        <div className="p-6 space-y-6">
          <h2 className="font-bold text-2xl mb-4">Title and Description</h2>
          <div className="flex flex-col space-y-4">
            <LabelInput
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              labelText=""
              htmlFor=""
            />
            <textarea
              name="description"
              value={formData.description}
              placeholder="Description"
              onChange={handleTextArea}
              className="border bg-[#FAFBFC] p-3 resize-none focus:outline-none rounded-[4px] dark:bg-[#333333] dark:border-[#333333]"
            />
          </div>
          <div className="text-right">
            <Button
              onClick={nextStep}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="p-6 space-y-6">
          <h2 className="font-bold text-2xl mb-4">Categories</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="mainCategory"
                className="block text-sm font-medium mb-2"
              >
                Main Category
              </label>
              <select
                id="mainCategory"
                name="mainCategory"
                value={formData.mainCategory}
                onChange={handleMainCategoryChange}
                className="w-full border bg-[#FAFBFC] p-3 rounded-md dark:bg-[#333333] dark:border-[#333333]"
              >
                <option value="" disabled>
                  Select Main Category
                </option>
                {categoryData.mainCategories.map(
                  (mainCategory: MainCategory) => (
                    <option key={mainCategory.id} value={mainCategory.name}>
                      {mainCategory.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {subCategories.length > 0 && (
              <div>
                <label
                  htmlFor="subCategory"
                  className="block text-sm font-medium mb-2"
                >
                  Sub Category
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleSubCategoryChange}
                  className="w-full border bg-[#FAFBFC] p-3 rounded-md dark:bg-[#333333] dark:border-[#333333]"
                >
                  <option value="" disabled>
                    Select Sub Category
                  </option>
                  {subCategories.map((subCategory: Subcategory) => (
                    <option key={subCategory.id} value={subCategory.name}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {subCategories2.length > 0 && (
              <div>
                <label
                  htmlFor="subCategory2"
                  className="block text-sm font-medium mb-2"
                >
                  Sub Category 2
                </label>
                <select
                  id="subCategory2"
                  name="subCategory2"
                  value={formData.subCategory2}
                  onChange={handleSubCategory2Change}
                  className="w-full border bg-[#FAFBFC] p-3 rounded-md dark:bg-[#333333] dark:border-[#333333]"
                >
                  <option value="" disabled>
                    Select Sub Category 2
                  </option>
                  {subCategories2.map((subCategory2) => (
                    <option key={subCategory2.id} value={subCategory2.name}>
                      {subCategory2.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="p-6 space-y-6">
          <h2 className="font-bold text-2xl mb-4">Upload Images</h2>

          <div className="flex items-center justify-center">
            {/* Image Upload Icon */}
            <div className="w-full border-2 border-dashed border-gray-300 rounded-[4px] flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center mt-10 mb-10 space-y-5">
                {" "}
                <Image
                  src={ImageUploadIcon}
                  alt="Upload Icon"
                  objectFit="contain"
                />
                <div className="flex flex-col justify-center text-center">
                  <span className="text-[14px]">Drop your image here, or <span className="text-blue-800 font-medium">browse</span></span>
                  <span className="text-[13px]">Supports: PBG, JPG, JPEG, WEBP</span>
                </div>
                <input
                  type="file"
                  name="images"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2 className="font-bold text-2xl mb-4">Contact Information</h2>

          <div className="flex flex-wrap gap-4 max-w-screen-lg mx-auto">

    <LabelInput
      type="text"
      name="mobile"
      value={formData.mobile}
      onChange={handleChange}
      placeholder="Mobile"
      labelText=""
      htmlFor=""
      className="w-full md:w-1/3 md:flex-grow"
    />
    <LabelInput
      type="text"
      name="address"
      value={formData.address}
      onChange={handleChange}
      placeholder="Address"
      labelText=""
      htmlFor=""
      className="w-full md:w-1/3  md:flex-grow"
    />
    <LabelInput
      type="text"
      name="pincode"
      value={formData.pincode}
      onChange={handlePincodeChange}
      placeholder="Pincode"
      labelText=""
      htmlFor=""
      className="w-full md:w-1/3  md:flex-grow"
    />
    <LabelInput
      type="text"
      name="city"
      value={formData.city}
      onChange={handleChange}
      placeholder="City"
      labelText=""
      htmlFor=""
      disabled={autoFilled}
      className="w-full md:w-1/3  md:flex-grow"
    />
    <LabelInput
      type="text"
      name="state"
      value={formData.state}
      onChange={handleChange}
      placeholder="State"
      labelText=""
      htmlFor=""
      disabled={autoFilled}
      className="w-full md:w-1/2"
    />
  </div>
          
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {step === 5 && (
        <div>
          <h2>Step 5: Review and Submit</h2>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
          <label>
            <input
              type="checkbox"
              name="showAllStates"
              checked={formData.showAllStates}
              onChange={handleChange}
            />
            Show All States
          </label>
          <button onClick={prevStep}>Previous</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
