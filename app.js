// app.js
const API_URL = 'https://memory-lane-app-3b70407d74bf.herokuapp.com/japp';
let currentUser = localStorage.getItem('currentUser');

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const showElement = (el) => el.style.display = 'block';
const hideElement = (el) => el.style.display = 'none';

// API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
        const config = {
            method,
            headers: { 'Content-Type': 'application/json' },
            ...(data && { data: JSON.stringify(data) })
        };
        const response = await axios(`${API_URL}${endpoint}`, config);
        return response.data;
    } catch (error) {
        console.error(`API call error (${endpoint}):`, error);
        throw error;
    }
};

const login = (username, password) => apiCall('/login', 'POST', { username, password });
const register = (username, email, password) => apiCall('/create/User', 'POST', { username, email, password });
const createEntry = (entryData, file) => {
    const formData = new FormData();
    formData.append('entryData', new Blob([JSON.stringify(entryData)], { type: 'application/json' }));
    formData.append('file', file);
    return apiCall('/create', 'POST', formData);
};
const fetchEntries = (username) => apiCall(`/entries/${username}`);

// DOM manipulation
const updateUIAfterLogin = () => {
    hideElement($('#loginForm'));
    showElement($('#createEntryForm'));
    showElement($('#feed-section'));
    showElement($('#profileIcon'));
    fetchEntries(currentUser).then(displayEntries).catch(console.error);
};

const displayEntries = (entries) => {
    const feedContainer = $('#feed');
    feedContainer.innerHTML = entries.length ? entries.map(createEntryHTML).join('') : '<p>No entries yet. Start journaling!</p>';
};

const createEntryHTML = (entry) => `
    <div class="journal-entry" onclick="showEntryModal('${entry.id}')">
        <img src="${entry.imageUrl}" alt="Journal Entry Image" class="img-thumbnail">
        <p>${entry.textEntry}</p>
        <p class="text-muted">Created on: ${new Date(entry.createdAt).toLocaleDateString()}</p>
    </div>
`;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    $('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = $('#login-username').value.trim();
        const password = $('#login-password').value;
        try {
            await login(username, password);
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            updateUIAfterLogin();
        } catch (error) {
            alert('Login failed. Please try again.');
        }
    });

    $('#registerButton').addEventListener('click', () => {
        hideElement($('#loginForm'));
        showElement($('#registerForm'));
    });

    $('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = $('#register-username').value.trim();
        const email = $('#register-email').value.trim();
        const password = $('#register-password').value;
        try {
            await register(username, email, password);
            alert('Registration successful! Please log in.');
            hideElement($('#registerForm'));
            showElement($('#loginForm'));
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
    });

    $('#create-entry-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const textEntry = $('#entry-content').value;
        const imageFile = $('#entry-image').files[0];
        const entryData = { textEntry, username: currentUser, createdAt: new Date().toISOString() };
        try {
            await createEntry(entryData, imageFile);
            alert('Entry created successfully!');
            fetchEntries(currentUser).then(displayEntries).catch(console.error);
        } catch (error) {
            alert('Failed to create entry. Please try again.');
        }
    });

    if (currentUser) {
        updateUIAfterLogin();
    }
});

// Modal functionality
window.showEntryModal = (entryId) => {
    // Implement modal display logic here
};
