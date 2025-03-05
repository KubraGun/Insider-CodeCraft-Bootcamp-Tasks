// service for creating and rendering product cards
const ProductRenderer = {
    // fetch favorites from localStorage
    getFavorites: function() {
        const favorites = localStorage.getItem('favorites');
        return favorites ? JSON.parse(favorites) : [];
    },

    // adding-removing favorites
    toggleFavorite: function(product) {
        const favorites = this.getFavorites();
        const index = favorites.findIndex(p => p.id === product.id);

        if (index === -1) {
            favorites.push(product);
        } else {
            favorites.splice(index, 1);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        return index === -1;
    },

    // generate product card html
    createProductCard: function(product) {
        const favorites = this.getFavorites();
        const isFavorite = favorites.some(p => p.id === product.id);

        const $card = $('<div>').addClass('product-card')
            .data('product-id', product.id)
            .html(`
                <h3>${product.name}</h3>
                <p>Price: ${product.price.toFixed(2)}$</p>
                <div class="product-actions">
                    <a href="#" class="product-link">Details</a>
                    <span class="favorite-icon ${isFavorite ? 'active' : ''}">
                        ❤️
                    </span>
                </div>
            `); 
        
        // add favorite event
        $card.find('.favorite-icon').on('click', (event) => {
            $(event.target).toggleClass('active');
            this.toggleFavorite(product);
            this.renderFavorites();
        });

        return $card;
    },

    // render products to grid
    renderProducts: function(products) {
        const $grid =  $('#productGrid');

        console.log("Grid elementi:", $grid); 
        console.log("Ürünler:", products); 

        $grid.empty();

        products.forEach(product => {
            const $card = this.createProductCard(product);
            $grid.append($card.hide().fadeIn(300));
        });
    },

    // render favorites
    renderFavorites: function() {
        const $favoriteGrid = $('#favoriteProducts');
        const favorites = this.getFavorites();

        $favoriteGrid.empty();
        favorites.forEach(product => {
            const $card = this.createProductCard(product);
            $favoriteGrid.append($card);
        });
    }
};


console.log("ProductRenderer yüklendi");