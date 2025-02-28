// Definin initialize global variables and app state
let userData = null; // for store user info globally
let cartItems = [] // for store cart items globally

// DOM elements

const userInfoForm = document.getElementById("userInfoForm");
const userInfoContainer = document.getElementById("userInfoContainer");
const userProfile = document.getElementById("userProfile");
const userDetails = document.getElementById("userDetails");
const editUserInfoBtn = document.getElementById("editUserInfo");

const productForm = document.getElementById("productForm");
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const addProductBtn = document.getElementById("addProductBtn");

const cartContainer = document.getElementById("cartContainer");
const cartItemsList = document.getElementById("cartItems");
const totalPriceElement = document.getElementById("totalPrice");
const errorMessage = document.getElementById("errorMessage");
const sortOptions = document.getElementById("sortOptions");

// check if user data exists in localStorage
// Runs when the page is fully loaded
// document.addEventListener("DOMContentLoaded", () => {
//     // Load user data from localStorage if available
//     const savedUserData = localStorage.getItem('userData');
//     const savedCartItems = localStorage.getItem('cartItems');

//     // if user data exists, assign it to the variable and display chart
//     if (savedUserData) {
//         userData = JSON.parse(savedUserData);
//         showUserProfile();
//     }

//     // If cart data exists, assign it to the variable and display the cart
//      if (savedCartItems) {
//         cartItems = JSON.parse(savedCartItems);
//         renderCart();
//     }
// });


document.addEventListener("DOMContentLoaded", () => {
    // Kullanıcı bilgilerini prompt ile al
    let name = "";
    while (!name.trim()) {
        name = prompt("Adınızı giriniz:").trim();
    }

    let age;
    while (!age || isNaN(age) || age <= 0) {
        age = parseInt(prompt("Yaşınızı giriniz:"));
    }

    let job = "";
    while (!job.trim()) {
        job = prompt("Mesleğinizi giriniz:").trim();
    }

    // Kullanıcı nesnesini oluştur
    userData = {
        name: name,
        age: age,
        job: job
    };

    // LocalStorage'a kaydet
    localStorage.setItem("userData", JSON.stringify(userData));

    // Kullanıcı profilini göster
    showUserProfile();
});


//Handle user info form submission
userInfoForm.addEventListener("submit", (event) => {
    event.preventDefault(); // prevents page reload
    
    // Get user input values and trim spaces
    const name = document.getElementById("userName").value.trim(); //remove space (start and end)
    const age = document.getElementById("userAge").value;
    const job = document.getElementById("userJob").value.trim();

    // Create user data object
    userData = {
        name: name,
        age: parseInt(age),
        job: job
    };

    // Save user data to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Show user profile and product form
    showUserProfile()
});

// Func to display user profile and hide the form
function showUserProfile() {
    // Display user info
    userDetails.innerHTML = `
        <p><strong>Name: </strong> ${userData.name}</p>
        <p><strong>Age: </strong> ${userData.age}</p>
        <p><strong>Job: </strong> ${userData.job}</p>
    `;

    // Hide user Form and show profile
    userInfoContainer.style.display = "none";
    userProfile.style.display = "block";
    productForm.style.display = "block";
    cartContainer.style.display = "block";
}

// Handle edit user info button click
// use add event listener --> click
editUserInfoBtn.addEventListener("click", () => {
    // Fill form with current user data
    document.getElementById("userName").value = userData.name;
    document.getElementById("userAge").value = userData.age;
    document.getElementById("userJob").value = userData.job;

    // Show form and hide profile
    userInfoContainer.style.display = "block";
    userProfile.style.display = "none";
});

// Add product to cart when button is clicked
addProductBtn.addEventListener('click', () => {
    addProductToCart();
});

// Function to add product to cart
function addProductToCart() {
    const productName = productNameInput.value.trim();
    const productPrice = parseFloat(productPriceInput.value);

    // validate input
    if (!productName) {
        showError("Please enter the product name.");
        return;
    }

    if (isNaN(productPrice) || productPrice <= 0) {
        showError("Please enter a valid product price.");
        return;
    }

    // Clear any error messages
    clearError();

    // Check if product already exist in cart
    const existingProductIndex = cartItems.findIndex(item => 
        item.name.toLowerCase() === productName.toLowerCase()
    );

    if (existingProductIndex !== -1) {
        // Update product quantity if it already exists
        cartItems[existingProductIndex].quantity += 1;
    }
    else {
        // increase quantity if it doesn't exist
        cartItems.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    // process completed, 

    // save cart to localStorage
    saveCartToLocalStorage();

    // Update the cart display
    renderCart();

    // Clear input fields
    productName.value = '';
    productPriceInput.value = '';
}

// Func.s to display error mes.
function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = '';
}

// func to render cart items
function renderCart() {
    // change
    // Clear current cart display
    cartItemsList.innerHTML = ''; // remove all tag that contains products
    // cartItems --> return a list data structure. control with lengt method

    // If cart is empty, show mes.
    if (cartItems.length === 0) {
        cartItemsList.innerHTML = '<li class="cart-item">No items in your cart.</li>';
        totalPriceElement.textContent = '0.00'; // h3 tag
        return; // out from rendercart
    }

    // create a copy of cart items for sorting
    let sortedItems = [...cartItems];

    // Sort items based on selected option
    const sortValue = sortOptions.value;
    if (sortValue === 'priceAsc') {
        sortedItems.sort((a, b) => a.price - b.price);
    }
    else if (sortValue === 'priceDesc') {
        sortedItems.sort((a, b) => b.price - a.price);
    }
    else if (sortValue === 'nameAsc') {
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }
    else if (sortValue === 'nameDesc') {        
        sortedItems.sort((a, b) => b.name.localeCompare(a.name));
    }

    // Add each item to the cart display
    sortedItems.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('cart-item');

        const itemTotal = (item.price * item.quantity).toFixed(2);

        listItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Birim Fiyat: ${item.price.toFixed(2)} ₺</div>
                <div class="cart-item-quantity">Adet: ${item.quantity}</div>
            </div> 
            <div class="cart-item-total">${itemTotal} ₺</div>
            <button class="btn btn-small btn-delete" data-index="${index}">Sil</button>
        `
        /** 
         * burada buton gözükmüyordu
         * kontrol: console.log(cartItemsList.innerHTML);

        */
        cartItemsList.appendChild(listItem);

        // cpntrol total price
        const totalPrice = cartItems.reduce((total, item) => {
            console.log(`Ürün: ${item.name}, Fiyat: ${item.price}, Miktar: ${item.quantity}`);
            return total + (item.price * item.quantity);
        }, 0);
        console.log("Toplam Fiyat:", totalPrice);
        totalPriceElement.textContent = totalPrice.toFixed(2);
    });
}

// Handle cart item deletion
cartItemsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-delete')) {
        const index = parseInt(event.target.getAttribute('data-index'));
        
        // Remove item from cart
        cartItems.splice(index, 1);
        
        // Save cart to localStorage
        saveCartToLocalStorage();
        
        // Update cart display
        renderCart();
    }
});


// Handle sort options change
sortOptions.addEventListener('change', function() {
    renderCart();
});

// Function to save cart items to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}