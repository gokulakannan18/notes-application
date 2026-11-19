
const API_URL = "/api/notes";

const notesContainer = document.getElementById("notesContainer");
const noteForm = document.getElementById("noteForm");
const noteFormContainer = document.getElementById("noteFormContainer");
const addNoteBtn = document.getElementById("addNoteBtn");
const cancelBtn = document.getElementById("cancelBtn");

const noteTitle = document.getElementById("noteTitle");
const noteDescription = document.getElementById("noteDescription");
const noteCategory = document.getElementById("noteCategory");

const searchInput = document.getElementById("searchInput");
const noteCount = document.getElementById("noteCount");
const sectionTitle = document.getElementById("sectionTitle");
const formTitle = document.getElementById("formTitle");

let notes = [];
let editingId = null;
let currentFilter = "all";

async function getNotes() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch notes");
        }

        notes = await response.json();
        displayNotes();
    } catch (error) {
        console.log(error);
        notesContainer.innerHTML =
            '<p class="empty-message">Unable to load notes.</p>';
    }
}

function displayNotes() {
    const searchText = searchInput.value.toLowerCase();

    let filteredNotes = notes.filter(note => {
        return (
            note.title.toLowerCase().includes(searchText) ||
            note.description.toLowerCase().includes(searchText) ||
            note.category.toLowerCase().includes(searchText)
        );
    });

    if (currentFilter === "archived") {
    filteredNotes = filteredNotes.filter(note => note.isArchived);
} else {
    filteredNotes = filteredNotes.filter(note => !note.isArchived);

    if (currentFilter === "favorite") {
        filteredNotes = filteredNotes.filter(note => note.isFavorite);
    } else if (currentFilter === "pinned") {
        filteredNotes = filteredNotes.filter(note => note.isPinned);
    } else if (currentFilter !== "all") {
        filteredNotes = filteredNotes.filter(
            note => note.category === currentFilter
        );
    }
}

    filteredNotes.sort((a, b) => {
        return Number(b.isPinned) - Number(a.isPinned);
    });

    notesContainer.innerHTML = "";

    noteCount.textContent =
        filteredNotes.length + " Notes";

    if (filteredNotes.length === 0) {
        notesContainer.innerHTML =
            '<p class="empty-message">No notes found. Create your first note!</p>';
        return;
    }

    filteredNotes.forEach(note => {
        const card = document.createElement("div");
        card.className = "note-card";

        const content = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = note.title;

        const description = document.createElement("p");
        description.textContent = note.description;

        const category = document.createElement("span");
        category.className = "note-category";
        category.textContent = note.category;

        content.append(title, description, category);

        const actions = document.createElement("div");
        actions.className = "note-actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => editNote(note));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteNote(note._id));

        const pinBtn = document.createElement("button");
        pinBtn.textContent = note.isPinned ? "Unpin" : "Pin";
        pinBtn.addEventListener("click", () => togglePin(note._id));

        const favoriteBtn = document.createElement("button");
favoriteBtn.textContent = note.isFavorite ? "Unfavorite" : "Favorite";
favoriteBtn.addEventListener("click", () => toggleFavorite(note._id));

const archiveBtn = document.createElement("button");
archiveBtn.textContent = note.isArchived ? "Restore" : "Archive";
archiveBtn.addEventListener("click", () => toggleArchive(note._id));

if (note.isArchived) {
    actions.append(deleteBtn, archiveBtn);
} else {
    actions.append(editBtn, deleteBtn, pinBtn, favoriteBtn, archiveBtn);
}

        card.append(content, actions);
        notesContainer.appendChild(card);
    });
}

addNoteBtn.addEventListener("click", () => {
    editingId = null;
    noteForm.reset();
    formTitle.textContent = "Create Note";
    noteFormContainer.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
    noteFormContainer.classList.add("hidden");
    noteForm.reset();
    editingId = null;
});

noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const noteData = {
        title: noteTitle.value.trim(),
        description: noteDescription.value.trim(),
        category: noteCategory.value
    };

    if (!noteData.title || !noteData.description) {
        alert("Please enter both title and description");
        return;
    }

    try {
        let response;

        if (editingId) {
            response = await fetch(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noteData)
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noteData)
            });
        }

        if (!response.ok) {
            throw new Error("Unable to save note");
        }

        noteForm.reset();
        noteFormContainer.classList.add("hidden");
        editingId = null;

        getNotes();

    } catch (error) {
        alert(error.message);
    }
});

function editNote(note) {
    editingId = note._id;

    noteTitle.value = note.title;
    noteDescription.value = note.description;
    noteCategory.value = note.category;

    formTitle.textContent = "Edit Note";
    noteFormContainer.classList.remove("hidden");
}

async function deleteNote(id) {
    const confirmDelete = confirm("Are you sure you want to delete this note?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete note");
        }

        getNotes();

    } catch (error) {
        alert(error.message);
    }
}

async function togglePin(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/pin`, {
            method: "PATCH"
        });

        if (!response.ok) {
            throw new Error("Unable to update pin");
        }

        getNotes();

    } catch (error) {
        alert(error.message);
    }
}

async function toggleFavorite(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/favorite`, {
            method: "PATCH"
        });

        if (!response.ok) {
            throw new Error("Unable to update favorite");
        }

        getNotes();

    } catch (error) {
        alert(error.message);
    }
}
async function toggleArchive(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/archive`, {
            method: "PATCH"
        });

        if (!response.ok) {
            throw new Error("Unable to archive or restore note");
        }

        await getNotes();

    } catch (error) {
        alert(error.message);
    }
}

searchInput.addEventListener("input", displayNotes);

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelector(".nav-btn.active")
            ?.classList.remove("active");

        button.classList.add("active");

        sectionTitle.textContent = button.textContent;

        displayNotes();
    });
});

getNotes();

//theme toggle
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeBtn.textContent = "Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeBtn.textContent = "Dark Mode";
        localStorage.setItem("theme", "light");
    }
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "Light Mode";
}
