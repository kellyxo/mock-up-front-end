const API_URL = 'https://memory-lane-app-3b70407d74bf.herokuapp.com/japp';
let currentUser = localStorage.getItem('currentUser');

// Redirect to login if currentUser is not set
if (!currentUser && window.location.pathname !== '/index.html') {
    window.location.href = 'index.html';
}

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            if (response.status === 200) {
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);  // Store current user in localStorage
                console.log("Login successful");
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('createEntryForm').style.display = 'block';
                document.getElementById('feed-section').style.display = 'block';
                if (document.getElementById('profileIcon')) {
                    document.getElementById('profileIcon').style.display = 'block'; // Show profile icon
                }
                fetchEntries();  // Fetch entries after login
            }
        } catch (error) {
            alert('Login failed. Please try again.');
        }
    });

    // Handle register button click
    document.getElementById('registerButton').addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });

    // Handle registration form submission
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        try {
            const response = await axios.post(`${API_URL}/create/User`, { username, email, password });
            if (response.status === 200) {
                alert('Registration successful! Thank you for registering.');
                document.getElementById('registerForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        }
    });

    // Handle create entry form submission
    document.getElementById('create-entry-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const textEntry = document.getElementById('entry-content').value.trim();
        const imageFile = document.getElementById('entry-image').files[0];

        const formData = new FormData();
        formData.append('entryData', new Blob([JSON.stringify({
            textEntry,
            username: currentUser,
            createdAt: new Date().toISOString()
        })], {
            type: "application/json"
        }));
        formData.append('file', imageFile);

        try {
            const response = await axios.post(`${API_URL}/create`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 200) {
                alert('Entry created successfully!');
                fetchEntries();  // Refresh the entries list after creating an entry
            }
        } catch (error) {
            console.error('Error creating entry:', error);
            alert('Failed to create entry. Please try again.');
        }
    });

    // Fetch journal entries for a user
    function fetchEntries() {
        fetch(`${API_URL}/entries/${currentUser}`)
            .then(response => {
                if (!response.ok) {
                    // If no content or error, resolve to empty array
                    return [];
                }
                return response.json();
            })
            .then(entries => {
                const feedContainer = document.getElementById('feed');
                feedContainer.innerHTML = ''; // Clear existing entries

                if (entries.length === 0) {
                    // If no entries, display a message or keep it empty
                    const noEntriesMessage = document.createElement('p');
                    noEntriesMessage.textContent = "No journal entries yet. Start by creating one!";
                    feedContainer.appendChild(noEntriesMessage);
                } else {
                    entries.forEach(entry => {
                        const entryDiv = document.createElement('div');
                        entryDiv.classList.add('journal-entry');
                        entryDiv.style.cursor = 'pointer'; // Make the entry clickable

                        // Create an image element
                        const img = document.createElement('img');
                        img.src = entry.imageUrl;  // Use the image URL from the backend
                        img.alt = 'Journal Entry Image';
                        img.classList.add('img-thumbnail');

                        // Create a text element
                        const text = document.createElement('p');
                        text.textContent = entry.textEntry; // Display the text

                        // Create a date element
                        const date = document.createElement('p');
                        date.textContent = `Created on: ${new Date(entry.createdAt).toLocaleDateString()}`;
                        date.classList.add('text-muted');

                        // Append to the entry div
                        entryDiv.appendChild(img);
                        entryDiv.appendChild(text);
                        entryDiv.appendChild(date);

                        // Add click event to enlarge the entry
                        entryDiv.addEventListener('click', () => {
                            document.getElementById('modal-image').src = entry.imageUrl;
                            document.getElementById('modal-text').textContent = entry.textEntry;
                            document.getElementById('modal-date').textContent = `Created on: ${new Date(entry.createdAt).toLocaleDateString()}`;
                            $('#entryModal').modal('show');  // Show the modal
                        });

                        // Append the entry div to the feed container
                        feedContainer.appendChild(entryDiv);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching journal entries:', error);
                // Display a friendly message in case of an error
                const feedContainer = document.getElementById('feed');
                feedContainer.innerHTML = '<p>Could not load journal entries. Please try again later.</p>';
            });
    }

    // Profile icon click event to redirect to profile page
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            window.location.href = "profile.html";
        });
    }

});
