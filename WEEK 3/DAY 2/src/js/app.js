// Main app
$(document).ready(function() {
    console.log("App hazır");
    console.log("ProductRenderer:", typeof ProductRenderer);

    // Dark mode toggle
    $('#darkModeToggle').on('click', function() {
        $('body').toggleClass('dark-mode');
        localStorage.setItem('darkMode', $('body').hasClass('dark-mode'));
    });

    // check dark mode status when page loads
    if (localStorage.getItem('darkMode') === 'true') {
        $('body').addClass('dark-mode');
    }

    // list products btn
    $('#loadProductsBtn').on('click', function () {
        ProductService.fetchProducts()
            .done(function(data) {
                const products = data.products;

                // render products
                ProductRenderer.renderProducts(products);

                // start search and sort filter
                SearchFilter.init(products);

                // render favorites
                ProductRenderer.renderFavorites();
            })
            .fail(function(error) {
                console.error("Ürünler yüklenemedi: ", error);
         
            });
    });


        // auto load product
        ProductService.fetchProducts()
        .done(function(data) {
            const products = data.products;
            ProductRenderer.renderProducts(products);
            SearchFilter.init(products);
            ProductRenderer.renderFavorites();
        })
        .fail(function(error) {
            console.error("Ürünler yüklenemedi: ", error);
        });



    // $(document).ready(function() {
    //     console.log("App hazır");
    //     console.log("ProductRenderer:", typeof ProductRenderer);
    
    //     // Dark mode toggle
    //     $('#darkModeToggle').on('click', function() {
    //         $('body').toggleClass('dark-mode');
    //         localStorage.setItem('darkMode', $('body').hasClass('dark-mode'));
    //     });
    
    //     // check dark mode status when page loads
    //     if (localStorage.getItem('darkMode') === 'true') {
    //         $('body').addClass('dark-mode');
    //     }
    
    //     // list products btn
    //     function loadProducts() {
    //         ProductService.fetchProducts()
    //             .done(function(data) {
    //                 console.log("Ürünler yüklendi:", data.products);
                    
    //                 if (typeof ProductRenderer !== 'undefined') {
    //                     ProductRenderer.renderProducts(data.products);
    //                     SearchFilter.init(data.products);
    //                     ProductRenderer.renderFavorites();
    //                 } else {
    //                     console.error("ProductRenderer tanımsız!");
    //                 }
    //             })
    //             .fail(function(error) {
    //                 console.error("Ürünler yüklenemedi: ", error);
    //             });
    //     }
    
    //     // Sayfa yüklendiğinde ve butona tıklandığında çalışsın
    //     $('#loadProductsBtn').on('click', loadProducts);
    //     loadProducts(); // Otomatik yükleme
    // });

});