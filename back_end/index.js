require('dotenv').config();
let express=require('express');
let mongoose=require('mongoose');
let cors=require('cors'); 
let adminroutes=require('./routes/admin_routes');
let usersroutes=require('./routes/users_routes');
let app=express();
app.use(cors());
mongoose.connect("mongodb://127.0.0.1:27017/Secure_file_storage")
    .then(() => {
        console.log("MongoDB database is connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });
app.use(express.json());
app.use("/api/admin",adminroutes);
app.use("/api/users",usersroutes);
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});