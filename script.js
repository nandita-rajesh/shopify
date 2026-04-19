let products = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch("products.json");
        products = await response.json();

        console.log(products);

        displayProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart = cart.map(item => ({
    ...item,
    quantity: item.quantity || 1
}));

// Display products
function displayProducts(items) {
    const container = document.getElementById("products");
    container.innerHTML = "";

    items.forEach(product => {
        const cartItem = cart.find(p => p.id === product.id);

        container.innerHTML += `
            <div class="product" onclick="openProduct(${product.id})">
                <div class="wishlist" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
                    ${wishlist.includes(product.id)
                    ? `<img src="icons/black_heart.png" class="wishlist-icon">`
                    : `<img src="icons/outline_heart.png" class="wishlist-icon">`
                    }
                </div>
                <div class="image-box">
                    <img src="${product.image}">
                </div>
                <h3>${product.name}</h3>
                <p>₹${product.price}</p>

                ${
                    cartItem
                    ? `
                    <div class="qty-controls">
                        <button onclick="event.stopPropagation(); decreaseQty(${product.id})">
                            <svg width="12" height="12" viewBox="0 0 24 24">
                                <path d="M5 12h14" stroke="black" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>

                        <span>${cartItem.quantity}</span>

                        <button onclick="event.stopPropagation(); increaseQty(${product.id})">
                            <svg width="12" height="12" viewBox="0 0 24 24">
                                <path d="M12 5v14M5 12h14" stroke="black" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>`
                    : `<button onclick="event.stopPropagation(); addToCart(${product.id})">
                        Add to Cart
                    </button>`
                }
            </div>
        `;
    });
}

// Add to cart
function addToCart(id) {
    const product = products.find(p => p.id === id);

    cart.push({ ...product, quantity: 1 });

    updateCart();
    displayProducts(products);
    showToast("Added to cart");
}

// Update carts UI
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("total");
    const countEl = document.getElementById("cart-count");

    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">

                <div style="display:flex; gap:10px; align-items:center;">
                    <img src="${item.image}" class="cart-img">

                    <div>
                        <strong>${item.name}</strong><br>
                        ₹${item.price} × ${item.quantity} = 
                        <strong>₹${item.price * item.quantity}</strong>
                    </div>
                </div>

                <div class="qty-controls">
                    <button onclick="decreaseQty(${item.id})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQty(${item.id})">+</button>
                </div>

            </div>
        `;
    });

    totalEl.innerText = total;
    countEl.innerText = count;

    localStorage.setItem("cart", JSON.stringify(cart));
}

//Clear cart
function clearCart() {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();
    displayProducts(products);

    showToast("Cart cleared");
}

// Increase quantity
function increaseQty(id) {
    const item = cart.find(p => p.id === id);
    item.quantity++;

    updateCart();
    displayProducts(products);
}

// Decrease quantity
function decreaseQty(id) {
    const item = cart.find(p => p.id === id);

    if (item.quantity > 1) {
        item.quantity--;
    } else {
        cart = cart.filter(p => p.id !== id);
    }

    updateCart();
    displayProducts(products);
}

//show the wishlist
function showWishlist() {
    const items = products.filter(p => wishlist.includes(p.id));

    if (items.length === 0) {
        showToast("Wishlist is empty");
        return;
    } else {
        displayProducts(items);
    }
}

//ipdating wishlinst
function updateWishlistCount() {
    document.getElementById("wishlist-count").innerText = wishlist.length;
}

//top 4 filters in navbar
function filterCategory(cat) {
    if (cat === "all") {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === cat);
        displayProducts(filtered);
    }
}

//sort products
document.getElementById("sort").addEventListener("change", (e) => {
    let sorted = [...products]; // copy array

    if (e.target.value === "low-high") {
        sorted.sort((a, b) => a.price - b.price);
    } 
    else if (e.target.value === "high-low") {
        sorted.sort((a, b) => b.price - a.price);
    }

    displayProducts(sorted);
});

// Toggle cart panel
function toggleCart() {
    document.getElementById("cart-panel").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

//Toggle wishlist
function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        showToast("Removed from wishlist");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    updateWishlistCount();
    displayProducts(products);
}

// Toast
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.innerText = message; 
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}

// Search
document.getElementById("search").addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value)
    );
    displayProducts(filtered);
});

//open product card modal
function openProduct(id) {
    const product = products.find(p => p.id === id);

    document.body.classList.add("modal-open");

    document.getElementById("modal-img").src = product.image;
    document.getElementById("modal-name").innerText = product.name;
    document.getElementById("modal-price").innerText = "₹" + product.price;
    document.getElementById("modal-desc").innerText = product.description;

    const container = document.getElementById("modal-cart-btn");

    if (!container) return;

    const cartItem = cart.find(p => p.id === id);

    if (cartItem) {
        container.innerHTML = `
            <div class="qty-controls">
                <button onclick="event.stopPropagation(); decreaseQty(${id}); openProduct(${id});">−</button>
                <span>${cartItem.quantity}</span>
                <button onclick="event.stopPropagation(); increaseQty(${id}); openProduct(${id});">+</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button onclick="event.stopPropagation(); addToCart(${id}); openProduct(${id});">
                Add to Cart
            </button>
        `;
    }

    document.getElementById("product-modal").classList.add("active");
}

//close product
function closeProduct() {
    const modal = document.getElementById("product-modal");

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
}


document.getElementById("checkout-btn").addEventListener("click", openCheckout);

//checkout
function openCheckout() {
    if (cart.length === 0) {
        showToast("Cart is empty");
        return;
    }

    const container = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        container.innerHTML += `
            <div style="margin-bottom:10px;">
                ${item.name} × ${item.quantity} = ₹${item.price * item.quantity}
            </div>
        `;
    });

    totalEl.innerText = total;

    document.getElementById("checkout-modal").classList.add("active");
}

//close chekout
function closeCheckout() {
    document.getElementById("checkout-modal").classList.remove("active");
}

// place order
function placeOrder() {
    showToast("Order placed successfully");

    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();
    displayProducts(products);

    closeCheckout();
}



// INITIAL LOAD
loadProducts(); 
updateCart();
updateWishlistCount();

document.getElementById("sort").value = "";


const modal = document.getElementById("product-modal");

modal.addEventListener("click", (e) => {
    if (!e.target.closest(".modal-content")) {
        closeProduct();
    }
});

document.querySelector(".modal-content").addEventListener("click", (e) => {
    e.stopPropagation();
});