const express = require("express");
const Note = require("../models/Note");
const Folder = require("../models/Folder");
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const folders = await Folder.find().sort({ createdAt: -1 });

        res.json(folders);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch folders"
        });
    }
});
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        const existingFolder = await Folder.findOne({
            name: name.trim()
        });

        if (existingFolder) {
            return res.status(400).json({
                message: "Folder already exists"
            });
        }

        const folder = await Folder.create({
            name: name.trim()
        });

        res.status(201).json({
            message: "Folder created successfully",
            folder
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create folder"
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        await Note.updateMany(
            { folder: req.params.id },
            { $set: { folder: null } }
        );

        await Folder.findByIdAndDelete(req.params.id);

        res.json({ message: "Folder deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;