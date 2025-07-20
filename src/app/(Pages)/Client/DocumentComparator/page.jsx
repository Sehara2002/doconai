"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import "../../../CSS/documentcomparator/comparator.css";
import UserProfileMenu from "../../../Components/Common/UserProfileMenu";
import { toast } from "react-toastify";

export default function Home() {
  const [file, setFile] = useState(null);
  const [doc1, setDoc1] = useState("");
  const [doc2, setDoc2] = useState("");
  const [comparisonType, setComparisonType] = useState("text");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [uploading, setUploading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [activeStatus, setActiveStatus] = useState('documentComparator');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/document-list`);
      setUploadedDocs(res.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      toast.error("Failed to fetch documents");
    }
  };

  const validateFile = (file) => {
    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 50MB.");
      return false;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.");
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minute timeout
        }
      );
      
      toast.success("File uploaded successfully.");
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      await fetchDocuments();
    } catch (error) {
      console.error("Upload failed", error);
      if (error.response?.status === 413) {
        toast.error("File too large. Please upload a smaller file.");
      } else if (error.response?.status === 415) {
        toast.error("Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.");
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Upload timeout. Please try with a smaller file.");
      } else {
        toast.error(error.response?.data?.detail || "Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      toast.error("Please select two documents.");
      return;
    }

    if (doc1 === doc2) {
      toast.error("Please select two different documents.");
      return;
    }

    setComparing(true);
    setResult("");

    const formData = new FormData();
    formData.append("file1_name", doc1);
    formData.append("file2_name", doc2);
    formData.append("comparison_type", comparisonType);

    if (comparisonType === "text") {
      if (!topic || topic.trim() === "") {
        toast.error("Please enter a topic for text-based comparison.");
        setComparing(false);
        return;
      }
      formData.append("topic", topic.trim());
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/compare`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minute timeout for comparison
        }
      );
      
      if (res.data && res.data.result) {
        setResult(JSON.stringify(res.data.result, null, 2));
        toast.success("Documents compared successfully!");
      } else {
        toast.error("No comparison result received.");
      }
    } catch (error) {
      console.error("Compare failed", error);
      
      let errorMessage = "Comparison failed. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || "Invalid request. Please check your files and try again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. The document may be corrupted or unsupported. Please try with different files.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Comparison timeout. Please try with smaller files.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
      setResult(""); // Clear any previous results
    } finally {
      setComparing(false);
    }
  };

  // Filter out doc1 from doc2 options
  const doc2Options = uploadedDocs.filter((d) => d !== doc1);

  return (
    <div className="flex h-screen overflow-hidden">
      <DocumentSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        active={'documentComparator'}
      />
       
      <main className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ease-in-out ${!isMobile && isSidebarOpen ? 'ml-60' : 'ml-0'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-gray-900">Document Comparator</h1>
          <UserProfileMenu />
        </div>

        {/* Upload Section */}
        <div className="mb-4 p-4 border rounded">
          <h2 className="h5 mb-3">Upload a New Document</h2>
          <div className="file-upload">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.txt"
            />
            <button 
              className="btn btn-success" 
              onClick={handleUpload} 
              disabled={uploading || !file}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <small className="form-text text-muted">
            Supported formats: PDF, DOC, DOCX, TXT (Max size: 50MB)
          </small>
        </div>

        {/* Compare Section */}
        <div className="mb-4 p-4 border rounded">
          <h2 className="h5 mb-3">Compare Documents</h2>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Document 1:</label>
              <select
                className="form-select"
                value={doc1}
                onChange={(e) => {
                  setDoc1(e.target.value);
                  if (doc2 === e.target.value) {
                    setDoc2(""); // Clear doc2 if it's the same as doc1
                  }
                }}
              >
                <option value="">Select Document 1</option>
                {uploadedDocs.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Document 2:</label>
              <select
                className="form-select"
                value={doc2}
                onChange={(e) => setDoc2(e.target.value)}
                disabled={!doc1 || doc2Options.length === 0}
              >
                <option value="">Select Document 2</option>
                {doc2Options.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Comparison Type:</label>
            <select
              className="form-select"
              value={comparisonType}
              onChange={(e) => {
                setComparisonType(e.target.value);
                setTopic(""); // Clear topic when changing comparison type
              }}
            >
              <option value="text">Text-Based Comparison</option>
              <option value="numeric">Numerical & Cost Comparison</option>
              <option value="timestamp">Timestamp and Author Changes</option>
              <option value="smart">AI Powered Smart Comparison</option>
            </select>
          </div>

          {comparisonType === "text" && (
            <div className="mb-3">
              <label className="form-label">Input a Topic:</label>
              <input
                type="text"
                className="form-control"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic for text-based comparison"
                maxLength={200}
              />
              <small className="form-text text-muted">
                Enter a specific topic to focus the comparison (e.g., "safety requirements", "cost analysis")
              </small>
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={handleCompare}
            disabled={comparing || !doc1 || !doc2}
          >
            {comparing ? "Comparing..." : "Compare"}
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="h5 mb-2">Comparison Result:</h2>
          <div className="result-box">
            {comparing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="spinner-border text-primary" role="status" aria-hidden="true"></span>
                <span>Comparing documents... This may take a few minutes.</span>
              </div>
            ) : result ? (
              (() => {
                let parsed;
                try {
                  parsed = JSON.parse(result);
                } catch {
                  return <pre className="bg-light p-3 rounded">{result}</pre>;
                }
                
                // Helper to render bullet points
                const renderList = (items) => {
                  if (Array.isArray(items) && items.length > 0) {
                    return (
                      <ul className="mb-0 ps-3">
                        {items.map((item, idx) => (
                          <li key={idx} className="mb-2">{item}</li>
                        ))}
                      </ul>
                    );
                  } else {
                    return <span className="text-muted">No data</span>;
                  }
                };

                return (
                  <div>
                    <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
                      <span className="badge bg-info text-dark fs-5 px-3 py-2">
                        <strong>Topic:</strong> {parsed.topic || "General Comparison"}
                      </span>
                      <span className="badge bg-secondary text-light fs-6 px-3 py-2">
                        <strong>Comparison Type:</strong> {comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)}
                      </span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
                      <span className="badge bg-primary text-light fs-6 px-3 py-2">
                        <strong>Document 1:</strong> {doc1}
                      </span>
                      <span className="badge bg-success text-light fs-6 px-3 py-2">
                        <strong>Document 2:</strong> {doc2}
                      </span>
                    </div>
                    <div className="table-responsive mb-3">
                      <table className="table table-bordered shadow-sm">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "50%" }} className="text-primary">Document 1</th>
                            <th style={{ width: "50%" }} className="text-success">Document 2</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{renderList(parsed.doc1)}</td>
                            <td>{renderList(parsed.doc2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="alert alert-success fs-6" role="alert">
                      <strong>Summary:</strong>
                      {renderList(parsed.summary)}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-muted">
                <p>No result yet. Select two documents and click "Compare" to start.</p>
                <p><small>Note: Large documents may take several minutes to process.</small></p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}