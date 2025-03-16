// Kullanıcıları body'ye direkt ekleyelim - container sınıfı kullanmadan
const appendLocation = 'body';

// Renk paletini aldığım site: https://visme.co/blog/website-color-schemes/
const COLORS = {
    red: '#E43D12',
    deepPink: '#D6536D',
    lightPink: '#FFA2B6',
    yellow: '#EFB11D',
    lightBeige: '#EBE9E1' 
};

// style.css
const STYLES = {
    container: `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    `,
    header: `
        text-align: center;
        margin-bottom: 30px;
        color: ${COLORS.deepPink};
    `,
    usersContainer: `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    `,
    userCard: `
        background: linear-gradient(135deg, white, ${COLORS.lightBeige});
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
    `,
    userCardHeader: `
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 15px;
        color: ${COLORS.red};
        display: flex;
        align-items: center;
    `,
    userCardInfo: `
        margin: 8px 0;
        color: #333;
        display: flex;
    `,
    infoIcon: `
        margin-right: 10px;
        color: ${COLORS.deepPink};
    `,
    deleteButton: `
        background: linear-gradient(135deg, ${COLORS.red}, ${COLORS.deepPink});
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        cursor: pointer;
        margin-top: 15px;
        font-weight: bold;
        transition: transform 0.2s ease;
        width: 100%;
    `,
    reloadButton: `
        background: linear-gradient(135deg, ${COLORS.yellow}, ${COLORS.deepPink});
        color: white;
        border: none;
        border-radius: 30px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        display: block;
        margin: 30px auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    `,
    userIcon: `
        display: inline-block;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, ${COLORS.deepPink}, ${COLORS.lightPink});
        border-radius: 50%;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
    `,
    noUsers: `
    text-align: center;
    color: ${COLORS.deepPink};
    margin: 40px 0;
    font-size: 20px;
  `
};

// keys for localStorage
const STORAGE_KEYS = {
    USERS: 'app_users',
    EXPIRATION: 'app_users_expiration',
    RELOAD_USED: 'reload_button_used'
};

// global variables
let users = [];

// fetching data
const fetchUsers = async () => {
    try {
        // response
        const response = await fetch(`https://jsonplaceholder.typicode.com/users`);

        // error -> ok property
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        // data to json
        const users = await response.json();
        // control
        console.log('User data loaded successfully with fetch.');
        // data operating
        return users;        
    } catch (error) {
        console.error('Failed to load user data with fetch: ', error);
        alert('An error occured while loading user data. Please try again.');
        return [];
    }
};

// save data to localStorage
const saveUsersToStorage = (users) => {
    const now = new Date();
    // 1 gün kalsın --> 24 * 60 * 60 * 1000 ms
    const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // v, k
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.EXPIRATION, expirationDate.toISOString());
};

// load from localStorage
const loadUsersFromStorage = () => {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    const expirationDate = localStorage.getItem(STORAGE_KEYS.EXPIRATION);

    if (!usersData || !expirationDate) return null;

    const now = new Date();
    const expiration = new Date(expirationDate);
    // bekleme süresini 1 gün olarak belirlediğim için bu ikisiyle kontrol yapacağız:
    if (now > expiration) {
        // 1 gün geçtikten sonra temizlenmiş olmalı
        localStorage.removeItem(STORAGE_KEYS.USERS);
        localStorage.removeItem(STORAGE_KEYS.EXPIRATION);
        return null;
    }

    return JSON.parse(usersData);
};

// optional: create avatar
const createInitialsAvatar = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
};

const createAppContainer = () => {
    // control container
    let container = $('#app-container'); // bu selector ün sonucu bir dizidir.

    if (container.length === 0) {
        container = $('<div>').attr('id', 'app-container').attr('style', STYLES.container);

        // loc.
        const targetElement = $(appendLocation);
        if (targetElement.length > 0) targetElement.append(container)   // length 0dan büyükse container zaten eklenmiştir, container a eklenir yoksa container body ye eklenir
        else $('body').append(container);
    }
    return container;
};

