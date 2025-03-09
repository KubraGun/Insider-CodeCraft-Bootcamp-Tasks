const EventHandlers = (function() {
    // Private vars
    let currentFilters = {
        searchTerm: '',
        category: '',
        availability: '',
        onlyFavorites: false
    };
   
    let currentSort = 'name-asc';
   
    // Private methods
    // Apply filters and sorting
    function applyFiltersAndSort() {
        UIService.showLoading();
       
        setTimeout(function() {
            const filtered = DataService.filterProducts(currentFilters);
            const sorted = DataService.sortProducts(filtered, currentSort);
           
            UIService.renderProducts(sorted);
            UIService.hideLoading();
            UIService.highlightSearchTerms(sorted, currentFilters.searchTerm);
        }, 200); // Small delay for smooth UI
    }
   
    // Public API
    return {
        init: function() {
            // Search input event
            $('#searchInput').on('input', function() {
                currentFilters.searchTerm = $(this).val().trim();
                applyFiltersAndSort();
            });
           
            // Category filter event
            $('#categoryFilter').on('change', function() {
                currentFilters.category = $(this).val();
                applyFiltersAndSort();
            });
           
            // Availability filter event
            $('#availabilityFilter').on('change', function() {
                currentFilters.availability = $(this).val();
                applyFiltersAndSort();
            });
           
            // Sort option event
            $('#sortSelect').on('change', function() {
                currentSort = $(this).val();
                applyFiltersAndSort();
            });
            
            // Dark mode toggle button event
            $('#themeToggle').on('click', function() {
                $('body').toggleClass('dark-mode');
                localStorage.setItem('theme', $('body').hasClass('dark-mode') ? 'dark' : 'light');
            });
            
            // Show/hide favorites button event
            $('#favoritesToggle').on('click', function() {
                currentFilters.onlyFavorites = !currentFilters.onlyFavorites;
                $(this).toggleClass('active');
                $(this).text(currentFilters.onlyFavorites ? 'Show All Products' : 'Show Favorites Only');
                applyFiltersAndSort();
            });
            
            // Check theme on page load
            $(document).ready(function() {
                if (localStorage.getItem('theme') === 'dark') {
                    $('body').addClass('dark-mode');
                }
            });
            
            // Open/close product details on card click
            $('#productsList').on('click', '.product-card', function(e) {
                // Ignore if click is on a button (e.g., favorite button)
                if ($(e.target).is('button') || $(e.target).closest('button').length) {
                    return;
                }
               
                const productId = $(this).data('id');
                UIService.toggleProductDetails(productId);
            });
           
            // Close product details button event
            $('#productsList').on('click', '.close-details', function(e) {
                e.stopPropagation();
                $(this).closest('.product-details').removeClass('active');
            });
           
            // Close details when clicking outside product card
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.product-card').length) {
                    $('.product-details.active').removeClass('active');
                }
            });

            
           
            // Favorite button event
            $('#productsList').on('click', '.favorite-btn', function(e) {
                // e.stopPropagation();
                // e.preventDefault(); // Prevent form submit
                // const productId = $(this).closest('.product-card').data('id');
                // const isFavorite = DataService.toggleFavorite(productId);
                // UIService.updateFavoriteButton(productId, isFavorite);

                e.stopPropagation();
                e.preventDefault(); 
                const productId = $(this).closest('.product-card').data('id');
                console.log('Clicked Product ID:', productId); // Debug log
                const isFavorite = DataService.toggleFavorite(productId);
                console.log('Favorite Status:', isFavorite); // Debug log
                UIService.updateFavoriteButton(productId, isFavorite);
            });

        }
    };
})();