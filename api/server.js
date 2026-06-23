const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3001;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON(file, defaultData = {}) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            return defaultData;
        }
    }
    return defaultData;
}

function saveJSON(file, data) {
    const filePath = path.join(DATA_DIR, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
    const users = loadJSON('users.json', {});
    res.json(Object.values(users));
});

app.get('/api/users/:id', (req, res) => {
    const users = loadJSON('users.json', {});
    const user = users[req.params.id];
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/api/products', (req, res) => {
    const products = loadJSON('products.json', []);
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const products = loadJSON('products.json', []);
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.post('/api/products', (req, res) => {
    const products = loadJSON('products.json', []);
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        ...req.body,
        created_at: new Date().toISOString()
    };
    products.push(newProduct);
    saveJSON('products.json', products);
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const products = loadJSON('products.json', []);
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        saveJSON('products.json', products);
        res.json(products[index]);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    let products = loadJSON('products.json', []);
    products = products.filter(p => p.id !== parseInt(req.params.id));
    saveJSON('products.json', products);
    res.json({ success: true });
});

app.get('/api/orders', (req, res) => {
    const orders = loadJSON('orders.json', []);
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const orders = loadJSON('orders.json', []);
    const newOrder = {
        id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        ...req.body,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    saveJSON('orders.json', orders);
    res.json(newOrder);
});

app.get('/api/settings', (req, res) => {
    const settings = loadJSON('settings.json', {
        commission: 10,
        welcome_message: 'Добро пожаловать в DigiMarket!',
        maintenance: false
    });
    res.json(settings);
});

app.put('/api/settings', (req, res) => {
    const settings = loadJSON('settings.json', {});
    const newSettings = { ...settings, ...req.body };
    saveJSON('settings.json', newSettings);
    res.json(newSettings);
});

app.get('/api/stats', (req, res) => {
    const users = loadJSON('users.json', {});
    const products = loadJSON('products.json', []);
    const orders = loadJSON('orders.json', []);

    const today = new Date().toISOString().split('T')[0];
    const todayUsers = Object.values(users).filter(u =>
        u.last_seen && u.last_seen.startsWith(today)
    ).length;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

    res.json({
        total_users: Object.keys(users).length,
        today_users: todayUsers,
        total_products: products.length,
        total_orders: orders.length,
        total_revenue: totalRevenue
    });
});

app.post('/api/broadcast', (req, res) => {
    const { message, type, target } = req.body;
    const users = loadJSON('users.json', {});
    const user_list = Object.values(users);

    let recipients = user_list;
    if (target === 'active') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        recipients = user_list.filter(u => u.last_seen >= weekAgo);
    } else if (target === 'new') {
        const today = new Date().toISOString().split('T')[0];
        recipients = user_list.filter(u => u.last_seen === today);
    }

    res.json({
        success: true,
        recipients: recipients.length,
        message: 'Рассылка запущена'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}`);
});
