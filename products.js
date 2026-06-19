// --- جاوا اسکریپت برای بارگذاری دینامیک اطلاعات و اسلایدر تصاویر ---

document.addEventListener('DOMContentLoaded', () => {
    // دریافت آیدی محصول از URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // یافتن المنت‌های مورد نیاز
    const productDetailContainer = document.querySelector('.product-detail-container'); // المنت اصلی صفحه جزئیات
    const mainImage = document.getElementById('main-product-image');
    const thumbnailsContainer = document.querySelector('.thumbnail-slider');
    const thumbnailWrapper = document.querySelector('.thumbnail-slider-wrapper'); // برای کنترل اسکرول
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const returnButton = document.getElementById('return-button'); // دکمه بازگشت

    let currentImageIndex = 0;
    let isAnimating = false;
    let allProductImages = []; // آرایه‌ای برای نگهداری URL تمام تصاویر محصول فعلی
    let totalImages = 0; // تعداد کل تصاویر محصول

    // --- توابع بارگذاری داده‌ها ---
    function fetchProductData() {
        fetch('products.json') // آدرس فایل JSON شما
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                const product = products.find(p => p.id === productId);
                if (product) {
                    displayProductDetails(product);
                } else {
                    console.error("Product not found!");
                    productDetailContainer.innerHTML = '<h1 style="color: red; text-align: center; width: 100%;">محصول مورد نظر یافت نشد.</h1>';
                }
            })
            .catch(error => {
                console.error("Error fetching or parsing product data:", error);
                productDetailContainer.innerHTML = '<h1 style="color: red; text-align: center; width: 100%;">خطا در بارگذاری اطلاعات محصول.</h1>';
            });
    }

    // --- نمایش جزئیات محصول ---
    function displayProductDetails(product) {
        document.title = `جزئیات: ${product.name}`;

        // نمایش اطلاعات اصلی
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-code').textContent = `کد محصول : ${product.product_code || ''}`; // چک کردن برای وجود product_code
        document.getElementById('product-price').textContent = product.price;
        document.getElementById('product-description').textContent = product.description;
        document.getElementById('product-description_2').textContent = product.description_2;

        // بارگذاری تصاویر
        if (product.image_urls && product.image_urls.length > 0) {
            allProductImages = product.image_urls; // ذخیره URL تصاویر
            totalImages = allProductImages.length;
            mainImage.src = allProductImages[0]; // نمایش اولین تصویر به صورت پیش‌فرض
            currentImageIndex = 0; // تنظیم ایندکس فعلی

            // ساخت اسلایدر تصاویر کوچک
            thumbnailsContainer.innerHTML = ''; // پاک کردن هر محتوای قبلی
            allProductImages.forEach((url, index) => {
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.alt = `${product.name} - تصویر ${index + 1}`;
                thumb.classList.add('thumbnail');
                if (index === 0) {
                    thumb.classList.add('active'); // اولین تصویر به عنوان فعال
                }
                thumb.addEventListener('click', () => showImage(index)); // اضافه کردن event listener به هر تصویر کوچک
                thumbnailsContainer.appendChild(thumb);
            });
            updateNavButtons(); // تنظیم وضعیت دکمه‌های ناوبری اولیه
        } else {
            // اگر محصول تصویری نداشت
            mainImage.src = 'placeholder.jpg'; // یا یک تصویر پیش‌فرض
            thumbnailsContainer.innerHTML = '<p>تصویری برای این محصول موجود نیست.</p>';
            updateNavButtons();
        }

        // نمایش مشخصات
        const specsList = document.getElementById('specs-list');
        specsList.innerHTML = ''; // پاک کردن هر محتوای قبلی
        if (product.specs) {
            for (const [key, value] of Object.entries(product.specs)) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="specs-key">${key}:</span> <span class="specs-value">${value}</span>`;
                specsList.appendChild(li);
            }
        }
    }

    // --- تابع نمایش تصویر (با انیمیشن) ---
function showImage(index) {
    // اطمینان از اینکه ایندکس در محدوده معتبر تصاویر است
    const validIndex = (index % totalImages + totalImages) % totalImages;

    if (isAnimating || validIndex === currentImageIndex) return; // جلوگیری از انیمیشن همزمان یا کلیک روی تصویر فعلی

    isAnimating = true;
    const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');

    // حذف کلاس active از تصویر کوچک فعلی
    thumbnails[currentImageIndex].classList.remove('active');

    // تعیین جهت انیمیشن
    let animationClassOut = '';
    let animationClassIn = '';
    if (validIndex > currentImageIndex) {
        animationClassOut = 'slide-out-right'; // خروج به راست
        animationClassIn = 'slide-in-left'; // ورود از چپ
    } else {
        animationClassOut = 'slide-out-left'; // خروج به چپ
        animationClassIn = 'slide-in-right'; // ورود از راست
    }
    // حذف کلاس‌های قبلی انیمیشن برای اطمینان
    mainImage.classList.remove('slide-out-left', 'slide-in-right', 'slide-out-right', 'slide-in-left');

    // اضافه کردن کلاس خروج
    mainImage.classList.add(animationClassOut);

    // تغییر عکس اصلی بعد از اتمام انیمیشن خروج
    setTimeout(() => {
        mainImage.src = allProductImages[validIndex];
        mainImage.classList.remove(animationClassOut);
        mainImage.classList.add(animationClassIn);

        // فعال کردن تصویر کوچک جدید
        thumbnails[validIndex].classList.add('active');
        currentImageIndex = validIndex; // به‌روزرسانی ایندکس فعلی

        // حذف انیمیشن ورود بعد از اتمام آن
        setTimeout(() => {
            mainImage.classList.remove(animationClassIn);
            isAnimating = false;
        }, 400); // باید با duration انیمیشن CSS مطابقت داشته باشد (CSS: 0.4s)
    }, 400); // باید با duration انیمیشن CSS مطابقت داشته باشد (CSS: 0.4s)

    // اسکرول کردن تصاویر کوچک برای نمایش تصویر فعال
    scrollThumbnailIntoView(validIndex);
    updateNavButtons(); // به‌روزرسانی وضعیت دکمه‌های راست/چپ
}

// --- تابع به‌روزرسانی وضعیت دکمه‌های ناوبری (فعال/غیرفعال) ---
// این تابع حالا همیشه دکمه‌ها را فعال نگه می‌دارد چون حلقه داریم
function updateNavButtons() {
    // در حالت حلقه بی‌نهایت، دکمه‌ها همیشه فعال هستند
    prevBtn.disabled = false;
    prevBtn.style.opacity = '1';
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
}

    // --- تابع برای اسکرول کردن تصویر کوچک به دید ---
    function scrollThumbnailIntoView(index) {
        const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
        if (thumbnails.length > 0 && thumbnails[index]) {
            thumbnails[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', // اسکرول تا جایی که لازم است
                inline: 'center' // وسط چین کردن در اسلایدر افقی
            });
        }
    }

        // --- هندل کردن کلیک دکمه‌های ناوبری ---
nextBtn.addEventListener('click', () => {
    showImage(currentImageIndex + 1); // رفتن به تصویر بعدی (منطق حلقه در showImage مدیریت می‌شود)
});

prevBtn.addEventListener('click', () => {
    showImage(currentImageIndex - 1); // رفتن به تصویر قبلی (منطق حلقه در showImage مدیریت می‌شود)
});

    // --- هندل کردن دکمه بازگشت ---
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            window.history.back(); // بازگشت به صفحه قبلی مرورگر
        });
    }

    // --- اجرای اولیه ---
    if (!productId) {
        console.error("Product ID not found in URL!");
        // نمایش پیام خطا در صفحه
        productDetailContainer.innerHTML = '<h1 style="color: red; text-align: center; width: 100%;">شناسه محصول در آدرس صفحه یافت نشد.</h1>';
    } else {
        fetchProductData(); // شروع فرآیند بارگذاری اطلاعات محصول
    }

    // --- جلوگیری از اسکرول ناخواسته هنگام کلیک روی تصاویر کوچک ---
    // این کد اطمینان حاصل می‌کند که کلیک روی تصاویر کوچک، صفحه را اسکرول نمی‌کند.
    // این کار با event delegation در thumbnail-slider انجام می‌شود.
    // اگر thumbnail-slider یک لینک باشد، preventDefault برای آن لازم است.
    // اما چون ما مستقیماً event listener را به خود img اضافه کرده‌ایم، نیازی به این کد اضافی نیست،
    // مگر اینکه بخواهیم اسکرول خودکار مرورگر را کنترل کنیم.

    // مثال: اگر بخواهیم از اسکرول نرم مرورگر جلوگیری کنیم
    // document.querySelectorAll('.thumbnail-slider .thumbnail').forEach(thumb => {
    //     thumb.addEventListener('click', function(e) {
    //         e.preventDefault(); // جلوگیری از اسکرول پیش‌فرض مرورگر
    //     });
    // });
});