// Supabase config (using config.js)
const SUPABASE_URL = window.SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const addPetBtn = document.getElementById('addPetBtn');
const addPetModal = document.getElementById('addPetModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addPetForm = document.getElementById('addPetForm');
const petsGrid = document.getElementById('petsGrid');
const logoutBtn = document.getElementById('logoutBtn');

// Sample pets data (in a real app, this would come from Supabase)
let pets = [
    {
        id: 1,
        name: 'Buddy',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        description: 'A friendly and energetic dog who loves playing fetch and going for walks.'
    },
    {
        id: 2,
        name: 'Whiskers',
        type: 'cat',
        breed: 'Persian',
        age: 2,
        description: 'A calm and affectionate cat who enjoys lounging in sunny spots.'
    }
];

// Check if user is logged in
async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/app/login/login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/app/login/login.html';
    }
}

// Logout function
async function handleLogout() {
    try {
        await supabase.auth.signOut();
        window.location.href = '/website/index.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/website/index.html';
    }
}

// Modal functions
function openModal() {
    addPetModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModalFunc() {
    addPetModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    addPetForm.reset();
}

// Create pet card HTML
function createPetCard(pet) {
    return `
        <div class="pet-card" data-pet-id="${pet.id}">
            <div class="pet-header">
                <h3 class="pet-name">${pet.name}</h3>
                <span class="pet-type">${pet.type}</span>
            </div>
            <div class="pet-info">
                ${pet.breed ? `<p><strong>Breed:</strong> ${pet.breed}</p>` : ''}
                ${pet.age ? `<p><strong>Age:</strong> ${pet.age} years</p>` : ''}
            </div>
            ${pet.description ? `<p class="pet-description">${pet.description}</p>` : ''}
            <div class="pet-actions">
                <button class="pet-action-btn edit-btn" onclick="editPet(${pet.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="pet-action-btn delete-btn" onclick="deletePet(${pet.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Render pets
function renderPets() {
    if (pets.length === 0) {
        petsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paw"></i>
                <h3>No pets yet</h3>
                <p>Add your first pet to get started!</p>
            </div>
        `;
    } else {
        petsGrid.innerHTML = pets.map(pet => createPetCard(pet)).join('');
    }
}

// Add new pet
async function addPet(petData) {
    try {
        // In a real app, you would save to Supabase here
        // const { data, error } = await supabase
        //     .from('pets')
        //     .insert([petData]);
        
        // For now, we'll just add to local array
        const newPet = {
            id: Date.now(), // Simple ID generation
            ...petData
        };
        
        pets.push(newPet);
        renderPets();
        closeModalFunc();
        
        // Show success message
        showMessage('Pet added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding pet:', error);
        showMessage('Failed to add pet. Please try again.', 'error');
    }
}

// Edit pet (placeholder)
function editPet(petId) {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
        alert(`Edit functionality for ${pet.name} coming soon!`);
    }
}

// Delete pet
function deletePet(petId) {
    const pet = pets.find(p => p.id === petId);
    if (pet && confirm(`Are you sure you want to delete ${pet.name}?`)) {
        pets = pets.filter(p => p.id !== petId);
        renderPets();
        showMessage(`${pet.name} has been removed.`, 'success');
    }
}

// Show message
function showMessage(message, type = 'info') {
    // Create a simple message display
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#28a745';
    } else if (type === 'error') {
        messageDiv.style.background = '#dc3545';
    } else {
        messageDiv.style.background = '#17a2b8';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderPets();
    
    // Event listeners
    addPetBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Close modal when clicking outside
    addPetModal.addEventListener('click', (e) => {
        if (e.target === addPetModal) {
            closeModalFunc();
        }
    });
    
    // Handle form submission
    addPetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(addPetForm);
        const petData = {
            name: formData.get('petName'),
            type: formData.get('petType'),
            breed: formData.get('petBreed') || null,
            age: formData.get('petAge') ? parseFloat(formData.get('petAge')) : null,
            description: formData.get('petDescription') || null
        };
        
        addPet(petData);
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addPetModal.style.display === 'block') {
            closeModalFunc();
        }
    });
}); 