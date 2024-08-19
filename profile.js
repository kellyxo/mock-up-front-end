// profile.js
const API_URL = 'https://memory-lane-app-3b70407d74bf.herokuapp.com/japp';
let currentUser = localStorage.getItem('currentUser');

const $ = (selector) => document.querySelector(selector);

const fetchUserProfile = async (username) => {
    try {
        const response = await axios.get(`${API_URL}/getUser`, { params: { username } });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

const updateProfile = async (username, newData) => {
    try {
        const response = await axios.patch(`${API_URL}/updateUser/${username}`, newData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

const displayProfile = (user) => {
    $('#profile-username').textContent = user.username;
    $('#profile-email').textContent = user.email;
    // Add more profile fields as needed
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const userProfile = await fetchUserProfile(currentUser);
        displayProfile(userProfile);
    } catch (error) {
        alert('Failed to load profile. Please try again later.');
    }

    $('#update-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEmail = $('#new-email').value.trim();
        const newPassword = $('#new-password').value;

        try {
            await updateProfile(currentUser, { email: newEmail, password: newPassword });
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile. Please try again.');
        }
    });

    $('#logout-button').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});
