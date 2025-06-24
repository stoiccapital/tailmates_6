// Supabase config (using config.js)
const SUPABASE_URL = window.SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;

console.log('Supabase config loaded:', { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY ? '***' : 'MISSING' });

// Initialize Supabase client
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully');
    console.log('Supabase client object:', supabase);
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    alert('Failed to initialize database connection. Please refresh the page.');
}

// DOM elements
const addPetBtn = document.getElementById('addPetBtn');
const addPetModal = document.getElementById('addPetModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addPetForm = document.getElementById('addPetForm');
const petsGrid = document.getElementById('petsGrid');
const logoutBtn = document.getElementById('logoutBtn');

// Sample pets data (in a real app, this would come from Supabase)
let pets = [];

/**
 * Loads pets from Supabase database
 * @returns {Promise<Array>} - Array of pet objects
 */
async function loadPetsFromSupabase() {
    try {
        // Fetch pets from Supabase
        const { data, error } = await supabase
            .from('pets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading pets:', error);
            showMessage('Failed to load pets. Please refresh the page.', 'error');
            return [];
        }

        return data || [];

    } catch (error) {
        console.error('Unexpected error loading pets:', error);
        showMessage('An unexpected error occurred while loading pets.', 'error');
        return [];
    }
}

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
    
    // Reset modal to "Add Pet" mode
    document.querySelector('.modal-header h2').textContent = 'Add New Pet';
    document.querySelector('.form-actions .btn-primary').textContent = 'Add Pet';
    delete addPetForm.dataset.editPetId;
    
    console.log('🔒 Modal closed and reset');
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
                <button class="pet-action-btn edit-btn" onclick="editPet('${pet.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="pet-action-btn delete-btn" onclick="deletePet('${pet.id}')">
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

/**
 * Updates pet data in Supabase database
 * @param {string} petId - The pet's UUID
 * @param {Object} petData - The updated pet data
 * @returns {Promise<Object>} - Result object with success status and data/error
 */
async function updatePetData(petId, petData) {
    console.log('🔄 updatePetData() called with ID:', petId, 'and data:', petData);
    
    try {
        // Check if Supabase client is initialized
        if (!supabase) {
            console.error('❌ Supabase client not initialized');
            return {
                success: false,
                error: 'Database connection not available'
            };
        }

        // Validate required fields
        if (!petData.name || !petData.type) {
            console.error('❌ Validation failed: missing required fields');
            return {
                success: false,
                error: 'Name and type are required fields'
            };
        }

        // Prepare data for Supabase
        const petRecord = {
            name: petData.name.trim(),
            type: petData.type.toLowerCase(),
            breed: petData.breed ? petData.breed.trim() : null,
            age: petData.age ? parseInt(petData.age) : null,
            description: petData.description ? petData.description.trim() : null
        };

        console.log('📦 Final pet record for update:', petRecord);

        // Update pet data in Supabase
        const { data, error } = await supabase
            .from('pets')
            .update(petRecord)
            .eq('id', petId)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase update error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update pet data'
            };
        }

        console.log('✅ Pet updated successfully:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('💥 Unexpected error in updatePetData:', error);
        return {
            success: false,
            error: 'An unexpected error occurred while updating pet data'
        };
    }
}

