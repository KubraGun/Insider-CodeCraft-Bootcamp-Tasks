// Main module
$(document).ready(function() {

    /* CSS */
    

    const init = async function() {
        try {
            UIService.showLoading();

            const { products, categories } = await DataService.fetchProducts();

            UIService.populateCategoryFilter(categories);
            UIService.populateSortOptions();

            UIService.renderProducts(products);

            EventHandlers.init();

            UIService.hideLoading();
        } catch (error) {
            console.error('Error initializing application:', error);
            $('#productsList').html('<p>Error loading products. Please try again later.</p>');
            UIService.hideLoading();
        }
    };

    if (localStorage.getItem('theme') === 'dark') {
        $('body').addClass('dark-mode');
    }

    init();
});