$(document).ready(function () {
    const usersContainer = $('.ins-api-users');
    const toggleDarkModeButton = $('#toggle-dark-mode');
    const resetDataButton = $('#reset-data');

    const applyDarkMode = (isDark) => {
        if (isDark) {
            $('body').addClass('dark-mode');
            toggleDarkModeButton.text('Light Mode');
        } else {
            $('body').removeClass('dark-mode');
            toggleDarkModeButton.text('Dark Mode');
        }
    }

    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    applyDarkMode(isDarkMode);

    toggleDarkModeButton.click(() => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        applyDarkMode(isDarkMode);
    });

    // reset data
    resetDataButton.click(() => {
        localStorage.removeItem('usersData');
        localStorage.removeItem('lastFetchTime');
        fetchUsers();
    });

    // dark mode - hoisting (tanımmlandığı yerden yukarıda çağrılamaz)
    // const applyDarkMode = (isDark) => {
    //     if (isDark) {
    //         $('body').addClass('dark-mode');
    //         toggleDarkModeButton.text('Light Mode');
    //     } else {
    //         $('body').removeClass('dark-mode');
    //         toggleDarkModeButton.text('Dark Mode');
    //     }
    // }

    async function fetchUsers() {
        const lastFetchTime = localStorage.getItem('lastFetchTime');
        const usersData = localStorage.getItem('usersData');

        if (usersData && lastFetchTime && (Date.now() - lastFetchTime < 86400000)) {
            renderUsers(JSON.parse(usersData));
        } else {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/users');
                if(!response.ok) throw new Error('The API cannot be reached. Please try again later.');

                const data = await response.json();
                localStorage.setItem('usersData', JSON.stringify(data));
                localStorage.setItem('lastFetchTime', Date.now());
                renderUsers(data);

                // console.log(data)
            } catch (error) {
                showError(error.message);
            }
        }
    }

    const renderUsers = (users) => {
        // clear container
        usersContainer.empty();
        users.forEach(user => {
            const userCard = $(`
                <div class='user-card' data-id='${user.id}'>
                    <h2>${user.name}</h2>
                    <p>Email: ${user.email}</p>
                    <p>Adres: ${user.address.street}, ${user.address.city}</p>
                    <button class="delete-user">Delete</button>
                </div>
            `);
            usersContainer.append(userCard);
        });

        // click event for delete btn
        $('.delete-user').click((e) => {
            const userId = $(e.currentTarget).closest('.user-card').data('id');
            deleteUser(userId);
        });
    }

    // arrow func x this --> bind
    const deleteUser = (userId) => {
        const userCard = $(`.user-card[data-id="${userId}"]`);
        userCard.animate({ opacity: 0, marginTop: -50 }, 300, function() {
            $(this).remove();
        }.bind(this));

        let users = JSON.parse(localStorage.getItem('usersData'));
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('usersData', JSON.stringify(users));

        renderUsers(users); // bunu eklemeden önce silinen kartlarda boşluk 

        showToast('✅ User deleted successfully.');
    }

    // show error message
    const showError = (message) => {
        const errorMessage = $(`<div class="error-message">${message}</div>`);
        usersContainer.append(errorMessage);
    } 

    const showToast = (message) => {
        const toast = $(`<div class="toast">${message}</div>`);
        $('body').append(toast);
        setTimeout(() => toast.addClass('show'), 100);
        setTimeout(() => {
            toast.removeClass('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    $('#sort-by-name').click(() => sortUsers('name'));
    $('#sort-by-email').click(() => sortUsers('email'));
    $('#sort-by-city').click(() => sortUsers('city'));


    const sortUsers = (sortBy) => {
        let users = JSON.parse(localStorage.getItem('usersData'));
       // users.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));

        console.log('Sorting by:', sortBy);
        console.log('Sample user:', users[0]);

       users.sort((a, b) => {
        // Güvenli değer ataması: undefined olanlara boş string veriyoruz
        let aValue = '';
        let bValue = '';

        if (sortBy === 'city') {
            aValue = a.address && a.address.city ? a.address.city.toLowerCase() : '';
            bValue = b.address && b.address.city ? b.address.city.toLowerCase() : '';
        } else if (sortBy === 'email' || sortBy === 'name') {
            aValue = a[sortBy] ? a[sortBy].toLowerCase() : '';
            bValue = b[sortBy] ? b[sortBy].toLowerCase() : '';
        }
        

        return aValue.localeCompare(bValue);
        });
        renderUsers(users);

        const emojiMap = {
            name: '👤',
            email: '✉️',
            city: '🏙️'
        };
        showToast(`${emojiMap[sortBy]} Users sorted by ${sortBy}.`);

    }

    // filtering 
    // güvenlik konrolü eklediğim için aşağıdaki çalışmıyor:
    // $('#search-button').click(() => {
    //     const searchTerm = $('#search-input').val().toLowerCase();
    //     let users = JSON.parse(localStorage.getItem('usersData'));
    //     const filteredUsers = users.filter(user => 
    //         user.name.toLowerCase().includes(searchTerm) ||
    //         user.address.city.toLowerCase().includes(searchTerm)
    //     );
    //     renderUsers(filteredUsers);
    //     showToast(`Showing results for ${searchTerm}.`);
    // });

    $('#search-button').click(() => {
        const searchTerm = $('#search-input').val().toLowerCase();
        let users = JSON.parse(localStorage.getItem('usersData'));
        const filteredUsers = users.filter(user => {
            // Güvenli kontroller ekleyelim
            const userName = user.name ? user.name.toLowerCase() : '';
            const userCity = user.address && user.address.city ? user.address.city.toLowerCase() : '';
            
            return userName.includes(searchTerm) || userCity.includes(searchTerm);
        });
        renderUsers(filteredUsers);
        showToast(`Showing results for ${searchTerm}.`);
    });

    fetchUsers();

});


const styles = `
    body {
        font-family: 'Roboto', sans-serif;
        background: linear-gradient(135deg, #f4f4f9, #e0e0f0);
        color: #333;
        transition: background 0.5s, color 0.5s;
        animation: gradientAnimation 10s ease infinite;
    }

    .dark-mode {
        background: linear-gradient(135deg, #0a0a1a, #1a1a2a);
        color: #fff;
        animation: gradientAnimation 10s ease infinite;
    }

    @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .controls {
        margin-bottom: 20px;
    }

    .search-bar {
        margin: 10px 0;
    }

    .search-bar input {
        padding: 10px;
        width: 200px;
        border: none;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.1);
        color: #333;
        transition: background-color 0.3s;
    }

    .search-bar input:focus {
        background-color: rgba(255, 255, 255, 0.2);
        outline: none;
    }

    .sort-buttons button {
        margin-right: 10px;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.1);
        color: #333;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
    }

    .sort-buttons button:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    .sort-buttons button:active {
        transform: translateY(0);
    }

    .user-card {
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s, background-color 0.3s;
    }

    .user-card:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: rgba(255, 255, 255, 1);
    }

    .user-card:active {
        transform: scale(0.95);
    }

    .user-card h2 {
        margin: 0;
        font-size: 1.5em;
        color: #333;
    }

    .user-card p {
        margin: 5px 0;
        color: #555;
    }

    .delete-user {
        background-color: #ff4d4d;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .delete-user:hover {
        background-color: #cc0000;
    }

    .error-message {
        color: #ff4d4d;
        font-weight: bold;
        margin-top: 20px;
    }

    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6f61, #ff4d4d);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.5s, transform 0.5s;
    }

    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }

    

    #toggle-dark-mode, #reset-data, #search-button, .sort-buttons button {
        padding: 10px 15px;
        border: none;
        border-radius: 8px; /* Daha yuvarlak köşeler */
        background: linear-gradient(135deg, #6a11cb, #2575fc); /* Mor ve mavi gradient */
        color: white;
        cursor: pointer;
        transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    #toggle-dark-mode:hover, #reset-data:hover, #search-button:hover, .sort-buttons button:hover {
        background: linear-gradient(135deg, #2575fc, #6a11cb); /* Gradient renkleri ters çevir */
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    #toggle-dark-mode:active, #reset-data:active, #search-button:active, .sort-buttons button:active {
        transform: translateY(0);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    
    .dark-mode #toggle-dark-mode, .dark-mode #reset-data, .dark-mode #search-button, .dark-mode .sort-buttons button {
        color: white; /* Dark mode'da yazı rengi */
    }

    
    #search-button {
        background: linear-gradient(135deg, #00b09b, #96c93d); /* Yeşil gradient */
        color: white;
    }

    #search-button:hover {
        background: linear-gradient(135deg, #96c93d, #00b09b); /* Gradient renkleri ters çevir */
    }

    
    #reset-data {
        background: linear-gradient(135deg, #ff416c, #ff4b2b); /* Kırmızı gradient */
        color: white;
    }

    #reset-data:hover {
        background: linear-gradient(135deg, #ff4b2b, #ff416c); /* Gradient renkleri ters çevir */
    }

    
    #toggle-dark-mode {
        background: linear-gradient(135deg, #ff9a9e, #fad0c4); /* Pastel gradient */
        color: #333; /* Light mode'da yazı rengi */
    }

    #toggle-dark-mode:hover {
        background: linear-gradient(135deg, #fad0c4, #ff9a9e); /* Gradient renkleri ters çevir */
    }

    
    .dark-mode #toggle-dark-mode {
        background: linear-gradient(135deg, #4b6cb7, #182848); /* Koyu gradient */
        color: white;
    }

    .dark-mode #toggle-dark-mode:hover {
        background: linear-gradient(135deg, #182848, #4b6cb7); /* Gradient renkleri ters çevir */
    }

    .user-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.9));
    border-radius: 12px; /* Daha yuvarlak köşeler */
    padding: 15px;
    margin-bottom: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
}

.user-card:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(245, 245, 245, 1));
}

.user-card:active {
    transform: scale(0.95);
}

.user-card h2 {
    margin: 0;
    font-size: 1.5em;
    color: #333;
}

.user-card p {
    margin: 5px 0;
    color: #555;
}

.delete-user {
    background: linear-gradient(135deg, #ff416c, #ff4b2b); 
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
}

.delete-user:hover {
    background: linear-gradient(135deg, #ff4b2b, #ff416c); 
    transform: translateY(-2px);
}

.delete-user:active {
    transform: translateY(0);
}
    body {
    font-family: 'Roboto', sans-serif;
    background: linear-gradient(135deg, #f4f4f9, #e0e0f0);
    color: #333;
    transition: background 0.5s, color 0.5s;
    animation: gradientAnimation 10s ease infinite;
}

.dark-mode {
    background: linear-gradient(135deg, #0a0a1a, #1a1a2a);
    color: #fff;
    animation: gradientAnimation 10s ease infinite;
}

@keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
`;

$('head').append(`<style>${styles}</style>`);