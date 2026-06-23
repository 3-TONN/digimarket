const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON(file, defaultData = {}) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
        try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
        catch { return defaultData; }
    }
    return defaultData;
}

function saveJSON(file, data) {
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), bot: botStatus });
});

app.get('/api/users', (req, res) => {
    res.json(Object.values(loadJSON('users.json', {})));
});

app.get('/api/products', (req, res) => {
    res.json(loadJSON('products.json', []));
});

app.post('/api/products', (req, res) => {
    const products = loadJSON('products.json', []);
    const newProduct = { id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1, ...req.body, created_at: new Date().toISOString() };
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
        res.status(404).json({ error: 'Not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    let products = loadJSON('products.json', []);
    products = products.filter(p => p.id !== parseInt(req.params.id));
    saveJSON('products.json', products);
    res.json({ success: true });
});

app.get('/api/settings', (req, res) => {
    res.json(loadJSON('settings.json', { commission: 10, welcome_message: 'Добро пожаловать!', maintenance: false }));
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
    res.json({
        total_users: Object.keys(users).length,
        today_users: Object.values(users).filter(u => u.last_seen && u.last_seen.startsWith(today)).length,
        total_products: products.length,
        total_orders: orders.length,
        total_revenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
    });
});

app.post('/api/broadcast', (req, res) => {
    res.json({ success: true, message: 'Рассылка запущена' });
});

let botStatus = 'not started';

function startBot() {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken || botToken === 'YOUR_BOT_TOKEN') {
        console.log('BOT_TOKEN not set, bot disabled');
        botStatus = 'disabled (no token)';
        return;
    }

    console.log('Starting Telegram bot...');
    botStatus = 'starting';

    const botProcess = spawn('python', ['bot/bot.py'], {
        env: { ...process.env },
        stdio: 'inherit'
    });

    botProcess.on('error', (err) => {
        console.error('Bot error:', err.message);
        botStatus = 'error: ' + err.message;
    });

    botProcess.on('exit', (code) => {
        console.log(`Bot exited with code ${code}`);
        botStatus = 'exited (' + code + ')';
        if (code !== 0) {
            console.log('Restarting bot in 5 seconds...');
            botStatus = 'restarting...';
            setTimeout(startBot, 5000);
        }
    });

    botStatus = 'running';
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}`);
    startBot();
});
