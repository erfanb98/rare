// search.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const filterIcon = document.getElementById('filter-icon');
    const priceFilterContainer = document.getElementById('price-filter-container');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyFilterButton = document.getElementById('apply-filter-button');
    const searchResultsContainer = document.getElementById('search-results');

    let allProducts = []; // برای نگهداری تمام محصولات

    // تابع برای بارگذاری محصولات از فایل JSON
    function loadProducts() {
        fetch('/products.json') // مطمئن شوید که مسیر فایل products.json صحیح است
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allProducts = data;
                // بررسی URL برای پارامتر جستجو
                const urlParams = new URLSearchParams(window.location.search);
                const queryParam = urlParams.get('q');
                if (queryParam) {
                    searchInput.value = queryParam; // مقدار جستجو را در فیلد نمایش بده
                    displayProducts(allProducts, queryParam.toLowerCase()); // نمایش نتایج بر اساس پارامتر URL
                } else {
                    displayProducts(allProducts, ''); // اگر پارامتری نیست، همه محصولات را نمایش بده (یا مخفی کن)
                }
            })
            .catch(error => {
                console.error("خطا در بارگذاری محصولات:", error);
                // نمایش پیام خطا به کاربر در صفحه جستجو
                if (searchResultsContainer) {
                    searchResultsContainer.innerHTML = '<p>خطا در بارگذاری محصولات. لطفاً بعداً تلاش کنید.</p>';
                }
                // در صورت خطا، می‌توانید از داده‌های نمونه استفاده کنید
                // allProducts = [ /* داده‌های نمونه */ ];
                // displayProducts(allProducts, '');
            });
    }

    // تابع برای نمایش محصولات با اعمال فیلتر و جستجو
    function displayProducts(products, searchTerm = '') {
        if (!searchResultsContainer) return;
        searchResultsContainer.innerHTML = ''; // پاک کردن نتایج قبلی

        const minPrice = parseFloat(minPriceInput.value) || 0;
        const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

        products.forEach((product, index) => {
            // اطمینان از اینکه قیمت محصول قابل تبدیل به عدد است
            const productPriceRaw = product.price.replace(/,/g, '').replace(' تومان', '').trim();
            const productPrice = parseFloat(productPriceRaw) || 0;

            const matchesSearch = searchTerm === '' ||
                                  product.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
                                  product.name.toLowerCase().includes(searchTerm) ||
                                  product.product_code.toLowerCase().includes(searchTerm);

            const matchesFilter = productPrice >= minPrice && productPrice <= maxPrice;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.setProperty('--i', index); // برای انیمیشن احتمالی

            if (!matchesSearch || !matchesFilter) {
                productCard.classList.add('hidden');
                productCard.style.display = 'none'; // اطمینان از مخفی شدن کامل
            }

            productCard.innerHTML = `
                <img src="${product.image_urls[0]}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-code">کد: ${product.product_code}</span>
                    <p class="product-price">${product.price}</p>
                    <p class="product-description">
                        ${product.description}
                    </p>
                    <a href="watches.html?id=${product.id}" class="details-button">مشاهده جزئیات</a>
                </div>
            `;
            searchResultsContainer.appendChild(productCard);
        });
    }

    // رویداد کلیک بر روی آیکون فیلتر
    if (filterIcon && priceFilterContainer) {
        filterIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // جلوگیری از بسته شدن با کلیک روی مستند
            const isDisplayed = priceFilterContainer.style.display === 'block';
            priceFilterContainer.style.display = isDisplayed ? 'none' : 'block';
        });
    }

    // بستن کادر فیلتر با کلیک خارج از آن
    document.addEventListener('click', (event) => {
        if (priceFilterContainer && !priceFilterContainer.contains(event.target) && event.target !== filterIcon) {
            priceFilterContainer.style.display = 'none';
        }
    });

    // رویداد کلیک بر روی دکمه اعمال فیلتر
    if (applyFilterButton && searchResultsContainer) {
        applyFilterButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            displayProducts(allProducts, searchTerm); // نمایش مجدد محصولات با اعمال فیلتر
            priceFilterContainer.style.display = 'none'; // بستن کادر فیلتر پس از اعمال
        });
    }

    // رویداد کلیک بر روی دکمه جستجو (هم در هدر و هم در صفحه جستجو)
    if (searchButton && searchInput && searchResultsContainer) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            // اگر در صفحه جستجو هستیم (این اسکریپت در search.html بارگذاری شده)
            if (window.location.pathname.endsWith('search.html')) {
                displayProducts(allProducts, searchTerm); // فقط نتایج را فیلتر کن
            } else {
                // اگر در صفحه دیگری هستیم، به صفحه جستجو رفته و کوئری را پاس بده
                window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
            }
        });

        // همچنین، با زدن Enter در فیلد جستجو، جستجو انجام شود
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // جلوگیری از رفتار پیش‌فرض فرم
                searchButton.click(); // شبیه‌سازی کلیک دکمه جستجو
            }
        });
    }

    // بارگذاری اولیه محصولات
    loadProducts();

    // اگر در صفحه جستجو هستیم و پارامتر Q در URL وجود دارد، مقدار فیلتر قیمت را نیز تنظیم کن
    const urlParams = new URLSearchParams(window.location.search);
    const minPriceParam = urlParams.get('minPrice');
    const maxPriceParam = urlParams.get('maxPrice');
    if (minPriceParam !== null) minPriceInput.value = minPriceParam;
    if (maxPriceParam !== null) maxPriceInput.value = maxPriceParam;

    // اگر پارامترهای قیمت در URL وجود دارند، بلافاصله فیلتر را اعمال کن
    if (minPriceParam !== null || maxPriceParam !== null) {
        const searchTerm = searchInput.value.trim().toLowerCase();
        displayProducts(allProducts, searchTerm);
    }

});