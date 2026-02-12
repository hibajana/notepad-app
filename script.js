// DOM Elements
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');

// Modal elements
const noteModal = document.getElementById('noteModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalNoteTitle = document.getElementById('modalNoteTitle');
const modalNoteContent = document.getElementById('modalNoteContent');
const modalNoteCreated = document.getElementById('modalNoteCreated');
const modalNoteModified = document.getElementById('modalNoteModified');

// State
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let editingNoteId = null;

// Event Listeners
noteForm.addEventListener('submit', handleNoteSubmit);
searchInput.addEventListener('input', filterNotes);
dateFilter.addEventListener('change', filterNotes);

// Initialize
renderNotes();

// Functions
function handleNoteSubmit(e) {
    e.preventDefault();
    
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title || !content) return;
    
    if (editingNoteId !== null) {
        // Update existing note
        const noteIndex = notes.findIndex(note => note.id === editingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                content,
                lastModified: new Date().toISOString()
            };
        }
        editingNoteId = null;
    } else {
        // Create new note
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        notes.unshift(newNote);
    }
    
    saveNotes();
    renderNotes();
    noteForm.reset();
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
}

function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
        editingNoteId = id;
        noteTitle.focus();
    }
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const dateFilterValue = dateFilter.value;
    
    let filteredNotes = notes;
    
    // Apply search filter
    if (searchTerm) {
        filteredNotes = filteredNotes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply date filter
    if (dateFilterValue !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        
        filteredNotes = filteredNotes.filter(note => {
            const noteDate = new Date(note.createdAt);
            switch (dateFilterValue) {
                case 'today':
                    return noteDate >= today;
                case 'week':
                    return noteDate >= weekAgo;
                case 'month':
                    return noteDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    renderNotes(filteredNotes);
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showNoteModal(note) {
    modalNoteTitle.textContent = note.title;
    modalNoteContent.textContent = note.content;
    modalNoteCreated.textContent = 'Créé le : ' + formatDate(note.createdAt);
    modalNoteModified.textContent = 'Modifié le : ' + formatDate(note.lastModified);
    noteModal.classList.remove('hidden');
}

function hideNoteModal() {
    noteModal.classList.add('hidden');
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideNoteModal);
}
if (noteModal) {
    noteModal.addEventListener('click', function(e) {
        if (e.target === noteModal) hideNoteModal();
    });
}

function renderNotes(notesToRender = notes) {
    notesContainer.innerHTML = '';

    if (notesToRender.length === 0) {
        notesContainer.innerHTML = '<p class="no-notes text-neutral-400 text-center">Aucune note trouvée</p>';
        return;
    }

    notesToRender.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'bg-neutral-800 rounded-lg shadow-md p-4 flex flex-col gap-2';
        noteElement.innerHTML = `
            <h3 class="text-lg font-semibold text-neutral-100">${note.title}</h3>
            <p class="text-neutral-200 whitespace-pre-line">${note.content}</p>
            <div class="text-xs text-neutral-400 mt-2">Créé le : ${formatDate(note.createdAt)}</div>
            <div class="flex gap-2 mt-2">
                <button class="px-3 py-1 bg-white text-purple-700 rounded hover:bg-purple-100 text-xs font-medium" onclick="editNote('${note.id}')">Éditer</button>
                <button class="px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-800 text-xs font-medium" onclick="deleteNote('${note.id}')">Supprimer</button>
            </div>
        `;
        notesContainer.appendChild(noteElement);
    });
}

// Helper to find note by id and show modal
function showNoteModalById(id) {
    const note = notes.find(n => n.id === id);
    if (note) showNoteModal(note);
}
// Expose for inline onclick
window.showNoteModalById = showNoteModalById; 