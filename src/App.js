import React, { useState } from "react";
import "./App.css";
import * as pdfjsLib from "pdfjs-dist";

const pdfToText = async (file) => {
  const reader = new FileReader();
  const text = await new Promise((resolve) => {
    reader.onload = async (event) => {
      const pdfData = new Uint8Array(event.target.result);
      const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const totalPages = pdfDocument.numPages;
      let extractedText = "";

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        extractedText += content.items.map((item) => item.str).join(" ") + "\n";
      }

      resolve(extractedText);
    };
    reader.readAsArrayBuffer(file);
  });

  return text;
};

function App() {
  const [resume, setResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyTitle, setCompanyTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add this line for the loader

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file.type === "application/pdf") {
      const text = await pdfToText(file);
      setResume(text);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  async function generateCoverLetter(resume, jobInfo) {
    try {
      setIsLoading(true); // Set loading state to true before API call

      const response = await fetch(
        "http://127.0.0.1:5000/generate_cover_letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume,
            job_info: jobInfo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setCoverLetter(data.cover_letter);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Set loading state to false after API call is completed
    }
  }

  return (
    <div className="App">
      <label htmlFor="resumeUpload" className="form-label">
        Upload your resume (PDF):
      </label>
      <input
        type="file"
        id="resumeUpload"
        accept="application/pdf"
        onChange={handleFileUpload}
        className="form-control"
      />
      <br />
      <label htmlFor="jobTitle" className="form-label">
        Job Title:
      </label>
      <input
        type="text"
        id="jobTitle"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="form-control"
      />
      <br />
      <label htmlFor="companyTitle" className="form-label">
        Company Title:
      </label>
      <input
        type="text"
        id="companyTitle"
        value={companyTitle}
        onChange={(e) => setCompanyTitle(e.target.value)}
        className="form-control"
      />
      <br />
      <label htmlFor="jobDescription" className="form-label">
        Job Description:
      </label>
      <textarea
        id="jobDescription"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="form-control"
      ></textarea>
      <br />
      <button
        onClick={() =>
          generateCoverLetter(resume, {
            jobTitle,
            companyTitle,
            jobDescription,
          })
        }
        className="btn btn-primary"
      >
        Generate Cover Letter
      </button>
      {isLoading && <div>Loading...</div>} {/* Add this line for the loader */}
      {coverLetter && (
        <div>
          <h3>Cover Letter:</h3>
          <div className="cover-letter">{coverLetter}</div>
        </div>
      )}
    </div>
  );
}

export default App;
