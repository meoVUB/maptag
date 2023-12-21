document.addEventListener('DOMContentLoaded', function () {
    const likeButtons = document.querySelectorAll('.game-like');
    const dislikeButtons = document.querySelectorAll('.game-dislike');

    likeButtons.forEach(button => {
        button.addEventListener('click', () => handleLike(button));
    });

    dislikeButtons.forEach(button => {
        button.addEventListener('click', () => handleDislike(button));
    });

    function handleLike(button) {
        const gameId = findElement(button, '.hidden-game-id').textContent;
        sendRating(gameId, 'like', button);
    }

    function handleDislike(button) {
        const gameId = findElement(button, '.hidden-game-id').textContent;
        sendRating(gameId, 'dislike', button);
    }

    function sendRating(gameId, action, button) {
        // Send AJAX request to your Django backend
        fetch(`/rate_game/${gameId}/${action}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),  // Include CSRF token
            },
        })
            .then(response => response.json())
            .then(data => updateUI(data, button));  // Update UI based on response
    }

    function updateUI(data, button) {

        const likesElement = findElement(button, '.game-likes')
        const dislikesElement = findElement(button, '.game-dislikes')

        likesElement.textContent = data.likes;
        dislikesElement.textContent = data.dislikes;

    }

    function findElement(button, element) {
        let currentElement = button;
        while (currentElement && !currentElement.classList.contains('game')) {
            currentElement = currentElement.parentElement;
        }

        if (currentElement) {
            const hiddenGameIdElement = currentElement.querySelector(element);
            return hiddenGameIdElement
        }

        return null;
    }

    // Helper function to get CSRF token from cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});