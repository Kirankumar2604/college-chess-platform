const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3002;

app.use(cors())

app.get("/", (req,res)=>{
    res.send("Hello from Node backend!")
});

app.get("/api/message",(res,req)=>{
    req.json({message:"Hello from Express API!"});
});

app.listen(PORT, ()=>{
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
