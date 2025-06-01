

let filteredProducts = [...products];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentFilter = "all";

// Elements
const productList = document.getElementById("productList");
const cartPanel = document.getElementById("cartPanel");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

const productDetailModal = document.getElementById("productDetail");
const mainImage = document.getElementById("mainImage");
const detailTitle = document.getElementById("detailTitle");
const detailPrice = document.getElementById("detailPrice");
const detailDescription = document.getElementById("detailDescription");
const thumbnailContainer = document.getElementById("thumbnailContainer");
const detailAddToCartBtn = document.getElementById("detailAddToCartBtn");

const checkoutFormModal = document.getElementById("checkoutForm");
const checkoutProductsDiv = document.getElementById("checkoutProducts");

let currentProduct = null;
let currentImageIndex = 0;

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalCount;
}

function calculateCartTotal() {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function renderProducts() {
  productList.innerHTML = "";
  filteredProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.images[0]}" alt="${p.title}" onclick="showProductDetail(${p.id})" />
      <h3>${p.title}</h3>
      <p>₹${p.price}</p>
      <button class="add-to-cart" onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productList.appendChild(card);
  });
}

function filterGender(gender) {
  currentFilter = gender;
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  if (gender === "all") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter((p) => p.gender === gender);
  }
  renderProducts();
}

// Cart functions
function renderCart() {
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0";
    updateCartCount();
    return;
  }
  cart.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div class="cart-item-card">
        <img class="cart-item-img" src="${item.image}" alt="${item.title}" />
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">₹${item.price} x ${item.quantity}</div>
        </div>
      </div>
      <div class="cart-controls">
        <button onclick="changeQuantity(${item.id}, -1)">-</button>
        <button onclick="changeQuantity(${item.id}, 1)">+</button>
        <button class="delete-btn" onclick="removeFromCart(${item.id})"><i class='bx  bx-trash-alt'  style='color:#000000'></i> </button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartTotal.textContent = calculateCartTotal();
  updateCartCount();
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const cartItem = cart.find((item) => item.id === id);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    });
  }
  saveCart();
  renderCart();
}

function changeQuantity(id, amount) {
  const cartItem = cart.find((item) => item.id === id);
  if (!cartItem) return;

  cartItem.quantity += amount;
  if (cartItem.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  if (confirm("Are you sure you want to clear the cart?")) {
    cart = [];
    saveCart();
    renderCart();
  }
}

function toggleCart() {
  cartPanel.classList.toggle("open");
}

// Product Detail modal
function showProductDetail(id) {
  currentProduct = products.find((p) => p.id === id);
  if (!currentProduct) return;

  currentImageIndex = 0;
  updateDetailModal();

  productDetailModal.style.display = "block";
}

function closeProductDetail() {
  productDetailModal.style.display = "none";
}

function updateDetailModal() {
  mainImage.src = currentProduct.images[currentImageIndex];
  detailTitle.textContent = currentProduct.title;
  detailPrice.textContent = "₹" + currentProduct.price;
  detailDescription.textContent = currentProduct.description;

  thumbnailContainer.innerHTML = "";
  currentProduct.images.forEach((img, i) => {
    const thumb = document.createElement("img");
    thumb.src = img;
    thumb.className = i === currentImageIndex ? "active" : "";
    thumb.onclick = () => {
      currentImageIndex = i;
      updateDetailModal();
    };
    thumbnailContainer.appendChild(thumb);
  });
}

document.getElementById("prevSlide").onclick = () => {
  if (!currentProduct) return;
  currentImageIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
  updateDetailModal();
};

document.getElementById("nextSlide").onclick = () => {
  if (!currentProduct) return;
  currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
  updateDetailModal();
};

detailAddToCartBtn.onclick = () => {
  if (!currentProduct) return;
  addToCart(currentProduct.id);
  closeProductDetail();
  toggleCart();
};

// Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  filteredProducts = products.filter((p) => p.title.toLowerCase().includes(query));
  renderProducts();
});

// Checkout form functions
function showCheckoutForm() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  checkoutProductsDiv.innerHTML = "";
  cart.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.image;
    img.className = "checkout-product-img";
    img.title = `${item.title} x ${item.quantity}`;
    checkoutProductsDiv.appendChild(img);
  });
  checkoutFormModal.style.display = "block";
}

function closeCheckoutForm() {
  checkoutFormModal.style.display = "none";
}

function submitCheckout(event) {
  event.preventDefault();

  const name = document.getElementById("userName").value.trim();
  const address = document.getElementById("userAddress").value.trim();
  const phone = document.getElementById("userPhone").value.trim();

  if (!name || !address || !phone) {
    alert("Please fill all fields.");
    return;
  }


  // Normally here you’d send the order to the backend
  alert(`Order placed successfully!\nName: ${name}\nAddress: ${address}\nPhone: ${phone}`);

  cart = [];
  saveCart();
  renderCart();
  closeCheckoutForm();
  toggleCart();
}

// Initialize
renderProducts();
renderCart();
