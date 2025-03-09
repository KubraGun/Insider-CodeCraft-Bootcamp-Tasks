const DataService = (function() {
    // Private vars
    let products = [];
    let categories = [];
    const cacheKey = 'product_cache';
    const cacheDuration = 3600000; // 1 hour in ms

    // Private methods
    // Parse XML to extract products
    function parseXmlToProducts(xml) {
        const productElements = $(xml).find('product');
        const parsedProducts = [];
       
        productElements.each(function() {
            const $product = $(this);
           
            const product = {
                id: $product.attr('id'),
                name: $product.find('name').text(),
                originalPrice: parseFloat($product.find('originalPrice').text()),
                discountPercentage: parseFloat($product.find('discountPercentage').text()),
                discountedPrice: parseFloat($product.find('discountedPrice').text()),
                link: $product.find('link').text(),
                description: $product.find('description').text(),
                image: $product.find('image').text(),
                category: $product.find('category').text(),
                isStock: $product.find('isStock').text() === 'true',
                isFavorite: false
            };
           
            // Check if product was favorited before
            const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
            if (savedFavorites[product.id]) {
                product.isFavorite = true;
            }
           
            parsedProducts.push(product);
        });
       
        return parsedProducts;
    }

    // Extract and sort categories from products
    function extractCategories(products) {
        const uniqueCategories = new Set(products.map(product => product.category));
        return Array.from(uniqueCategories).sort();
    }

    // Save data to localStorage (caching)
    function saveToCache(data) {
        const cacheData = {
            timestamp: new Date().getTime(),
            data: data
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    // Get data from cache
    function getFromCache() {
        const cachedData = localStorage.getItem(cacheKey);
        if (!cachedData) return null;
       
        const parsedCache = JSON.parse(cachedData);
        const now = new Date().getTime();
       
        // Check cache expiration
        if (now - parsedCache.timestamp > cacheDuration) {
            localStorage.removeItem(cacheKey);
            return null;
        }
       
        return parsedCache.data;
    }
    
    // Save favorites to localStorage
    function saveFavorites() {
        const favorites = {};
        products.forEach(product => {
            if (product.isFavorite) {
                favorites[product.id] = true;
            }
        });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Public API
    return {
        // Fetch products from XML and cache them
        fetchProducts: function() {
            return new Promise((resolve, reject) => {
                // First, check cache
                const cachedProducts = getFromCache();
                if (cachedProducts) {
                    products = cachedProducts;
                    
                    // Load favorites from localStorage
                    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
                    products.forEach(product => {
                        if (savedFavorites[product.id]) {
                            product.isFavorite = true;
                        }
                    });
                    
                    categories = extractCategories(products);
                    resolve({ products, categories });
                    return;
                }
               
                // If no cache, fetch from XML
                $.ajax({
                    type: 'GET',
                    url: './data.xml', 
                    dataType: 'xml',
                    success: function(response) {
                        products = parseXmlToProducts(response);
                        categories = extractCategories(products);
                       
                        // Save to cache
                        saveToCache(products);
                       
                        resolve({ products, categories });
                    },
                    error: function(error) {
                        console.error("Error loading XML:", error);
                        // Fallback to manual XML parsing if jQuery XML parsing fails
                        $.get('./data.txt', function(xmlString) {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
                            const processedProducts = [];
                            
                            const productNodes = xmlDoc.getElementsByTagName('product');
                            for (let i = 0; i < productNodes.length; i++) {
                                const node = productNodes[i];
                                const product = {
                                    id: node.getAttribute('id'),
                                    name: node.getElementsByTagName('name')[0].textContent,
                                    originalPrice: parseFloat(node.getElementsByTagName('originalPrice')[0].textContent),
                                    discountPercentage: parseFloat(node.getElementsByTagName('discountPercentage')[0].textContent),
                                    discountedPrice: parseFloat(node.getElementsByTagName('discountedPrice')[0].textContent),
                                    link: node.getElementsByTagName('link')[0].textContent,
                                    description: node.getElementsByTagName('description')[0].textContent,
                                    image: node.getElementsByTagName('image')[0].textContent,
                                    category: node.getElementsByTagName('category')[0].textContent,
                                    isStock: node.getElementsByTagName('isStock')[0].textContent === 'true',
                                    isFavorite: false
                                };
                                
                                // Check if product was favorited before
                                const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
                                if (savedFavorites[product.id]) {
                                    product.isFavorite = true;
                                }
                                
                                processedProducts.push(product);
                            }
                            
                            products = processedProducts;
                            categories = extractCategories(products);
                            
                            // Save to cache
                            saveToCache(products);
                            
                            resolve({ products, categories });
                        }).fail(function(finalError) {
                            reject(finalError);
                        });
                    }
                });
            });
        },
       
        // Get all products
        getProducts: function() {
            return products;
        },
       
        // Get all categories
        getCategories: function() {
            return categories;
        },
       
        // Filter products by search, category, stock, and favorites
        filterProducts: function(params) {
            let filtered = [...products];
           
            // Search filter
            if (params.searchTerm) {
                const term = params.searchTerm.toLowerCase();
                filtered = filtered.filter(product =>
                    product.name.toLowerCase().includes(term) ||
                    product.description.toLowerCase().includes(term) ||
                    product.category.toLowerCase().includes(term)
                );
            }
           
            // Category filter
            if (params.category) {
                filtered = filtered.filter(product =>
                    product.category === params.category
                );
            }
           
            // Stock filter
            if (params.availability !== '') {
                const inStock = params.availability === 'true';
                filtered = filtered.filter(product =>
                    product.isStock === inStock
                );
            }
           
            // Favorites filter
            if (params.onlyFavorites) {
                filtered = filtered.filter(product =>
                    product.isFavorite
                );
            }
           
            return filtered;
        },
       
        // Sort products by criteria
        sortProducts: function(products, sortOption) {
            const [field, direction] = sortOption.split('-');
            const multiplier = direction === 'asc' ? 1 : -1;
           
            return [...products].sort((a, b) => {
                if (field === 'name') {
                    return multiplier * a.name.localeCompare(b.name);
                } else if (field === 'price') {
                    return multiplier * (a.discountedPrice - b.discountedPrice);
                } else if (field === 'discount') {
                    return multiplier * (a.discountPercentage - b.discountPercentage);
                }
                return 0;
            });
        },
       
        // Toggle favorite status of a product
        toggleFavorite: function(productId) {
            const product = products.find(p => p.id == productId);
            if (product) {
                product.isFavorite = !product.isFavorite;
                // Save favorites to localStorage
                saveFavorites();
                saveToCache(products);
            }
            return product ? product.isFavorite : false;
        },
       
        // Get product by ID
        getProductById: function(productId) {
            return products.find(p => p.id === productId);
        }
    };
})();