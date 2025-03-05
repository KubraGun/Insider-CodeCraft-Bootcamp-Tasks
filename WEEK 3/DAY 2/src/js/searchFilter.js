// search and filtering service
const SearchFilter = {
    products: [], // all products

    // initialize search and filtering process
    init: function(products) {
        this.products = products;
        this.setupEventListener();
    },

    // set event listeners
    setupEventListener: function() {
        $('#searchInput').on('input', () => this.handleSearch());
        $('#sortSelect').on('change', () => this.handleSort());
    },

    // searching
    handleSearch: function() {
        const query = $('#searchInput').val().trim(); // get val of input tag
        const filteredProducts = ProductService.searchProducts(this.products, query);
        ProductRenderer.renderProducts(filteredProducts);
    },

    // sorting
    handleSort: function() {
        const order = $('#sortSelect').val();
        if (order) {
            const sortedProducts = ProductService.sortProducts([...this.products], order);
            ProductRenderer.renderProducts(sortedProducts);
        }
    }
};

console.log("SearchFilter yüklendi");