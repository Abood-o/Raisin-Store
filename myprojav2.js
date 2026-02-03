let currentProduct = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// دالة تسجيل الدخول
if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const userVal = document.getElementById("username").value;
        const passVal = document.getElementById("password").value;
        const errorDiv = document.getElementById("loginErrorMessage");

        // التحقق من بيانات المستخدم (admin/123 كمثال)
        const user = users.find(u => u.username === userVal && u.password === passVal);

        if (userVal !== "" && passVal !=="") {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("currentUser", userVal);
            checkAuth();
        } else {
            errorDiv.innerText = "اسم المستخدم أو كلمة المرور غير صحيحة.";
            errorDiv.style.display = "block";
        }
    });
}

// دالة التحقق من حالة الدخول
function checkAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("mainSection").style.display = "block";
        loadProducts();
    } else {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("mainSection").style.display = "none";
    }
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    location.reload();
}

// دالة تحميل المنتجات
function loadProducts() {
    const container = document.getElementById("productList");
    if (!container) return;
    container.innerHTML = "";
    
    products.forEach((p, index) => {
        const card = document.createElement("div");
        card.className = "product";
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p>${p.price} ريال / للكيلو</p>
            <div class="product-controls">اختر الكمية:
                <input type="number" id="qty-${index}" min="1" value="1" class="quantity-input">
                <button onclick="addToCartFromMain(${index}, 'qty-${index}')" class="add-to-cart-btn">أضف للسلة</button>
            </div>
            <button onclick="showDetails(${index})" class="details-btn">عرض التفاصيل</button>
        `;
        container.appendChild(card);
    });
}

// دالة عرض تفاصيل المنتج 
function showDetails(index) {
    currentProduct = products[index];
    document.getElementById("mainSection").style.display = "none";
    document.getElementById("detailsSection").style.display = "block";

    document.getElementById("detailTitle").innerText = currentProduct.name;
    document.getElementById("detailImage").src = currentProduct.image;
    document.getElementById("detailDescription").innerText = currentProduct.description;
    document.getElementById("benefitsText").innerText = currentProduct.description; 
}

// دالة الإضافة للسلة
function addToCartFromMain(productIndex, quantityInputId) {
    const product = products[productIndex];
    const quantityInput = document.getElementById(quantityInputId);
    const quantity = parseInt(quantityInput.value);

    if (quantity > 0) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        quantityInput.value = 1;
        alert(`تمت إضافة ${quantity} كيلو من ${product.name} للسلة!`);
    } else {
        alert("الرجاء إدخال كمية صحيحة (أكبر من صفر).");
    }
}

function backToMain() {
    document.getElementById("detailsSection").style.display = "none";
    document.getElementById("cartSection").style.display = "none";
    document.getElementById("invoiceSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
}

function showCart() {
    document.getElementById("mainSection").style.display = "none";
    document.getElementById("cartSection").style.display = "block";

    const container = document.getElementById("cartItems");
    container.innerHTML = "";
    if (cart.length === 0) {
        container.innerHTML = "<p>السلة فارغة.</p>";
        return;
    }

    cart.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            - ${i + 1}) ${item.name} - ${item.quantity} كيلو - ${item.quantity * item.price} ريال 
            <img src="${item.image}" class="cart-thumbnail" alt="${item.name}" style="width:50px; height:50px; margin: 0 10px;">
            <button onclick="rmoveFromCart(${i})">❌ حذف</button>
        `;
        container.appendChild(div);
    });
}

function rmoveFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    showCart();
}

function generateInvoice() {
    if (cart.length === 0) {
        alert("سلتك فارغة!");
        return;
    }

    // محاكاة حفظ الطلب في Frontend
    document.getElementById("cartSection").style.display = "none";
    document.getElementById("invoiceSection").style.display = "block";

    const invoiceDiv = document.getElementById("invoiceContent");
    invoiceDiv.innerHTML = "";
    
    const successMsg = document.createElement("h3");
    successMsg.style.color = "green";
    successMsg.innerText = "تم تأكيد طلبك بنجاح (نسخة العرض)!";
    invoiceDiv.appendChild(successMsg);

    let total = 0;
    cart.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "invoiceRow";
        row.innerHTML = `<strong>${index + 1})</strong> ${item.name} - ${item.quantity} كيلو - ${item.quantity * item.price} ريال`;
        invoiceDiv.appendChild(row);
        total += item.quantity * item.price;
    });

    const totalRow = document.createElement("p");
    totalRow.innerHTML = `<strong>الإجمالي الكلي: ${total} ريال</strong>`;
    invoiceDiv.appendChild(totalRow);

    // حفظ الطلب في تاريخ الطلبات (اختياري)
    let ordersHistory = JSON.parse(localStorage.getItem("ordersHistory")) || [];
    ordersHistory.push({
        orderId: Date.now(),
        date: new Date().toLocaleString(),
        items: cart,
        total: total
    });
    localStorage.setItem("ordersHistory", JSON.stringify(ordersHistory));

    cart = [];
    localStorage.removeItem("cart");
}

function returnToMain() {
    document.getElementById("invoiceSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    [
        "footer",
        "aside",
        ".product",
        ".login-box",
        ".details-box", 
        "#cartItems",
        "#invoiceContent",
    ].forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.toggle("dark-mode");
        });
    });

    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("mode", mode);
}

// تشغيل عند تحميل الصفحة
window.onload = () => {
    if (localStorage.getItem("mode") === "dark") {
        toggleDarkMode();
    }
    checkAuth();
};
