const API_URL = "/api/notes";

const notesContainer = document.getElementById("notesContainer");
const noteForm = document.getElementById("noteForm");
const noteFormContainer = document.getElementById("noteFormContainer");
const addNoteBtn = document.getElementById("addNoteBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addFolderBtn = document.getElementById("addFolderBtn");
const noteTitle = document.getElementById("noteTitle");
const noteDescription = document.getElementById("noteDescription");
const noteTags = document.getElementById("noteTags");
const noteCategory = document.getElementById("noteCategory");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const noteFolder = document.getElementById("noteFolder");
const categoryFilters = document.getElementById("categoryFilters");
const searchInput = document.getElementById("searchInput");
const noteCount = document.getElementById("noteCount");
const sectionTitle = document.getElementById("sectionTitle");
const formTitle = document.getElementById("formTitle");
const categoriesToggle = document.getElementById("categoriesToggle");
const categorySection = document.getElementById("categorySection");

const foldersToggle = document.getElementById("foldersToggle");
const folderSection = document.getElementById("folderSection");
let notes = [];
let folders = [];
let editingId = null;
let currentFilter = "all";

async function loadCategories() {
    try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
            throw new Error("Unable to load categories");
        }

        const categories = await response.json();

        noteCategory.innerHTML = '<option value="">Select Category</option>';
        categoryFilters.innerHTML = "";

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            noteCategory.appendChild(option);

            // Create category button
            const button = document.createElement("button");
            button.className = "nav-btn";
            button.textContent = category.name;
            button.dataset.filter = category.name;

            button.addEventListener("click", () => {
                currentFilter = category.name;

                document.querySelector(".nav-btn.active")
                    ?.classList.remove("active");

                button.classList.add("active");
                sectionTitle.textContent = category.name;

                displayNotes();
            });

            // Create delete button
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-category-btn";
            deleteButton.textContent = "×";
            deleteButton.title = "Delete category";

            deleteButton.addEventListener("click", async (event) => {
                event.stopPropagation();

                if (!confirm(`Delete category "${category.name}"?`)) {
                    return;
                }

                try {
                    const deleteResponse = await fetch(
                        `/api/categories/${category._id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    const data = await deleteResponse.json();

                    if (deleteResponse.ok) {
                        alert("Category deleted successfully!");
                        await loadCategories();
                        await getNotes();
                    } else {
                        alert(data.message || "Failed to delete category");
                    }
                } catch (error) {
                    alert("Error deleting category");
                    console.log(error);
                }
            });

            // Put both buttons inside a wrapper
            const categoryItem = document.createElement("div");
            categoryItem.className = "category-item";

            categoryItem.appendChild(button);
            categoryItem.appendChild(deleteButton);

            categoryFilters.appendChild(categoryItem);
        });

    } catch (error) {
        console.log(error);
    }
}

async function loadFolders() {
    try {
        const response = await fetch("/api/folders");

        if (!response.ok) {
            throw new Error("Unable to load folders");
        }

        folders = await response.json();
        const folderFilters = document.getElementById("folderFilters");
        noteFolder.innerHTML = '<option value="">No Folder</option>';

folders.forEach(folder => {
    const option = document.createElement("option");
    option.value = folder._id;
    option.textContent = folder.name;
    noteFolder.appendChild(option);
});
        folderFilters.innerHTML = "";

        folders.forEach(folder => {
            const button = document.createElement("button");
            button.className = "nav-btn";
            button.textContent = folder.name;
            button.dataset.filter = "folder-" + folder._id;

            button.addEventListener("click", () => {
                currentFilter = "folder-" + folder._id;

                document.querySelector(".nav-btn.active")
                    ?.classList.remove("active");

                button.classList.add("active");
                sectionTitle.textContent = folder.name;

                displayNotes();
            });
             const deleteBtn = document.createElement("button");
deleteBtn.textContent = "×";
deleteBtn.className = "delete-folder-btn";
deleteBtn.title = "Delete folder";

deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    const confirmDelete = confirm(`Delete folder "${folder.name}"?`);

    if (!confirmDelete) return;

    const response = await fetch(`/api/folders/${folder._id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        await loadFolders();
        getNotes();
    } else {
        alert("Failed to delete folder");
    }
});

const folderContainer = document.createElement("div");
folderContainer.className = "folder-item";

folderContainer.appendChild(button);
folderContainer.appendChild(deleteBtn);

folderFilters.appendChild(folderContainer);
        });

    } catch (error) {
        console.log(error);
    }
}
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
        (note.category || "").toLowerCase().includes(searchText) ||
        (note.tags || []).some(tag => tag.toLowerCase().includes(searchText))
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
    } else if (currentFilter.startsWith("folder-")) {
        const folderId = currentFilter.replace("folder-", "");

        filteredNotes = filteredNotes.filter(note => {
            return note.folder && note.folder.toString() === folderId;
        });
    } else if (currentFilter !== "all") {
        filteredNotes = filteredNotes.filter(note => note.category === currentFilter);
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
       const folderName = folders.find(folder => folder._id === note.folder)?.name;

if (folderName) {
    const folderLabel = document.createElement("span");
    folderLabel.className = "note-folder";
    folderLabel.textContent = "📁 " + folderName;
    content.appendChild(folderLabel);
}
content.append(title, description, category);

// Display tags
if (note.tags && note.tags.length > 0) {
    const tagsContainer = document.createElement("div");
    tagsContainer.className = "note-tags";

    note.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.className = "note-tag";
        tagElement.textContent = tag;

        tagsContainer.appendChild(tagElement);
    });

    content.appendChild(tagsContainer);
}

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
    category: noteCategory.value,
    folder: noteFolder.value || null,
    tags: [...new Set(
    noteTags.value
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "")
)]

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
         const errorData = await response.json();
    throw new Error(errorData.message || "Unable to save note");
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
    noteCategory.value = note.category;
    noteFolder.value = note.folder || "";
    noteTags.value = (note.tags || []).join(", ");
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
loadCategories();
loadFolders();
addFolderBtn.addEventListener("click", async () => {
    const name = prompt("Enter folder name:");

    if (!name || !name.trim()) {
        return;
    }

    try {
        const response = await fetch("/api/folders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name.trim() })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to create folder");
        }

        alert("Folder created successfully!");
        await loadFolders();

    } catch (error) {
        alert(error.message);
    }
});
addCategoryBtn.addEventListener("click", async () => {
    const categoryName = prompt("Enter category name:");

    if (!categoryName || !categoryName.trim()) return;

    try {
        const response = await fetch("/api/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: categoryName.trim() })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Category created successfully!");
            await loadCategories();
        } else {
            alert(data.message || "Failed to create category");
        }
    } catch (error) {
        alert("Error creating category");
        console.log(error);
    }
});
categoriesToggle.addEventListener("click", () => {
    categorySection.classList.toggle("hidden");

    const arrow = categoriesToggle.querySelector("span");
    arrow.textContent = categorySection.classList.contains("hidden") ? "▸" : "▾";
});

foldersToggle.addEventListener("click", () => {
    folderSection.classList.toggle("hidden");

    const arrow = foldersToggle.querySelector("span");
    arrow.textContent = folderSection.classList.contains("hidden") ? "▸" : "▾";
});
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


const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST"
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Logout failed. Please try again.");
        }
    });
}

async function checkLogin() {
    try {
        const response = await fetch("/api/auth/check");

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

    } catch (error) {
        window.location.href = "login.html";
    }
}

checkLogin();

