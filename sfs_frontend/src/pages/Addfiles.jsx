
import { useState } from "react";

function Addfiles() {
    let [selectedFile, setSelectedFile] = useState(null);
    let [message, setMessage] = useState("");

    let currentuser = JSON.parse(
        localStorage.getItem("currentuser") || "null"
    );

    let handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setMessage("Please select a file");
            return;
        }

        if (!currentuser?._id) {
            setMessage("Please login again");
            return;
        }

        let formData = new FormData();
        formData.append("userId", currentuser._id);
        formData.append("file", selectedFile);

        try {
            let response = await fetch(
                "http://localhost:3000/api/users/addfile",
                {
                    method: "POST",
                    body: formData
                }
            );

            let result = await response.json();

            if (response.ok) {
                setMessage("File uploaded successfully!");
                setSelectedFile(null);
                e.target.reset();
            } else {
                setMessage(result.message || "Upload failed");
            }
        } catch (error) {
            console.log(error);
            setMessage("Server connection failed");
        }
    };

    return (
        <div>
            <h1>Add Files</h1>

            <form onSubmit={handleUpload}>
                <input
                    type="file"
                    onChange={(e) =>
                        setSelectedFile(e.target.files[0])
                    }
                />

                <br /><br />

                <button type="submit">Upload File</button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Addfiles;
