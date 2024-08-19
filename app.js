const API_URL = 'https://memory-lane-app-3b70407d74bf.herokuapp.com/japp';
let currentUser = localStorage.getItem('currentUser');

const $ = id => document.getElementById(id);
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

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
const fetchEntries = (username) => apiCall(`/entries/${username}`);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    $('login-form').addEventListener('submit', handleLogin);
    $('registerButton').addEventListener('click', () => {
        hide($('loginForm'));
        show($('registerForm'));
    });
    $('register-form').addEventListener('submit', handleRegister);
    $('create-entry-form').addEventListener('submit', handleCreateEntry);
    $('profileIcon').addEventListener('click', () => {
        window.location.href = "profile.html";
    });

    if (currentUser) {
        updateUIAfterLogin();
    }
});

// Handler Functions
async function handleLogin(e) {
    e.preventDefault();
    const username = $('login-username').value.trim();
    const password = $('login-password').value;
    try {
        await login(username, password);
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        updateUIAfterLogin();
    } catch (error) {
        alert('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = $('register-username').value.trim();
    const email = $('register-email').value.trim();
    const password = $('register-password').value;
    try {
        await register(username, email, password);
        alert('Registration successful! Please log in.');
        hide($('registerForm'));
        show($('loginForm'));
    } catch (error) {
        alert('Registration failed. Please try again.');
    }
}

async function handleCreateEntry(e) {
    e.preventDefault();
    const textEntry = $('entry-content').value;
    const imageFile = $('entry-image').files[0];

    const formData = new FormData();
    formData.append('entryData', new Blob([JSON.stringify({
        textEntry,
        username: currentUser,
        createdAt: new Date().toISOString()
    })], { type: "application/json" }));
    formData.append('file', imageFile);

    try {
        const response = await axios.post(`${API_URL}/create`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.status === 200) {
            alert('Entry created successfully!');
            fetchAndDisplayEntries();
        }
    } catch (error) {
        console.error('Error creating entry:', error);
        alert('Failed to create entry. Please try again.');
    }
}

function updateUIAfterLogin() {
    hide($('loginForm'));
    show($('createEntryForm'));
    show($('feed-section'));
    show($('profileIcon'));
    fetchAndDisplayEntries();
}

async function fetchAndDisplayEntries() {
    try {
        const entries = await fetchEntries(currentUser);
        displayEntries(entries);
    } catch (error) {
        console.error('Error fetching entries:', error);
        $('feed').innerHTML = '<p>Could not load journal entries. Please try again later.</p>';
    }
}

function displayEntries(entries) {
    const feedContainer = $('feed');
    feedContainer.innerHTML = entries.length ? entries.map(createEntryHTML).join('') : '<p>No journal entries yet. Start by creating one!</p>';
}

function createEntryHTML(entry) {
    return `
        <div class="gallery-item" onclick="showEntryModal('${entry.id}')">
            <img src="${entry.imageUrl}" alt="Journal Entry Image">
            <p>${entry.textEntry.substring(0, 50)}...</p>
            <p class="text-muted">Created on: ${new Date(entry.createdAt).toLocaleDateString()}</p>
        </div>
    `;
}

// Modal functionality
window.showEntryModal = (entryId) => {
    const entry = document.querySelector(`.gallery-item[onclick*="${entryId}"]`);
    if (entry) {
        $('modal-image').src = entry.querySelector('img').src;
        $('modal-text').textContent = entry.querySelector('p:not(.text-muted)').textContent;
        $('modal-date').textContent = entry.querySelector('.text-muted').textContent;
        $('entryModal').style.display = 'block';
    }
};

$('entryModal').querySelector('.close').onclick = () => {
    $('entryModal').style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == $('entryModal')) {
        $('entryModal').style.display = 'none';
    }
};