// Add new pet or update existing pet
async function addPet(petData) {
    console.log('🎯 addPet() called with data:', petData);
    
    // Check if we're editing an existing pet
    const editPetId = addPetForm.dataset.editPetId;
    
    try {
        let result;
        
        if (editPetId) {
            console.log('✏️ Updating existing pet with ID:', editPetId);
            result = await updatePetData(editPetId, petData);
        } else {
            console.log('🆕 Adding new pet');
            result = await savePetData(petData);
        }
        
        console.log('📊 Operation result:', result);
        
        if (result.success) {
            if (editPetId) {
                console.log('✅ Pet updated successfully, updating UI...');
                // Update the pet in local array
                const index = pets.findIndex(p => p.id === editPetId);
                if (index !== -1) {
                    pets[index] = { ...pets[index], ...petData };
                }
                showMessage('Pet updated successfully!', 'success');
            } else {
                console.log('✅ Pet saved successfully, updating UI...');
                // Add the new pet to local array
                const newPet = {
                    id: result.data.id,
                    ...petData
                };
                pets.push(newPet);
                showMessage('Pet added successfully!', 'success');
            }
            
            renderPets();
            closeModalFunc();
            console.log('🎉 Operation completed successfully');
        } else {
            console.error('❌ Operation failed:', result.error);
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('💥 Error in addPet function:', error);
        console.error('💥 Error stack:', error.stack);
        showMessage('Failed to save pet. Please try again.', 'error');
    }
}

/**
 * Saves pet data to Supabase database
 * @param {Object} petData - The pet data to save
 * @param {string} petData.name - Pet's name
 * @param {string} petData.type - Pet type (dog, cat, etc.)
 * @param {string} petData.breed - Pet breed (optional)
 * @param {number} petData.age - Pet age in years (optional)
 * @param {string} petData.description - Pet description (optional)
 * @returns {Promise<Object>} - Result object with success status and data/error
 */
async function savePetData(petData) {
    console.log('🚀 savePetData() called with:', petData);
    
    try {
        // Check if Supabase client is initialized
        console.log('🔧 Checking Supabase client...');
        if (!supabase) {
            console.error('❌ Supabase client not initialized');
            return {
                success: false,
                error: 'Database connection not available'
            };
        }
        console.log('✅ Supabase client is available');

        // Validate required fields
        console.log('🔍 Validating required fields...');
        if (!petData.name || !petData.type) {
            console.error('❌ Validation failed: missing required fields');
            console.log(`  - Name: "${petData.name}" (required: ${!!petData.name})`);
            console.log(`  - Type: "${petData.type}" (required: ${!!petData.type})`);
            return {
                success: false,
                error: 'Name and type are required fields'
            };
        }
        console.log('✅ Required fields validation passed');

        // Prepare data for Supabase (clean up optional fields)
        console.log('🧹 Preparing data for Supabase...');
        const petRecord = {
            name: petData.name.trim(),
            type: petData.type.toLowerCase(),
            breed: petData.breed ? petData.breed.trim() : null,
            age: petData.age ? parseInt(petData.age) : null,
            description: petData.description ? petData.description.trim() : null
        };

        console.log('📦 Final pet record for insertion:', petRecord);
        console.log('🔗 About to call Supabase insert...');

        // Insert pet data into Supabase
        const { data, error } = await supabase
            .from('pets')
            .insert([petRecord])
            .select()
            .single();

        console.log('📡 Supabase response received:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);

        // Handle Supabase errors
        if (error) {
            console.error('❌ Supabase error occurred:', error);
            console.error('❌ Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return {
                success: false,
                error: error.message || 'Failed to save pet data'
            };
        }

        console.log('✅ Pet saved successfully:', data);

        // Return success with the saved data
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('💥 Unexpected error in savePetData:', error);
        console.error('💥 Error stack:', error.stack);
        return {
            success: false,
            error: 'An unexpected error occurred while saving pet data'
        };
    }
}

// Edit pet
async function editPet(petId) {
    console.log('✏️ Edit pet called for ID:', petId);
    
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
        console.error('❌ Pet not found for editing:', petId);
        showMessage('Pet not found for editing.', 'error');
        return;
    }
    
    console.log('📝 Editing pet:', pet);
    
    // Populate the form with existing data
    document.getElementById('petName').value = pet.name;
    document.getElementById('petType').value = pet.type;
    document.getElementById('petBreed').value = pet.breed || '';
    document.getElementById('petAge').value = pet.age || '';
    document.getElementById('petDescription').value = pet.description || '';
    
    // Change modal title and button
    document.querySelector('.modal-header h2').textContent = 'Edit Pet';
    document.querySelector('.form-actions .btn-primary').textContent = 'Update Pet';
    
    // Store the pet ID for updating
    addPetForm.dataset.editPetId = petId;
    
    // Open modal
    openModal();
}

// Delete pet
async function deletePet(petId) {
    console.log('🗑️ Delete pet called for ID:', petId);
    
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
        console.error('❌ Pet not found for deletion:', petId);
        showMessage('Pet not found for deletion.', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${pet.name}?`)) {
        console.log('❌ Delete cancelled by user');
        return;
    }
    
    try {
        console.log('🔄 Deleting pet from Supabase:', pet);
        
        // Delete from Supabase
        const { error } = await supabase
            .from('pets')
            .delete()
            .eq('id', petId);
        
        if (error) {
            console.error('❌ Supabase delete error:', error);
            showMessage(`Failed to delete ${pet.name}. Please try again.`, 'error');
            return;
        }
        
        console.log('✅ Pet deleted from Supabase successfully');
        
        // Remove from local array
        pets = pets.filter(p => p.id !== petId);
        renderPets();
        
        showMessage(`${pet.name} has been deleted successfully.`, 'success');
        
    } catch (error) {
        console.error('💥 Unexpected error deleting pet:', error);
        showMessage('An unexpected error occurred while deleting the pet.', 'error');
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

/**
 * Test database connection and table access
 * @returns {Promise<Object>} - Result object with connection status
 */
async function testDatabaseConnection() {
    try {
        if (!supabase) {
            return {
                success: false,
                error: 'Supabase client not initialized'
            };
        }

        console.log('Testing database connection...');
        
        // Try to fetch from pets table to test connection
        const { data, error } = await supabase
            .from('pets')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Database connection test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }

        console.log('Database connection test successful');
        return {
            success: true,
            message: 'Database connection working'
        };

    } catch (error) {
        console.error('Unexpected error in database test:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        
        // Test database connection
        const dbTest = await testDatabaseConnection();
        if (!dbTest.success) {
            console.error('Database connection failed:', dbTest.error);
            showMessage(`Database connection failed: ${dbTest.error}`, 'error');
            return;
        }
        
        // Load pets from Supabase
        pets = await loadPetsFromSupabase();
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
            console.log('📝 Form submitted!');
            
            const formData = new FormData(addPetForm);
            console.log('📋 Raw form data:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: "${value}"`);
            }
            
            const petData = {
                name: formData.get('petName'),
                type: formData.get('petType'),
                breed: formData.get('petBreed') || null,
                age: formData.get('petAge') ? parseFloat(formData.get('petAge')) : null,
                description: formData.get('petDescription') || null
            };
            
            console.log('🐾 Processed pet data:', petData);
            console.log('🔍 Data validation:');
            console.log(`  - Name: "${petData.name}" (required: ${!!petData.name})`);
            console.log(`  - Type: "${petData.type}" (required: ${!!petData.type})`);
            console.log(`  - Breed: "${petData.breed}"`);
            console.log(`  - Age: ${petData.age} (type: ${typeof petData.age})`);
            console.log(`  - Description: "${petData.description}"`);
            
            addPet(petData);
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && addPetModal.style.display === 'block') {
                closeModalFunc();
            }
        });
        
    } catch (error) {
        console.error('Error during page initialization:', error);
        showMessage('Failed to initialize page. Please refresh.', 'error');
    }
}); 