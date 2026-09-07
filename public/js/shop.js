const SHOP_PRODUCTS = {
  maker: { name:'Advanced Maker Space Kit', price:46990, type:'advanced', image:'images/photo-10.jpeg', text:'A complete maker-space foundation for deeper engineering projects and creative exploration.' },
  elf23: { name:'23-in-1 Customization Kit', price:10990, type:'classroom', image:'images/photo-11.jpeg', text:'A versatile platform for programming, design and systems thinking.' },
  elf24: { name:'24-in-1 Customization Kit', price:10990, type:'classroom', image:'images/photo-12.jpeg', text:'A STEM engineering platform with up to 24 intelligent projects to build and test.' },
  elf26: { name:'26-in-1 Customization Kit', price:10990, type:'advanced', image:'images/photo-13.jpeg', text:'Push creative engineering further with a high-level kit for ambitious learners.' },
  elf17: { name:'17-in-1 Customization Kit', price:10990, type:'classroom', image:'images/photo-14.jpeg', text:'Design, customize and program your own intelligent projects.' },
  factory: { name:'AI Factory Robot Kit', price:12990, type:'advanced', image:'images/photo-15.jpeg', text:'Bring artificial intelligence into real-world industrial scenarios.' },
  sumo: { name:'Trigram SUMO Robot Kit', price:12990, type:'advanced', image:'images/photo-16.jpeg', text:'A robotics competition kit for balance, mechanics and strategy.' },
  home: { name:'AI Smart Home Learning Kit', price:12990, type:'classroom', image:'images/tech-lab-showcase.jpg', text:'Explore smart home automation and practical AI through projects.' },
  agriculture: { name:'AI Smart Agriculture System', price:19990, type:'advanced', image:'images/gallery-5.jpg', text:'Learn how AI and smart technology are transforming agriculture.' },
  starter: { name:'Starter Maker Space Kit', price:34990, type:'classroom', image:'images/lab-hero.jpg', text:'A serious creative toolkit for making, tinkering and problem-solving.' },
  inventor: { name:'Home Inventor Kit', price:3990, type:'starter', image:'images/gallery-1.jpg', text:'Design and programme smart projects while learning electronics and coding.' },
  greenA: { name:'Our Green World Python Kit', price:3990, type:'starter', image:'images/gallery-2.jpg', text:'Learn Python through sustainability and real-world projects.' },
  weebot: { name:'WeeBot mini STEM Robot V2.0', price:3990, type:'starter', image:'images/gallery-3.jpg', text:'An approachable robot for hands-on programming and engineering.' },
  aiot: { name:'WeeCore Bot AIoT Robot', price:3990, type:'classroom', image:'images/gallery-4.jpg', text:'Explore connected technology and artificial intelligence.' },
  elfK210: { name:'ELF AIoT K210 Mainboard', price:3990, type:'advanced', image:'images/gallery-5.jpg', text:'Build AIoT capability with machine vision and connected devices.' },
  machine: { name:'AI Machine Learning Advanced Pack', price:3990, type:'advanced', image:'images/lab-feature-1.jpg', text:'Explore machine learning concepts through practical components.' },
  lunar: { name:'Lunar Exploration Field Kit', price:3990, type:'classroom', image:'images/lab-feature-2.jpg', text:'A hands-on mission kit for testing and refining robotic ideas.' },
  iot: { name:'IoT Learning Kit (ESP32)', price:4990, type:'starter', image:'images/gallery-2.jpg', text:'Build connected devices around the popular ESP32 microcontroller.' },
  jeep: { name:'WeeBot Jeep Classroom Robot Kit', price:5499, type:'classroom', image:'images/gallery-3.jpg', text:'Bring robotics into the classroom with a Bluetooth-controlled platform.' },
  arduino: { name:'Arduino Uno Robot Car Kit', price:8199, type:'classroom', image:'images/gallery-4.jpg', text:'A practical STEM build combining Arduino, electronics and robotics.' }
};

async function loadShopProducts() {
  try {
    const { supabase } = await import('./supabase.js');
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    if (!data?.length) return;
    Object.keys(SHOP_PRODUCTS).forEach(id => delete SHOP_PRODUCTS[id]);
    data.forEach(product => {
      SHOP_PRODUCTS[product.id] = {
        name: product.name,
        price: product.price,
        type: product.cat,
        image: product.image || 'images/lab-hero.jpg',
        text: product.desc || '',
        oldPrice: product.old_price,
        badge: product.badge
      };
    });
    renderShopGrid();
    renderCheckout();
  } catch (error) {
    console.warn('Supabase products unavailable; using the local shop catalogue.', error);
  }
}

