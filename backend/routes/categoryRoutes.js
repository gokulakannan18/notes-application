const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await Category.create({ name });

        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;