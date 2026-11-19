const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const noteRoutes = require("./routes/noteRoutes");

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/notes", noteRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err.message);
    });