function shopMoney(value) { return `R${value.toLocaleString('en-ZA')}`; }
function shopCart() { return JSON.parse(localStorage.getItem('imv_cart') || '{}'); }
function saveShopCart(cart) {
  localStorage.setItem('imv_cart', JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent('shopcartchange'));
}
function shopCartCount(cart = shopCart()) { return Object.values(cart).reduce((total, quantity) => total + quantity, 0); }
function shopCartTotal(cart = shopCart()) { return Object.entries(cart).reduce((total, [id, quantity]) => total + (SHOP_PRODUCTS[id]?.price || 0) * quantity, 0); }
function addShopProduct(id) { const cart = shopCart(); cart[id] = (cart[id] || 0) + 1; saveShopCart(cart); }
function changeShopQuantity(id, change) {
  const cart = shopCart();
  cart[id] = (cart[id] || 0) + change;
  if (cart[id] <= 0) delete cart[id];
  saveShopCart(cart);
}
function updateShopCount() {
  document.querySelectorAll('[data-cart-count]').forEach(element => { element.textContent = shopCartCount(); });
}
function shopProductCard(id, product) {
  return `<article class="product-card"><div class="product-image"><img src="${product.image}" alt="${product.name}"><span class="product-badge product-badge-light">${product.type}</span></div><div class="product-body"><div class="product-meta"><span>IMVELAPHI LAB</span><span>SA DELIVERY</span></div><h4>${product.name}</h4><p>${product.text}</p><div class="product-bottom"><strong>${shopMoney(product.price)}</strong><button class="btn btn-primary btn-sm" onclick="addShopProduct('${id}')">Add to cart <i class="fa-solid fa-plus"></i></button></div></div></article>`;
}
function renderShopGrid() {
  const grid = document.getElementById('shopProductGrid');
  if (!grid) return;
  const query = (document.getElementById('shopSearch')?.value || '').trim().toLowerCase();
  const filter = document.querySelector('.shop-filter.active')?.dataset.filter || 'all';
  const products = Object.entries(SHOP_PRODUCTS).filter(([, product]) => {
    return (filter === 'all' || product.type === filter) && `${product.name} ${product.text}`.toLowerCase().includes(query);
  });
  const status = document.getElementById('shopResultCount');
  if (status) status.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'} available`;
  grid.innerHTML = products.length ? products.map(([id, product]) => shopProductCard(id, product)).join('') : '<p class="catalog-empty">No products match your search. Try another category or keyword.</p>';
}
function renderCheckout() {
  const list = document.getElementById('checkoutItems');
  if (!list) return;
  const cart = shopCart();
  const entries = Object.entries(cart).filter(([id]) => SHOP_PRODUCTS[id]);
  list.innerHTML = entries.length ? entries.map(([id, quantity]) => {
    const product = SHOP_PRODUCTS[id];
    return `<div class="checkout-item"><img src="${product.image}" alt="${product.name}"><div class="checkout-item-copy"><strong>${product.name}</strong><span>${shopMoney(product.price)} each</span><div class="qty"><button type="button" onclick="changeShopQuantity('${id}', -1)" aria-label="Decrease quantity">-</button><b>${quantity}</b><button type="button" onclick="changeShopQuantity('${id}', 1)" aria-label="Increase quantity">+</button></div></div><strong>${shopMoney(product.price * quantity)}</strong></div>`;
  }).join('') : '<div class="checkout-empty"><i class="fa-solid fa-basket-shopping"></i><p>Your cart is empty.</p><a class="btn btn-outline" href="products.html">Browse products</a></div>';
  const subtotal = shopCartTotal(cart);
  document.querySelectorAll('[data-subtotal]').forEach(element => { element.textContent = shopMoney(subtotal); });
  document.querySelectorAll('[data-delivery]').forEach(element => { element.textContent = subtotal >= 120000 ? 'Free' : subtotal ? shopMoney(950) : shopMoney(0); });
  document.querySelectorAll('[data-order-total]').forEach(element => { element.textContent = shopMoney(subtotal ? subtotal + (subtotal >= 120000 ? 0 : 950) : 0); });
  const submit = document.getElementById('placeOrder');
  if (submit) submit.disabled = !entries.length;
}

document.addEventListener('DOMContentLoaded', () => {
  updateShopCount();
  renderShopGrid();
  renderCheckout();
  loadShopProducts();
  document.querySelectorAll('.shop-filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.shop-filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    renderShopGrid();
  }));
  document.addEventListener('shopcartchange', () => { updateShopCount(); renderShopGrid(); renderCheckout(); });
});
