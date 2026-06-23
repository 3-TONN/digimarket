document.addEventListener('DOMContentLoaded', () => {
    const broadcastType = document.getElementById('broadcastType');
    const messageType = document.getElementById('messageType');
    const broadcastText = document.getElementById('broadcastText');
    const mediaGroup = document.getElementById('mediaGroup');
    const sendBroadcast = document.getElementById('sendBroadcast');
    const previewBtn = document.getElementById('previewBtn');
    const broadcastStatus = document.getElementById('broadcastStatus');
    const userSearch = document.getElementById('userSearch');
    const usersList = document.getElementById('usersList');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const saveSettings = document.getElementById('saveSettings');
    const saveProduct = document.getElementById('saveProduct');
    const commission = document.getElementById('commission');
    const welcomeMsg = document.getElementById('welcomeMsg');
    const maintenance = document.getElementById('maintenance');

    let users = [];
    let products = [];

    const sampleUsers = [
        { id: 123456, username: 'user1', first_name: 'Иван', last_seen: '2026-06-23' },
        { id: 234567, username: 'user2', first_name: 'Мария', last_seen: '2026-06-23' },
        { id: 345678, username: 'user3', first_name: 'Алексей', last_seen: '2026-06-22' },
        { id: 456789, username: 'user4', first_name: 'Елена', last_seen: '2026-06-21' },
        { id: 567890, username: 'user5', first_name: 'Дмитрий', last_seen: '2026-06-20' },
    ];

    const sampleProducts = [
        { id: 1, name: 'Notion Life OS', price: 500, category: 'templates' },
        { id: 2, name: 'Kawaii Stickers', price: 150, category: 'stickers' },
        { id: 3, name: 'AI Writer Bot', price: 800, category: 'bots' },
        { id: 4, name: 'Cinematic Presets', price: 245, category: 'presets' },
        { id: 5, name: 'Telegram Bot Guide', price: 1200, category: 'guides' },
        { id: 6, name: 'UI Kit Pro', price: 750, category: 'design' },
    ];

    users = sampleUsers;
    products = sampleProducts;

    function updateStats() {
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalSales').textContent = '0';
        document.getElementById('totalRevenue').textContent = '⭐ 0';
    }

    function renderUsers(filter = '') {
        const filtered = users.filter(u =>
            u.username.toLowerCase().includes(filter.toLowerCase()) ||
            u.first_name.toLowerCase().includes(filter.toLowerCase()) ||
            String(u.id).includes(filter)
        );

        if (filtered.length === 0) {
            usersList.innerHTML = '<div class="empty-state">Нет пользователей</div>';
            return;
        }

        usersList.innerHTML = filtered.map(u => `
            <div class="user-item">
                <div class="user-avatar">${u.first_name[0]}</div>
                <div class="user-info">
                    <span class="user-name">${u.first_name}</span>
                    <span class="user-username">@${u.username || 'нет'}</span>
                </div>
                <div class="user-meta">
                    <span class="user-id">ID: ${u.id}</span>
                    <span class="user-date">${u.last_seen}</span>
                </div>
            </div>
        `).join('');
    }

    function renderProducts() {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = products.map(p => `
            <div class="product-admin-item">
                <div class="product-admin-info">
                    <span class="product-admin-name">${p.name}</span>
                    <span class="product-admin-price">⭐ ${p.price}</span>
                </div>
                <div class="product-admin-actions">
                    <button class="btn-ghost small" onclick="editProduct(${p.id})">✏️</button>
                    <button class="btn-ghost small" onclick="deleteProduct(${p.id})">🗑</button>
                </div>
            </div>
        `).join('');
    }

    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');

        icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        text.textContent = message;
        notification.className = `notification notification-${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    messageType.addEventListener('change', () => {
        mediaGroup.style.display = messageType.value === 'text' ? 'none' : 'block';
    });

    userSearch.addEventListener('input', (e) => {
        renderUsers(e.target.value);
    });

    sendBroadcast.addEventListener('click', () => {
        const text = broadcastText.value.trim();
        if (!text) {
            showNotification('Введите текст сообщения', 'error');
            return;
        }

        sendBroadcast.disabled = true;
        sendBroadcast.textContent = '⏳ Отправка...';

        let recipients = users;
        if (broadcastType.value === 'active') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            recipients = users.filter(u => u.last_seen >= weekAgo);
        } else if (broadcastType.value === 'new') {
            const today = new Date().toISOString().split('T')[0];
            recipients = users.filter(u => u.last_seen === today);
        }

        let sent = 0;
        let failed = 0;

        const interval = setInterval(() => {
            if (sent + failed >= recipients.length) {
                clearInterval(interval);
                sendBroadcast.disabled = false;
                sendBroadcast.textContent = '📤 Отправить';
                broadcastStatus.innerHTML = `
                    <div class="status-success">
                        ✅ Рассылка завершена<br>
                        📤 Отправлено: ${sent}<br>
                        ❌ Ошибок: ${failed}
                    </div>
                `;
                showNotification(`Рассылка завершена: ${sent} отправлено`, 'success');
                return;
            }

            const user = recipients[sent + failed];
            if (user) {
                sent++;
            } else {
                failed++;
            }
        }, 100);
    });

    previewBtn.addEventListener('click', () => {
        const text = broadcastText.value.trim();
        if (!text) {
            showNotification('Введите текст для предпросмотра', 'error');
            return;
        }

        const previewWindow = window.open('', '_blank', 'width=400,height=300');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Предпросмотр</title>
                <style>
                    body { font-family: Arial; padding: 20px; background: #1a1a2e; color: white; }
                    .msg { background: #2d2d44; padding: 15px; border-radius: 10px; }
                </style>
            </head>
            <body>
                <h3>Предпросмотр сообщения:</h3>
                <div class="msg">${text.replace(/\n/g, '<br>')}</div>
            </body>
            </html>
        `);
    });

    addProductBtn.addEventListener('click', () => {
        productModal.classList.add('show');
    });

    productModal.querySelector('.modal-overlay').addEventListener('click', () => {
        productModal.classList.remove('show');
    });

    productModal.querySelector('.modal-close').addEventListener('click', () => {
        productModal.classList.remove('show');
    });

    saveProduct.addEventListener('click', () => {
        const name = document.getElementById('productName').value.trim();
        const desc = document.getElementById('productDesc').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;

        if (!name || !price) {
            showNotification('Заполните название и цену', 'error');
            return;
        }

        products.push({
            id: products.length + 1,
            name,
            description: desc,
            price,
            category
        });

        renderProducts();
        updateStats();
        productModal.classList.remove('show');
        showNotification('Товар добавлен', 'success');

        document.getElementById('productName').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productPrice').value = '';
    });

    window.editProduct = (id) => {
        showNotification('Редактирование товара #' + id, 'info');
    };

    window.deleteProduct = (id) => {
        if (confirm('Удалить товар?')) {
            products = products.filter(p => p.id !== id);
            renderProducts();
            updateStats();
            showNotification('Товар удалён', 'success');
        }
    };

    saveSettings.addEventListener('click', () => {
        const settings = {
            commission: commission.value,
            welcome_message: welcomeMsg.value,
            maintenance: maintenance.checked
        };
        localStorage.setItem('digi_settings', JSON.stringify(settings));
        showNotification('Настройки сохранены', 'success');
    });

    const loadSettings = () => {
        const saved = localStorage.getItem('digi_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            commission.value = settings.commission || 10;
            welcomeMsg.value = settings.welcome_message || '';
            maintenance.checked = settings.maintenance || false;
        }
    };

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Выйти из админ-панели?')) {
            window.location.href = 'index.html';
        }
    });

    updateStats();
    renderUsers();
    renderProducts();
    loadSettings();
});
