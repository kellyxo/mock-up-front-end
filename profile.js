const API_URL = 'https://memory-lane-app-3b70407d74bf.herokuapp.com/japp'';
let currentUser = localStorage.getItem('currentUser');

// Ensure user is logged in
if (!currentUser) {
    window.location.href = "index.html"; // Redirect to login if not logged in
}

// Change password logic
document.getElementById('change-password').addEventListener('click', async () => {
    const newPassword = document.getElementById('new-password').value;

    if (!newPassword) {
        alert('Please enter a new password.');
        return;
    }

    try {
        await axios.patch(`${API_URL}/changePassword/${currentUser}`, null, {
            params: { newPassword: newPassword }
        });
        alert('Password updated successfully!');
    } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again.');
    }
});

// Delete account logic
document.getElementById('delete-account').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent and will delete all your entries.')) {
        try {
            const username = localStorage.getItem('currentUser'); // Get the current username
            await axios.request({
                method: 'delete',
                url: `${API_URL}/delete`,
                data: { username: username } // Send username in request body
            });
            alert('Account deleted successfully.');
            localStorage.removeItem('currentUser');
            window.location.href = "index.html";  // Redirect to login page after account deletion
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account. Please try again.');
        }
    }
});
