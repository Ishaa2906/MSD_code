
import { useEffect, useState } from "react";

function Viewfiles() {
    let [fileList, setFileList] = useState([]);
    let [message, setMessage] = useState("Loading files...");

    let currentuser = JSON.parse(
        localStorage.getItem("currentuser") || "null"
    );

    // Fetch all files belonging to the logged-in user
    let getFiles = async () => {
        if (!currentuser?._id) {
            setMessage("Please login first");
            return;
        }

        try {
            let response = await fetch(
                `http://localhost:3000/api/users/viewfiles?userId=${currentuser._id}`
            );

            let result = await response.json();

            if (response.ok) {
                setFileList(result.files || []);

                if (result.files && result.files.length > 0) {
                    setMessage("");
                } else {
                    setMessage("No files uploaded yet");
                }
            } else {
                setMessage(result.message || "Unable to retrieve files");
            }

        } catch (error) {
            console.log(error);
            setMessage("Server connection failed");
        }
    };

    // Load files when the page opens
    useEffect(() => {
        getFiles();
    }, []);

    // Delete a file
    let handleDelete = async (fileId) => {
        try {
            let response = await fetch(
                `http://localhost:3000/api/users/deletefile/${fileId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: currentuser._id
                    })
                }
            );

            let result = await response.json();

            if (response.ok) {
                alert("File deleted successfully");
                getFiles();
            } else {
                alert(result.message || "Unable to delete file");
            }

        } catch (error) {
            console.log(error);
            alert("Server connection failed");
        }
    };

    return (
        <div>
            <h1>My Uploaded Files</h1>

            <button onClick={getFiles}>Refresh Files</button>

            <hr />

            {message && <p>{message}</p>}

            {fileList.map((file) => (
                <div key={file._id}>
                    <h3>{file.originalName}</h3>

                    <p>File Type: {file.mimetype}</p>

                    <p>
                        File Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    <p>
                        Encryption Status:{" "}
                        {file.isEncrypted ? "Encrypted" : "Not Encrypted"}
                    </p>

                    <button onClick={() => handleDelete(file._id)}>
                        Delete
                    </button>

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Viewfiles;
