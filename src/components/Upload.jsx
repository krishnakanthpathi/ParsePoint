import { useState } from "react";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



const Upload = () => {
    const [file , setFile] = useState(null);

    const handleUpload = (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('file');
        fileInput.click();
    }
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        const file = e.target.files[0];
        if (!file) {
            console.error("No file selected");
            return;
        };
        const fileType = file.name.split('.').pop().toLowerCase();
        const supportedTypes = ['.pdf'];
        if (!supportedTypes.includes(`.${fileType}`)) {
            console.error("Unsupported file type");
            return;
        }
        parseFile(file, fileType);
        console.log(e.target.files[0]);
    }

    const parseFile = (file , type) => {
        if(type !== 'pdf'){
            console.error("Unsupported file type for parsing");
            return;
        }
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                console.log(text);
                // Add your parsing logic here

            };
            reader.onerror = (e) => {
                console.error("Error reading file", e);
            };
            reader.readAsText(file);
        } catch (error) {
            console.error("Error parsing file", error);
        }
    }

    return (
        <Form className="d-flex">
            <Form.Control
                type="file"
                placeholder="file"
                id='file'
                className="d-none"
                onChange={handleFileChange}
            />
            <Button variant="outline-primary m-2" onClick={handleUpload}>Upload</Button>
            <Button variant="outline-success m-2">Export to Excel</Button>
        </Form>
    );
}

export default Upload;