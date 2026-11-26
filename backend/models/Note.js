
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "Personal"
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    },
    tags: {
    type: [String],
    default: []
}
}, {
    timestamps: true
});

module.exports = mongoose.model("Note", noteSchema);
