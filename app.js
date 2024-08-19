const API_URL = 'https://memory-lane-app-3b70407d74bf.herokuapp.com/japp';
let currentUser = localStorage.getItem('currentUser');

axios.defaults.withCredentials = true;

// Utility functions
const $ = id => document.getElementById(id);
const show = el => el.style.display = 'block';
const hide = el => el.style.display = 'none';

// Redirect to login if currentUser is not set
if (!currentUser && window.location.pathname !== '/index.html') {
    window.location.href = 'index.html';
}

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Handle login form submission
    $('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = $('login-username').value;
        const password = $('login-password').value;

        console.log('Sending login request with payload:', { username, password: '*'.repeat(password.length) });

        try {
            const response = await axios.post(`${API_URL}/login`, { username, password }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 200) {
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);
                console.log("Login successful");
                hide($('loginForm'));
                show($('createEntryForm'));
                show($('feed-section'));
                const profileIcon = $('profileIcon');
                if (profileIcon) show(profileIcon);
                fetchEntries();
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                console.error('Response:', error.response.data, error.response.status, error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            alert('Login failed. Please try again.');
        }
    });

    // Handle register button click
    $('registerButton').addEventListener('click', () => {
        hide($('loginForm'));
        show($('registerForm'));
    });

    // Handle registration form submission
    $('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = $('register-username').value;
        const email = $('register-email').value;
        const password = $('register-password').value;

        try {
            const response = await axios.post(`${API_URL}/create/User`, { username, email, password });
            if (response.status === 200) {
                alert('Registration successful! Thank you for registering.');
                hide($('registerForm'));
                show($('loginForm'));
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        }
    });

    // Handle create entry form submission
    $('create-entry-form').addEventListener('submit', async (e) => {
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
                fetchEntries();
            }
        } catch (error) {
            console.error('Error creating entry:', error);
            alert('Failed to create entry. Please try again.');
        }
    });

    // Fetch journal entries for a user
    async function fetchEntries() {
        try {
            const response = await fetch(`${API_URL}/entries/${currentUser}`);
            if (!response.ok) return [];
            const entries = await response.json();
            displayEntries(entries);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            $('feed').innerHTML = '<p>Could not load journal entries. Please try again later.</p>';
        }
    }

    function displayEntries(entries) {
        const feedContainer = $('feed');
        feedContainer.innerHTML = '';

        if (entries.length === 0) {
            feedContainer.innerHTML = "<p>No journal entries yet. Start by creating one!</p>";
        } else {
            const entriesHTML = entries.map(entry => `
                <div class="journal-entry" style="cursor: pointer;" onclick="showEntryModal('${entry.id}')">
                    <img src="${entry.imageUrl}" alt="Journal Entry Image" class="img-thumbnail">
                    <p>${entry.textEntry}</p>
                    <p class="text-muted">Created on: ${new Date(entry.createdAt).toLocaleDateString()}</p>
                </div>
            `).join('');
            feedContainer.innerHTML = entriesHTML;
        }
    }

    // Profile icon click event to redirect to profile page
    const profileIcon = $('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            window.location.href = "profile.html";
        });
    }
});

// Modal functionality (assuming you're using Bootstrap modal)
window.showEntryModal = (entryId) => {
    const entry = document.querySelector(`.journal-entry[onclick*="${entryId}"]`);
    if (entry) {
        $('modal-image').src = entry.querySelector('img').src;
        $('modal-text').textContent = entry.querySelector('p:not(.text-muted)').textContent;
        $('modal-date').textContent = entry.querySelector('.text-muted').textContent;
        $('#entryModal').modal('show');
    }
};
