document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const body = document.body;
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    const searchButton = document.getElementById('search-button');
    const categoryItems = document.querySelectorAll('.category-item');
    const hasSubmenuLinks = document.querySelectorAll('.has-submenu > a');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a'); // همه لینک های داخل سایدبار

    let allProducts = []; // لیست محصولات از JSON

    // --- Menu Toggle & Behavior ---
    hamburgerMenu.addEventListener('click', () => {
        sidebarMenu.classList.toggle('open');
        hamburgerMenu.classList.toggle('active');
        body.classList.toggle('menu-open'); // جلوگیری از اسکرول صفحه اصلی
    });

    // بستن منو با کلیک روی لینک‌ها (به جز بخش محصولات)
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // بررسی کنید که آیا لینک مربوط به بخش محصولات یا زیرمنوهای آن است
            const isProductLink = link.closest('.has-submenu') || link.parentElement.classList.contains('has-submenu');

            // اگر لینک، آیتم اصلی "محصولات" یا یکی از زیرمنوهای آن نیست، منو را ببند
            if (!isProductLink) {
                sidebarMenu.classList.remove('open');
                hamburgerMenu.classList.remove('active');
                body.classList.remove('menu-open');
            } else {
                // اگر روی خود "محصولات" کلیک شد، زیرمنو را باز/بسته کن
                if (link.parentElement.classList.contains('has-submenu')) {
                    e.preventDefault(); // جلوگیری از رفتن به href
                    link.parentElement.classList.toggle('open');
                }
                // اگر روی یکی از آیتم های زیرمنو (ساعت، دستبند، ...) کلیک شد، منو را ببند
                else if (link.closest('.submenu')) {
                    sidebarMenu.classList.remove('open');
                    hamburgerMenu.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }
        });
    });
});
// --- JavaScript for Universal Header Search ---
document.addEventListener('DOMContentLoaded', () => {
    const universalSearchInput = document.getElementById('universalSearchInput');
    const universalSearchButton = document.getElementById('universalSearchButton');
    const universalSearchSuggestions = document.getElementById('universalSearchSuggestions');

    // Fetch products for suggestions (assuming products.json is accessible)
    let allProductsForHeader = [];
    fetch('products.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Add Casio example if not present
            const casioExample = { "id": "Casio", "name": "ساعت Casio", "price": "1,000,000 تومان", "product_code": "RA-005", "keywords": ["کاسیو", "ساعت", "کلاسیک"] };
            if (!data.some(p => p.id === casioExample.id)) {
                data.unshift(casioExample);
            }
            allProductsForHeader = data;
        })
        .catch(error => {
            console.error("Could not load products for header suggestions:", error);
        });

    // Function to perform search (redirects to search page)
    function performUniversalSearch(term) {
        if (term.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(term)}`;
        }
    }

    // Event listener for input (show suggestions)
    universalSearchInput.addEventListener('input', () => {
        const term = universalSearchInput.value.trim();
        if (term.length >= 1 && allProductsForHeader.length > 0) {
            const suggestions = generateUniversalSuggestions(term);
            displayUniversalSuggestions(suggestions);
        } else {
            universalSearchSuggestions.classList.remove('active');
        }
    });

    // Event listener for Enter key
    universalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performUniversalSearch(universalSearchInput.value);
        }
    });

    // Event listener for Search button
    universalSearchButton.addEventListener('click', () => {
        performUniversalSearch(universalSearchInput.value);
    });

    // --- Universal Suggestions Logic ---
    function generateUniversalSuggestions(term) {
        const uniqueSuggestions = new Set();
        const lowerCaseTerm = term.toLowerCase();

        allProductsForHeader.forEach(product => {
            if (product.name.toLowerCase().includes(lowerCaseTerm)) {
                uniqueSuggestions.add(product.name);
            }
            if (product.product_code.toLowerCase().includes(lowerCaseTerm)) {
                uniqueSuggestions.add(`کد: ${product.product_code}`);
            }
            if (product.keywords) {
                product.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(lowerCaseTerm)) {
                        uniqueSuggestions.add(keyword);
                    }
                });
            }
        });
        return Array.from(uniqueSuggestions).slice(0, 7);
    }

    function displayUniversalSuggestions(suggestions) {
        universalSearchSuggestions.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'universal-suggestion-item';
                item.textContent = suggestion;
                item.addEventListener('click', () => {
                    universalSearchInput.value = suggestion;
                    universalSearchSuggestions.classList.remove('active');
                    performUniversalSearch(suggestion); // Perform search on suggestion click
                });
                universalSearchSuggestions.appendChild(item);
            });
            universalSearchSuggestions.classList.add('active');
        } else {
            universalSearchSuggestions.classList.remove('active');
        }
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!universalSearchSuggestions.contains(e.target) && !universalSearchInput.contains(e.target)) {
            universalSearchSuggestions.classList.remove('active');
        }
    });
});