// render users to DOM
const renderUsers = (users) => {
    const container = createAppContainer();

    $('.users-container', container).remove(); // clear prev. content

    // user list container
    const usersContainer = $('<div>').addClass('users-container').attr('style', STYLES.usersContainer);

    if (!users || users.length === 0) {
        const noUserMsg = $('<div>')
                                    .addClass('no-users-message')
                                    .attr('style', STYLES.noUsers)
                                    .text('No users found!');
        usersContainer.append(noUserMsg);
        container.append(usersContainer);

        showReloadButton() // bunu sonradan ekleyip davranışını kontrol edeceğiz
        return;
    }

    // create card for every user
    users.forEach(user => {
        const userCard = $('<div>')
                                   .addClass('user-card')
                                   .attr('style', STYLES.userCard)
                                   .attr('data-user-id', user.id)
                                   .hover(
                                    // giriş efekti
                                        function() {
                                            $(this).css({
                                                'transform': 'translateY(-5px)',
                                                'box-shadow': '0 8px 16px rgba(0,0,0,0.15)'
                                              });
                                        }
                                    //çıkış efekti
                                    , function() {
                                        $(this).css({
                                          'transform': 'translateY(0)',
                                          'box-shadow': '0 4px 8px rgba(0,0,0,0.1)'
                                        });
                                      }
                                   );
                                   
        const nameHeader = $('<div>')
                                     .addClass('user-header')
                                     .attr('style', STYLES.userCardHeader);
                                    
        const userIcon = $('<div>')
                                   .addClass('user-icon')
                                   .attr('style', STYLES.userIcon)
                                   .text(createInitialsAvatar(user.name));

        nameHeader.append(userIcon);
        nameHeader.append(document.createTextNode(user.name));
                                   
        
        // user info
        const emailInfo = createInfoItem('✉️', `Email: ${user.email}`);
        const cityInfo = createInfoItem('🏙️', `City: ${user.address.city}`);
        const phoneInfo = createInfoItem('📱', `Phone: ${user.phone}`);

        // delete btn
        const deleteButton = $('<button>')
                                          .addClass('delete-button')
                                          .attr('style', STYLES.deleteButton)
                                          .text('Delete')
                                          .attr('aria-label', `Delete ${user.name}`)
                                          .hover(
                                            // giriş
                                            function() {
                                                $(this).css('transform', 'scale(1.05)');
                                              },

                                              // çıkış
                                              function() {
                                                $(this).css('transform', 'scale(1)');
                                              }
                                          )
                                          .on('click', () => deleteUser(user.id));
        
        userCard.append(nameHeader);
        userCard.append(emailInfo);
        userCard.append(cityInfo);
        userCard.append(phoneInfo);
        userCard.append(deleteButton);

        usersContainer.append(userCard);
    });

    container.append(usersContainer);

    // test-1 çöaüm önerisi 3 --> X
    //observeMutations();
};

// info line
const createInfoItem = (icon, text) => {
    const infoItem = $('<div>')
                               .addClass('user-info')
                               .attr('style', STYLES.userCardInfo);

    const iconSpan = $('<span>')
                                .addClass('info-icon')
                                .attr('style', STYLES.infoIcon)
                                .text(icon);


    infoItem.append(iconSpan);
    infoItem.append(document.createTextNode(text));

    return infoItem;
};

// delete user
const deleteUser = (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    // filter from list
    users = users.filter(user => user.id !== userId);

    // update localStorage
    saveUsersToStorage(users);

    // remove userCard from DOM
    $(`.user-card[data-user-id="${userId}"]`).remove();

    if (users.length === 0) {
        if ($('#app-container .users-container .no-users-message').length === 0) {
            const noUserMsg = $('<div>')
                                        .addClass('no-users-message')
                                        .attr('style', STYLES.noUsers)
                                        .text('No users in the list.');

            $('#app-container .users-container').append(noUserMsg);
        }

        // show reload btn
        showReloadButton();
    }
    alert('User deleted successfully');
};

