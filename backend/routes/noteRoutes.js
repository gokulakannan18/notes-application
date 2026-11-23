const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
router.post("/", async (req, res) => {
    try {
        const note = await Note.create(req.body);
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
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
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
