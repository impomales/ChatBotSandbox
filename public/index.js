import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
// initiate session
    const form = document.getElementById('messageForm')

    form.addEventListener('submit', event => {
        event.preventDefault();
        // send message to server.
        form.reset();
    })
})


