const UIService = (function() {
    // Cache DOM selectors for perf
    const $productsList = $('#productsList');
    const $categoryFilter = $('#categoryFilter');
    const $sortSelect = $('#sortSelect');
    const $loadingIndicator = $('#loadingIndicator');
   
    // Private methods
    // Render product card
    function renderProductCard(product) {
        const $card = $('<div>')
            .addClass('product-card')
            .attr('data-id', product.id);
        
        // Fix favorite btn - ensure proper heart symbols
        const $favoriteBtn = $('<button>')
            .addClass('favorite-btn')
            .html('&#9825;') // Empty heart
            .attr('title', 'Add to favorites')
            .toggleClass('active', product.isFavorite);
        
        // Use filled heart if product is favorite
        if (product.isFavorite) {
            $favoriteBtn.html('&#9829;'); // Filled heart
        }
       
        // Product image
        const $imageContainer = $('<div>').addClass('product-image');
        const $image = $('<img>').attr('src', product.image).attr('alt', product.name);
        $imageContainer.append($image);
       
        // Discount badge
        const $discountBadge = $('<div>')
            .addClass('discount-badge')
            .text(`-${product.discountPercentage}%`);
            
        // Product info
        const $info = $('<div>').addClass('product-info');
        const $name = $('<h3>').addClass('product-name').text(product.name);
       
        // Price section
        const $price = $('<div>').addClass('product-price');
        const $originalPrice = $('<span>').addClass('original-price').text(`$${product.originalPrice.toFixed(2)}`);
        const $discountedPrice = $('<span>').addClass('discounted-price').text(`$${product.discountedPrice.toFixed(2)}`);
        $price.append($originalPrice, $discountedPrice);
       
        // Stock status
        const $stockStatus = $('<div>')
            .addClass('stock-status')
            .addClass(product.isStock ? 'in-stock' : 'out-of-stock')
            .text(product.isStock ? 'In Stock' : 'Out of Stock');
            
        // Category label
        const $category = $('<div>').addClass('product-category').text(product.category);
        
        // Product details (initially hidden)
        const $details = $('<div>').addClass('product-details').attr('id', `details-${product.id}`);
        const $detailsContent = $('<div>').addClass('details-content');
        const $description = $('<p>').addClass('product-description').text(product.description);
        const $closeBtn = $('<button>').addClass('close-details').html('&times;').attr('title', 'Close details');
        $detailsContent.append($description, $closeBtn);
        $details.append($detailsContent);
       
        // Build card
        $info.append($name, $price, $stockStatus, $category);
        $card.append($favoriteBtn, $imageContainer, $discountBadge, $info, $details);
        return $card;
    }
   
    // Public API
    return {
        // Render products to list
        renderProducts: function(products) {
            $productsList.empty();
           
            if (products.length === 0) {
                $productsList.html('<p>No products found matching your criteria.</p>');
                return;
            }
           
            $.each(products, function(index, product) {
                const $card = renderProductCard(product);
                $productsList.append($card.hide().fadeIn(400)); // Smooth fade-in for new products
                // Lazy loading effect with small delay
                setTimeout(function() {
                    $card.css('opacity', 1);
                }, index * 50);
            });
        },
        
        // Populate category filter dynamically
        populateCategoryFilter: function(categories) {
            $categoryFilter.empty();
           
            // Add default category
            $('<option>').val('').text('All Categories').appendTo($categoryFilter);
            $.each(categories, function(index, category) {
                $('<option>').val(category).text(category).appendTo($categoryFilter);
            });
            console.log('Category options updated:', categories);
        },
        
        // Populate sort options dynamically
        populateSortOptions: function() {
            $sortSelect.empty();
            const sortOptions = [
                { value: 'name-asc', text: 'Name (A-Z)' },
                { value: 'name-desc', text: 'Name (Z-A)' },
                { value: 'price-asc', text: 'Price (Low to High)' },
                { value: 'price-desc', text: 'Price (High to Low)' },
                { value: 'discount-asc', text: 'Discount (Low to High)' },
                { value: 'discount-desc', text: 'Discount (High to Low)' }
            ];
            $.each(sortOptions, function(index, option) {
                $('<option>').val(option.value).text(option.text).appendTo($sortSelect);
            });
            console.log('Sort options updated.');
        },
        
        // Toggle product details open/close
        toggleProductDetails: function(productId) {
            const $details = $(`#details-${productId}`);
            // Close other open details
            $('.product-details.active').not($details).removeClass('active');
            // Toggle selected details panel
            $details.toggleClass('active');
            // Scroll to details if opened
            if ($details.hasClass('active')) {
                $('html, body').animate({ scrollTop: $details.offset().top - 100 }, 300);
            }
        },
       
        // Update favorite button state
        updateFavoriteButton: function(productId, isFavorite) {
            const $btn = $(`.product-card[data-id="${productId}"] .favorite-btn`);
            if (isFavorite) {
                $btn.addClass('active').html('&#9829;').attr('title', 'Remove from favorites'); // Filled heart
            } else {
                $btn.removeClass('active').html('&#9825;').attr('title', 'Add to favorites'); // Empty heart
            }
        },
        
        // Show loading indicator
        showLoading: function() {
            $loadingIndicator.show();
            $productsList.css('opacity', 0.5);
        },
        
        // Hide loading indicator
        hideLoading: function() {
            $loadingIndicator.hide();
            $productsList.css('opacity', 1);
        },
        
        // Highlight search terms in product names
        highlightSearchTerms: function(products, searchTerm) {
            if (!searchTerm) return;
           
            const regex = new RegExp(`(${searchTerm})`, 'gi');
           
            $('.product-name').each(function() {
                const original = $(this).text();
                const highlighted = original.replace(regex, '<span class="highlight">$1</span>');
                if (original !== highlighted) {
                    $(this).html(highlighted);
                }
            });
        }
    };
})();