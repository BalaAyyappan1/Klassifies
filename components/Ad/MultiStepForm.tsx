  // components/MultiStepForm.tsx
  "use client";
  import React, { useState } from "react";
  import axios from "axios";
  import LabelInput from "../ReusableComponents/LabelInput";

  import { categoryData } from "@/Data/Categories";
  import { MainCategory, Subcategory, Subcategory2 } from "@/types/categories";
  import { ImageUploadIcon } from "../ReusableComponents/Icons";
  import Image from "next/image";
import {useRouter} from 'next/navigation';
import { toast, ToastContainer } from "react-toastify";

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
    location: { latitude: number; longitude: number };
  }

  const MultiStepForm = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [autoFilled, setAutoFilled] = useState(false);
    const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
    const [subCategories2, setSubCategories2] = useState<Subcategory2[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      location: { latitude: 0, longitude: 0 },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    };

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const { files } = e.target;
    //   if (files) {
    //     setFormData({
    //       ...formData,
    //       images: Array.from(files), // Convert FileList to an array of File
    //     });
    //   }
    // };

    const removeImage = (index: number) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: prevFormData.images.filter((_, i) => i !== index), // Remove image by index
      }));
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files) {
        const validFiles = Array.from(files).filter((file) => {
          const validTypes = ["image/png", "image/jpeg", "image/webp"];
          const maxSize = 5 * 1024 * 1024; // 5MB
          return validTypes.includes(file.type) && file.size <= maxSize;
        });
  
        // Limit to 5 files
        const newImages = validFiles.slice(0, 5 - formData.images.length);
        if (newImages.length > 0) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            images: [...prevFormData.images, ...newImages],
          }));
        } else {
          alert("Invalid file type or size. Please upload PNG, JPG, or WEBP files under 5MB.");
        }
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
    const handlePincodeChange = async (e: {
      target: { name: any; value: any };
    }) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));

      if (value.length === 6) {
        try {
          const response = await fetch(
            `https://api.postalpincode.in/pincode/${value}`
          );
          const data = await response.json();
          if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State,
            }));
            setAutoFilled(true);
          } else {
            setAutoFilled(false);
          }
        } catch (error) {
          console.error("Error fetching pincode details:", error);
          setAutoFilled(false);
        }
      } else {
        setAutoFilled(false);
      }
    };
    // const handleSubmit = async () => {
    //   setLoading(true); // Start loading
      
    //   // Get user's location
    //   if (!navigator.geolocation) {
    //     console.error("Geolocation is not supported by this browser.");
    //     setLoading(false); // Stop loading on error
    //     toast.error("Geolocation is not supported by your browser");
    //     return;
    //   }
    
    //   navigator.geolocation.getCurrentPosition(async (position) => {
    //     const { latitude, longitude } = position.coords;
    //     console.log("Latitude:", latitude, "Longitude:", longitude);
    
    //     const formDataToSend = new FormData();
    //     const locationData = {
    //       type: "Point",
    //       coordinates: [longitude, latitude]
    //     };
    
    //     formDataToSend.append("data", JSON.stringify({ ...formData, location: locationData }));
    //     formData.images.forEach((file) => {
    //       formDataToSend.append("file", file);
    //     });
    
    //     try {
    //       const response = await axios.post("/api/create-ad", formDataToSend, {
    //         headers: {
    //           "Content-Type": "multipart/form-data",
    //         },
    //       });
    //       toast.success("Ad created successfully!");
    //       router.push("/");
    //       console.log("Ad created successfully:", response.data);
    //     } catch (error) {
    //       console.error("Error creating ad:", error);
    //       toast.error("Failed to create ad");
    //     } finally {
    //       setLoading(false); // Stop loading in any case
    //     }
    //   }, (error) => {
    //     console.error("Error getting location:", error);
    //     toast.error("Failed to get your location");
    //     setLoading(false); // Stop loading on error
    //   });
    // };


    const handleSubmit = async () => {
  setLoading(true); // Start loading
  
  // Check if we're on a secure context (HTTPS) - required for Safari
  if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
    console.error("Geolocation requires HTTPS");
    toast.error("Geolocation requires a secure connection (HTTPS)");
    setLoading(false);
    return;
  }
  
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    setLoading(false); // Stop loading on error
    toast.error("Geolocation is not supported by your browser");
    return;
  }

  // Options for geolocation (these help with Safari)
  const options = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 0 // Don't use cached position
  };
  
  // Get user's location
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Latitude:", latitude, "Longitude:", longitude);
      
      const formDataToSend = new FormData();
      const locationData = {
        type: "Point",
        coordinates: [longitude, latitude]
      };
      
      formDataToSend.append("data", JSON.stringify({ ...formData, location: locationData }));
      
      formData.images.forEach((file) => {
        formDataToSend.append("file", file);
      });
      
      try {
        const response = await axios.post("/api/create-ad", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        toast.success("Ad created successfully!");
        router.push("/");
        console.log("Ad created successfully:", response.data);
      } catch (error) {
        console.error("Error creating ad:", error);
        toast.error("Failed to create ad");
      } finally {
        setLoading(false); // Stop loading in any case
      }
    },
    (error) => {
      // Handle specific geolocation errors for better user feedback
      let errorMessage = "Failed to get your location";
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission was denied. Please enable location services.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable. Please try again.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Please try again.";
          break;
      }
      
      console.error("Error getting location:", error);
      toast.error(errorMessage);
      setLoading(false); // Stop loading on error
    },
    options // Pass the options to help with Safari compatibility
  );
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
              <button
                onClick={nextStep}
                className="bg-blue-800 text-[14px] text-white px-5 py-1 rounded-[3px] hover:bg-blue-700 transition"
              >
                Next
              </button>
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
                className="bg-gray-200 text-[14px] text-gray-800 px-5 py-1 rounded-[3px] hover:bg-gray-300 transition"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-800 text-[14px] text-white px-5 py-1 rounded-[3px] hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="p-6 space-y-6">
            <h2 className="font-bold text-2xl mb-4">Upload Images</h2>

            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => document.getElementById("imageUploadInput")?.click()}
            >
              {/* Image Upload Icon */}
              <div className="w-full border-2 border-dashed border-gray-300 rounded-[4px] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center mt-10 mb-10 space-y-5">
                  <Image
                    src={ImageUploadIcon}
                    alt="Upload Icon"
                    objectFit="contain"
                  />
                  <div className="flex flex-col justify-center text-center">
                    <span className="text-[14px]">
                      Drop your image here, or{" "}
                      <span className="text-blue-800 font-medium">browse</span>
                    </span>
                    <span className="text-[13px]">
                      Supports: PBG, JPG, JPEG, WEBP
                    </span>
                  </div>
                  <input
                    type="file"
                    id="imageUploadInput"
                    name="images"
                    multiple
                    hidden
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
              <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={URL.createObjectURL(image)} // Create a URL for the image
                alt={`Selected Image ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
                width={96} // Specify width
                height={96} // Specify height
              />
              <button
  onClick={() => removeImage(index)}
  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
>
  <span className="text-sm font-bold">&times;</span> {/* Close icon */}
</button>
            </div>
          ))}
        </div>
      </div>
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-200 text-[14px] text-gray-800 px-5 py-1 rounded-[3px] hover:bg-gray-300 transition"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-800 text-[14px] text-white px-5 py-1 rounded-[3px] hover:bg-blue-700 transition"
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
                className="bg-gray-200 text-[14px] text-gray-800 px-5 py-1 rounded-[3px] hover:bg-gray-300 transition"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-800 text-[14px] text-white px-5 py-1 rounded-[3px] hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="p-6 space-y-6">
            <h2 className="font-bold text-2xl mb-4">Review and Submit</h2>

            {/* Image Carousel */}
           {formData.images.length > 0 && (
  <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg">
    <div 
      className="flex transition-transform duration-300 ease-in-out"
      style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
    >
      {formData.images.map((file, index) => (
        <div key={index} className="w-full flex-shrink-0 rounded-lg">
          <Image
            src={URL.createObjectURL(file)}
            alt={`Uploaded Image ${index + 1}`}
            width={800}
            height={600}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      ))}
    </div>
    
    {formData.images.length > 1 && (
      <>
        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-blue-500 px-3 py-1.5  rounded-full text-white hover:bg-blue-400 transition"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex(prev => 
              prev === 0 ? formData.images.length - 1 : prev - 1
            );
          }}
        >
          &lt;
        </button>
        <button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-500 px-3 py-1.5 rounded-full text-white hover:bg-blue-400 transition"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex(prev => 
              prev === formData.images.length - 1 ? 0 : prev + 1
            );
          }}
        >
          &gt;
        </button>
        
        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {formData.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-blue-500' : 'bg-blue-50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </>
    )}
  </div>
)}

            {/* Details Section in Single Column */}
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Ad Details</h3>
                <p>
                  <span className="font-medium">Title:</span> {formData.title}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {formData.description}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Categories</h3>
                <p>
                  <span className="font-medium">Main Category:</span>{" "}
                  {formData.mainCategory}
                </p>
                {formData.subCategory && (
                  <p>
                    <span className="font-medium">Sub Category:</span>{" "}
                    {formData.subCategory}
                  </p>
                )}
                {formData.subCategory2 && (
                  <p>
                    <span className="font-medium">Sub Category 2:</span>{" "}
                    {formData.subCategory2}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Contact Information</h3>
                <p>
                  <span className="font-medium">Mobile:</span> {formData.mobile}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {formData.address}
                </p>
                <p>
                  <span className="font-medium">City:</span> {formData.city}
                </p>
                <p>
                  <span className="font-medium">State:</span> {formData.state}
                </p>
                <p>
                  <span className="font-medium">Pincode:</span> {formData.pincode}
                </p>
              </div>
            </div>

            {/* Checkbox and Buttons */}
            <div className="mt-8 space-y-4 mb-10">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="showAllStates"
                  checked={formData.showAllStates}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>Show All States</span>
              </label>

              <div className="flex justify-between ">
                <button
                  onClick={prevStep}
                  className="bg-gray-200 mt-10 text-[14px] text-gray-800 px-5 py-1 rounded-[3px] hover:bg-gray-300 transition"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-800 mt-10 text-[14px] text-white px-5 py-1 rounded-[3px] hover:bg-blue-700 transition"
                >
                  Sumbit
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer />
      </div>
    );
  };

  export default MultiStepForm;
