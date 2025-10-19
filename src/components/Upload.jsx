import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import * as pdfjsLib from "pdfjs-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Upload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    document.getElementById("file").click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const fileType = selectedFile.name.split(".").pop().toLowerCase();
    if (fileType !== "pdf") {
      console.error("Unsupported file type");
      return;
    }

    parsePDF(selectedFile);
  };

  const parsePDF = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        let extractedText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          console.log(textContent);
        //   const pageText = textContent.items.map((item) => item.str).join(" ");
        //   extractedText += pageText + "\n";
        }

        console.log("Extracted PDF Text:\n", extractedText);
      } catch (err) {
        console.error("Error reading the PDF:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Form className="d-flex">
      <Form.Control
        type="file"
        id="file"
        className="d-none"
        onChange={handleFileChange}
        accept=".pdf"
      />
      <Button variant="outline-primary m-2" onClick={handleUpload}>
        Upload
      </Button>
      <Button variant="outline-success m-2">Export to Excel</Button>
    </Form>
  );
};

export default Upload;
