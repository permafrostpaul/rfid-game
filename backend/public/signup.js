document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');

    // Get the new card's UID from the URL
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');

    if (!uid) {
        errorMessage.textContent = 'Error: No RFID UID found. Please scan your card again.';
        signupForm.style.display = 'none';
        return;
    }

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const name = document.getElementById('name').value;
        const studentNumber = document.getElementById('student-number').value;

        if (!name || !studentNumber) {
            errorMessage.textContent = 'Please fill out all fields.';
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: uid,
                    name: name,
                    studentNumber: studentNumber
                })
            });

            const result = await response.json();

            if (response.ok && result.status === 'registration_success') {
                // Registration successful, redirect to the game page
                window.location.href = '/';
            } else {
                errorMessage.textContent = result.message || 'Registration failed. Please try again.';
            }

        } catch (error) {
            console.error('Error during registration:', error);
            errorMessage.textContent = 'A network error occurred. Please try again.';
        }
    });
});