let notes = [];
let editingNoteId = null;

function loadNotes() {
  const savedNotes = localStorage.getItem("quickNotes");
  return savedNotes ? JSON.parse(savedNotes) : [];
}

function saveNote(event) {
  event.preventDefault();

  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();

  notes.unshift({
    id: generateId(),
    title: title,
    content: content,
  });

  saveNotes();
  renderNotes();
}

function generateId() {
  return Date.now().toString();
}

function saveNotes() {
  localStorage.setItem("quickNotes", JSON.stringify(notes));
}

function deleteNote(noteId) {
  notes = notes.filter((note) => note.id !== noteId);
  saveNotes();
  renderNotes();
}

function renderNotes() {
  const notesContainer = document.getElementById("notesContainer");

  if (notes.length === 0) {
    notesContainer.innerHTML = `
    <div class="empty-state">
    <h2>No notes yet</h2>
    <p>Create your first note to get started!</p>
    <button class="add-note-btn" onclick="openNoteDialog()">Add Your First Note</button>
    </div>
    `;
    return;
  }

  notesContainer.innerHTML = notes
    .map(
      (note) => `
        <div class="note-card">
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content}</p>
            <div class="note-actions">
            

            <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM18 5l-3-3L2 12v6h6l12-12z"></path>
            </svg>
            </button>

            <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm3-10h2v8H9v-8zm4 0h2v8h-2v-8zM5 5h14l-1.5-1.5H6.5L5 5zM19 4H5c-1.1 0-2 .9-2 2v1h18V6c0-1.1-.9-2-2-2z"></path>
            </svg>
            </button>
            </div>
        </div>
        `
    )
    .join("");
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById("noteDialog");
  const titleInput = document.getElementById("noteTitle");
  const contentInput = document.getElementById("noteContent");

  if (noteId) {
    const noteToEdit = notes.find((note) => note.id === noteId);
    editingNoteId = noteId;
    document.getElementById("dialogTitle").textContent = "Edit Note";
    titleInput.value = noteToEdit.title;
    contentInput.value = noteToEdit.content;
  } else {
    editingNoteId = null;
    document.getElementById("dialogTitle").textContent = "Add New Note";
    titleInput.value = "";
    contentInput.value = "";
  }

  dialog.showModal();
  titleInput.focus();
}

function closeNoteDialog() {
  document.getElementById("noteDialog").close();
}

document.addEventListener("DOMContentLoaded", function () {
  notes = loadNotes();
  renderNotes();

  document.getElementById("noteForm").addEventListener("submit", saveNote);

  document
    .getElementById("noteDialog")
    .addEventListener("click", function (event) {
      if (event.target === this) {
        closeNoteDialog();
      }
    });
});
console.log("uptime", os.uptime() / 60 / 60, "hours");
