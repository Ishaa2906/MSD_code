let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let crypto = require('crypto');
let fs = require('fs');
let {users} = require('../models/users');
let { files } = require('../models/files');
let multer = require('multer');
let path = require('path');
// (MULTER CONFIGURATION)Create uploads folder path
let uploadPath = path.join(__dirname, '../uploads');
// Create folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });}
// Configure Multer storage
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);},
    filename: function (req, file, cb) {
        let uniqueName = Date.now() + '-' +
            crypto.randomUUID() + path.extname(file.originalname);
        cb(null, uniqueName);}
});
// Initialize Multer
let upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});
// ENCRYPTION KEY CONFIGURATION
function getEncryptionKey() {
    let key = process.env.FILE_ENCRYPTION_KEY;
    if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error('Invalid encryption key configuration');
    }
    return Buffer.from(key, 'hex');}
// Register route
router.post("/register", async (req, res) => {
    try {
        let data = req.body;
        // Hash the password
        data.password = await bcrypt.hash(data.password, 10);
        // Create a new user
        let newuser = new users(data);
        // Save user in MongoDB
        let result = await newuser.save();
        // Send only safe user details
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: result._id,
                name: result.name,
                email: result.email,
                role: result.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Registration failed",
            error: error.code === 11000
                ? "Email already exists"
                : "Internal server error"
        });}
});
//login route
router.post("/login", async (req, res) => {
    try {
        let user = await users.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: "Invalid Email"
            });
        }

        let passmatch = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!passmatch) {
            return res.status(401).json({
                message: "Incorrect Password"
            });
        }
        res.status(200).json({
            message: "Login Successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
});
//update profile route
router.patch("/updateprofile/:id", async (req, res) => {
    try {
        let userId = req.params.id;
        let { name, email } = req.body;
        let result = await users.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");
        if (!result) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "Profile updated successfully",
            user: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Profile update failed"
        });
    }
});
router.post("/addfile", upload.single("file"), async (req, res) => {
    try {
        let { userId } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a file"
            });
        }

        if (!userId) {
            await fs.promises.unlink(req.file.path);

            return res.status(400).json({
                message: "User ID is required"
            });
        }

        let user = await users.findById(userId);

        if (!user) {
            await fs.promises.unlink(req.file.path);

            return res.status(404).json({
                message: "User not found"
            });
        }

        let newFile = new files({
            userId: userId,
            originalName: req.file.originalname,
            storagePath: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            isEncrypted: false
        });

        let result = await newFile.save();

        res.status(201).json({
            message: "File uploaded successfully",
            file: {
                id: result._id,
                originalName: result.originalName,
                mimetype: result.mimetype,
                size: result.size,
                isEncrypted: result.isEncrypted
            }
        });

    } catch (error) {
        console.log(error);

        if (req.file && fs.existsSync(req.file.path)) {
            await fs.promises.unlink(req.file.path).catch(console.log);
        }

        res.status(500).json({
            message: "File upload failed"
        });
    }
});

// =====================================
// 5. VIEW FILES ROUTE
// =====================================

router.get("/viewfiles", async (req, res) => {
    try {
        let { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        let result = await files.find({ userId })
            .select("-storagePath -iv -authTag");

        res.status(200).json({
            message: "Files retrieved successfully",
            files: result
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Unable to retrieve files"
        });
    }
});

// =====================================
// 6. ENCRYPT FILE ROUTE
// =====================================

router.post("/encrypt/:id", async (req, res) => {
    let encryptedPath;

    try {
        let { userId } = req.body;

        let file = await files.findOne({
            _id: req.params.id,
            userId: userId
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        if (file.isEncrypted) {
            return res.status(400).json({
                message: "File is already encrypted"
            });
        }

        let key = getEncryptionKey();
        let iv = crypto.randomBytes(12);

        let cipher = crypto.createCipheriv(
            'aes-256-gcm',
            key,
            iv
        );

        let input = await fs.promises.readFile(file.storagePath);

        let encrypted = Buffer.concat([
            cipher.update(input),
            cipher.final()
        ]);

        let authTag = cipher.getAuthTag();

        encryptedPath = file.storagePath + '.enc';

        await fs.promises.writeFile(encryptedPath, encrypted);

        file.storagePath = encryptedPath;
        file.iv = iv.toString('hex');
        file.authTag = authTag.toString('hex');
        file.isEncrypted = true;

        await file.save();

        await fs.promises.unlink(encryptedPath.replace(/\.enc$/, ''));

        res.status(200).json({
            message: "File encrypted successfully",
            fileId: file._id,
            isEncrypted: true
        });

    } catch (error) {
        console.log(error);

        if (encryptedPath && fs.existsSync(encryptedPath)) {
            await fs.promises.unlink(encryptedPath).catch(console.log);
        }

        res.status(500).json({
            message: "File encryption failed"
        });
    }
});

// =====================================
// 7. DECRYPT FILE ROUTE
// =====================================

router.post("/decrypt/:id", async (req, res) => {
    let decryptedPath;

    try {
        let { userId } = req.body;

        let file = await files.findOne({
            _id: req.params.id,
            userId: userId
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        if (!file.isEncrypted) {
            return res.status(400).json({
                message: "File is not encrypted"
            });
        }

        let key = getEncryptionKey();

        let iv = Buffer.from(file.iv, 'hex');
        let authTag = Buffer.from(file.authTag, 'hex');

        let decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            iv
        );

        decipher.setAuthTag(authTag);

        let input = await fs.promises.readFile(file.storagePath);

        let decrypted = Buffer.concat([
            decipher.update(input),
            decipher.final()
        ]);

        decryptedPath = path.join(
            uploadPath,
            crypto.randomUUID() + '-' + file.originalName
        );

        await fs.promises.writeFile(decryptedPath, decrypted);

        res.download(decryptedPath, file.originalName, async (error) => {
            if (fs.existsSync(decryptedPath)) {
                await fs.promises.unlink(decryptedPath).catch(console.log);
            }

            if (error) {
                console.log(error);
            }
        });

    } catch (error) {
        console.log(error);

        if (decryptedPath && fs.existsSync(decryptedPath)) {
            await fs.promises.unlink(decryptedPath).catch(console.log);
        }

        if (!res.headersSent) {
            res.status(500).json({
                message: "File decryption failed"
            });
        }
    }
});
// 8. DELETE FILE ROUTE
router.delete("/deletefile/:id", async (req, res) => {
    try {
        let { userId } = req.body;
        let file = await files.findOne({
            _id: req.params.id,
            userId: userId
        });
        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }
        if (fs.existsSync(file.storagePath)) {
            await fs.promises.unlink(file.storagePath);
        }
        await files.findByIdAndDelete(file._id);
        res.status(200).json({
            message: "File deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "File deletion failed"
        });
    }
});
module.exports = router;