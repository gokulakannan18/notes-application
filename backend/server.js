const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const folderRoutes = require("./routes/folderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
}));
const isLoggedIn = require("./middleware/authMiddleware");
app.use("/api/auth", authRoutes);
app.use("/api/notes", isLoggedIn, noteRoutes);
app.use("/api/folders", isLoggedIn, folderRoutes);
app.use("/api/categories", isLoggedIn, categoryRoutes);
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
