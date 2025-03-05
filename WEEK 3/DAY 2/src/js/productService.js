const ProductService = {
    fetchProducts: function() {
        return $.ajax({
            url: 'http://127.0.0.1:5500/DAY 2/src/data/products.json',
            method: 'GET',
            dataType: 'json',

            // ürünler listelenmiyor
            success: function(data) {
                console.log('Ürünler başarıyla yüklendi:', data);
            },
            error: function(xhr, status, error) {
                console.error('AJAX Hatası:', status, error);
                console.log('XHR:', xhr);
            }
        });
    },

    // sort by price
    sortProducts: function(products, order) {
        return products.sort((a, b) => 
            order === 'asc' ? a.price - b.price : b.price - a.price    
        );
    },

    // filter by name
    searchProducts: function(products, query) {
        return products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
    }
};

console.log("ProductService yüklendi");