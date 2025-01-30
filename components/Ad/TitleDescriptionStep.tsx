"use client";
import { useState } from "react";
import axios from "axios";

const TitleDescriptionStep: React.FC = () => {

    const getMainCategories = (categories: { id: number; name: string }[]) => {
        return categories.map((category) => category.name);
      };


      const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subCategory2, setSubCategory2] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState("pending");
  const [showAllStates, setShowAllStates] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    formData.append("data", JSON.stringify({
      title,
      description,
      mainCategory,
      subCategory,
      subCategory2,
      mobile,
      address,
      city,
      pincode,
      state,
      status,
      showAllStates,
    }));

    try {
      const res = await axios.post("/api/create-ad", formData, {
        withCredentials: true, // This ensures the cookies are sent with the request
      });
  
      setSuccess("Ad created successfully!");
    } catch (error: any) {
      if (error.response) {
        // If response was returned from the server
        setError(error.response.data.message || "Something went wrong");
      } else {
        // If no response was returned
        setError("Failed to create ad. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

 return (
    
 <div>
 <h1>Create Ad</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Main Category</label>
          <input
            type="text"
            value={mainCategory}
            onChange={(e) => setMainCategory(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sub Category</label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sub Category 2</label>
          <input
            type="text"
            value={subCategory2}
            onChange={(e) => setSubCategory2(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mobile</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
        </div>
        <div>
          <label>State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label>Show All States</label>
          <input
            type="checkbox"
            checked={showAllStates}
            onChange={() => setShowAllStates(!showAllStates)}
          />
        </div>
        <div>
          <label>Upload Image</label>
          <input type="file" onChange={handleFileChange} required />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Ad"}
          </button>
        </div>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
 </div>
 );
};

export default TitleDescriptionStep;