const showReloadButton = () => {
    if ($('#app-container .reload-button').length > 0) return;

    // sessionStorage
    // reload butonunun sessionStorage'da sıfırlayacağız.
    sessionStorage.removeItem(STORAGE_KEYS.RELOAD_USED);

    const container = $('#app-container');
    if (container.length === 0) return;

    // remove prev
    $('.reload-button', container).remove();

    const reloadButton = $('<button>')
                                      .addClass('reload-button')      
                                      .attr('style', STYLES.reloadButton)
                                      .text('Reload Users')
                                      .attr('aria-label', 'Reload Users')
                                      .hover(
                                        // giriş
                                        function() {
                                            $(this).css({
                                                'transform': 'scale(1.05)',
                                                 'box-shadow': '0 6px 16px rgba(0,0,0,0.2)'
                                            });
                                        },
                                        // çıkış
                                        function() {
                                            $(this).css({
                                              'transform': 'scale(1)',
                                              'box-shadow': '0 4px 12px rgba(0,0,0,0.15)'
                                            });
                                          }
                                        )
                                      .on('click', handleReload);
    
    container.append(reloadButton);
    console.log('Reload button added');    

};

const handleReload = async () => {
    console.log('Reload button clicked');

    // session storage, button using
    sessionStorage.setItem(STORAGE_KEYS.RELOAD_USED, 'true');

    // remove button
   // $('.reload-button', $('#app-container')).remove();
    $('#app-container .reload-button').remove();

    // clear localStorage for reload user
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.EXPIRATION);

    observeMutations();

    // reload data
    users =  await fetchUsers();

    if (users && users.length > 0) {
        saveUsersToStorage(users);
        renderUsers(users);
        
        alert('Users loaded successfully');
    } else {
        alert('Users failed to load. Please try again later.');
    }
};

const createAppHeader = () => {
    const container = $('#app-container');

    if (container.length === 0) return;

    // varsa önceki başlık kaldırılır
    $('.app-header', container).remove(); 

    const header = $('<h1>')
                            .addClass('app-header')
                            .attr('style', STYLES.header)
                            .text('Users List App');

    container.prepend(header);
};

/* ----------------------------------- Mutation Observer ----------------------------------- */
const observeMutations = () => {
    // hedef node seçilir
    const targetNode = document.getElementById('app-container');
    //const targetNode = document.querySelector('.users-container');

    if (!targetNode) {
        console.warn('No targets to observe');
        return;
    }

    const config = {
        childList: true,
        subtree: true
    }

    const callback = (mutationList) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === 1 && node.classList.contains('user-card')) {
                    console.log('New user card added:', node);
                  }
                });
        
                mutation.removedNodes.forEach((node) => {
                  if (node.nodeType === 1 && node.classList.contains('user-card')) {
                    console.log('Removed a user card:', node);
                  }
                });
              }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    console.log('MutationObserver started')
};

const initApp = async () => {
    createAppContainer();

    createAppHeader();

    users = loadUsersFromStorage(); 

    if (!users) {
        users = await fetchUsers();
        console.log('Fetched users:', users);
        if (users && users.length > 0) {
          saveUsersToStorage(users);
        }
      }
      
      renderUsers(users);
      //observeMutations();
      // test 1 için çözüm önerisi: --> X
    //   setTimeout(() => {
    //     observeMutations();
    // }, 100);

    // DOM güncellemesinin tamamlanması için küçük bir gecikme
    setTimeout(() => {
        observeMutations();
    }, 0);

}


$(document).ready(() => {
    //sessionStorage.removeItem(STORAGE_KEYS.RELOAD_USED);
    if (!sessionStorage.getItem(STORAGE_KEYS.RELOAD_USED)) {
        sessionStorage.removeItem(STORAGE_KEYS.RELOAD_USED);
    }

    initApp();
});