const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
router.post("/", async (req, res) => {
    try {
        const { title, description, category, folder } = req.body;

        const note = await Note.create({
            title,
            description,
            category,
            folder,
            tags: req.body.tags || []
        });

        res.status(201).json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.get("/", async (req, res) => {
    try{
        const notes = await Note.find().sort({ isPinned: -1, updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(note);
    } catch (err) {
        res.status(400).json({ message: "Invalid note ID" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const updateData = {
            ...req.body
        };

        if (Array.isArray(req.body.tags)) {
            updateData.tags = req.body.tags
                .map(tag => tag.trim())
                .filter(tag => tag !== "");
        }

        const note = await Note.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid note ID" });
    }
});

router.patch("/:id/pin", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.isPinned = !note.isPinned;
        await note.save();

        res.json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch("/:id/favorite", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.isFavorite = !note.isFavorite;
        await note.save();

        res.json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch("/:id/archive", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.isArchived = !note.isArchived;
        await note.save();

        res.json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
