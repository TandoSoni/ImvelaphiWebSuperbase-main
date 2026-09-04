const express = require('express');
const { all, get, run, uid } = require('../db');
const { authOptional, authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();
const PRODUCT_CATALOG = {
  maker:['Advanced Maker Space Kit',46990], elf23:['23-in-1 Customization Kit',10990], elf24:['24-in-1 Customization Kit',10990],
  elf26:['26-in-1 Customization Kit',10990], elf17:['17-in-1 Customization Kit',10990], factory:['AI Factory Robot Kit',12990],
  sumo:['Trigram SUMO Robot Kit',12990], home:['AI Smart Home Learning Kit',12990], agriculture:['AI Smart Agriculture System',19990],
  starter:['Starter Maker Space Kit',34990], inventor:['Home Inventor Kit',3990], greenA:['Our Green World Python Kit',3990],
  weebot:['WeeBot mini STEM Robot V2.0',3990], aiot:['WeeCore Bot AIoT Robot',3990], elfK210:['ELF AIoT K210 Mainboard',3990],
  machine:['AI Machine Learning Advanced Pack',3990], lunar:['Lunar Exploration Field Kit',3990], iot:['IoT Learning Kit (ESP32)',4990],
  jeep:['WeeBot Jeep Classroom Robot Kit',5499], arduino:['Arduino Uno Robot Car Kit',8199]
};

router.post('/', authOptional, async (req, res) => {
  const { firstName, lastName, email, phone, address, notes, items } = req.body;
  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof email !== 'string' || typeof phone !== 'string' || typeof address !== 'string' || !firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !address.trim() || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ success:false, message:'Customer details and at least one product are required.' });
  }
  if (!/^[\p{L}][\p{L}\s'-]{1,49}$/u.test(firstName.trim()) || !/^[\p{L}][\p{L}\s'-]{1,49}$/u.test(lastName.trim())) {
    return res.status(400).json({ success:false, message:'Names must contain letters only.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || !/^(?:\+27|0)[\d\s-]{9,15}$/.test(phone.trim())) {
    return res.status(400).json({ success:false, message:'Enter a valid email address and phone number.' });
  }

  const cleanItems = items.map(item => {
    const id = String(item.id || '');
    const product = PRODUCT_CATALOG[id];
    return { id, name: product?.[0], price: product?.[1], quantity: Number(item.quantity) };
  });
  if (cleanItems.some(item => !item.name || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    return res.status(400).json({ success:false, message:'One or more products in the order are invalid.' });
  }

  const subtotal = cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 120000 ? 0 : 950;
  const orderId = uid('order');
  await run(`INSERT INTO orders (id,user_id,first_name,last_name,email,phone,delivery_address,notes,subtotal,delivery_fee,total)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [orderId, req.user?.id || null, firstName, lastName, email.toLowerCase(), phone, address, notes || null, subtotal, deliveryFee, subtotal + deliveryFee]);
  for (const item of cleanItems) {
    await run(`INSERT INTO order_items (id,order_id,product_id,product_name,unit_price,quantity) VALUES (?,?,?,?,?,?)`,
      [uid('item'), orderId, item.id, item.name, item.price, item.quantity]);
  }
  res.status(201).json({ success:true, order: { id:orderId, status:'requested', total:subtotal + deliveryFee } });
});

router.get('/', authRequired, roleRequired('admin'), async (req, res) => {
  const orders = await all(`SELECT o.*, u.email AS account_email FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`);
  const payload = await Promise.all(orders.map(async order => ({
    id: order.id, userId: order.user_id, firstName: order.first_name, lastName: order.last_name,
    email: order.email, phone: order.phone, address: order.delivery_address, notes: order.notes,
    subtotal: order.subtotal, deliveryFee: order.delivery_fee, total: order.total,
    status: order.status, createdAt: order.created_at,
    items: await all('SELECT product_id AS id, product_name AS name, unit_price AS price, quantity FROM order_items WHERE order_id = ?', [order.id])
  })));
  res.json({ success:true, orders:payload });
});

module.exports = router;