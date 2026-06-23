document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
    }

    let products = [
        { id: 1, name: 'Notion Life OS', price: 500, category: 'templates' },
        { id: 2, name: 'Kawaii Stickers', price: 150, category: 'stickers' },
        { id: 3, name: 'AI Writer Bot', price: 800, category: 'bots' },
        { id: 4, name: 'Cinematic Presets', price: 245, category: 'presets' }
    ];

    let users = [
        { id: 123456, username: 'user1', name: 'Иван', date: '2026-06-23' },
        { id: 234567, username: 'user2', name: 'Мария', date: '2026-06-23' },
        { id: 345678, username: 'user3', name: 'Алексей', date: '2026-06-22' }
    ];

    function updateStats() {
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalProducts').textContent = products.length;
    }

    function renderProducts() {
        document.getElementById('productsList').innerHTML = products.map(p => `
            <div class="product-admin-item">
                <div class="product-admin-info">
                    <span class="product-admin-name">${p.name}</span>
                    <span class="product-admin-price">⭐ ${p.price}</span>
                </div>
                <div class="product-admin-actions">
                    <button class="btn-ghost small" onclick="deleteProduct(${p.id})">🗑</button>
                </div>
            </div>
        `).join('');
    }

    function renderUsers() {
        document.getElementById('usersList').innerHTML = users.map(u => `
            <div class="user-item">
                <div class="user-avatar">${u.name[0]}</div>
                <div class="user-info">
                    <span class="user-name">${u.name}</span>
                    <span class="user-username">@${u.username}</span>
                </div>
                <div class="user-meta">
                    <span class="user-date">${u.date}</span>
                </div>
            </div>
        `).join('');
    }

    function showNotification(message, type = 'success') {
        const n = document.getElementById('notification');
        n.querySelector('.notification-icon').textContent = type === 'success' ? '✓' : 'ℹ';
        n.querySelector('.notification-text').textContent = message;
        n.className = `notification notification-${type} show`;
        setTimeout(() => n.classList.remove('show'), 3000);
    }

    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productModal').classList.add('show');
    });

    document.getElementById('productModal').querySelector('.modal-overlay').addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('show');
    });

    document.getElementById('productModal').querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('show');
    });

    document.getElementById('saveProduct').addEventListener('click', () => {
        const name = document.getElementById('productName').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const desc = document.getElementById('productDesc').value.trim();

        if (!name || !price) {
            showNotification('Заполните название и цену', 'error');
            return;
        }

        products.push({ id: products.length + 1, name, price, category, desc });
        renderProducts();
        updateStats();
        document.getElementById('productModal').classList.remove('show');
        showNotification('Товар добавлен');
        document.getElementById('productName').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productPrice').value = '';
    });

    window.deleteProduct = (id) => {
        products = products.filter(p => p.id !== id);
        renderProducts();
        updateStats();
        showNotification('Товар удалён');
    };

    document.getElementById('sendBroadcast').addEventListener('click', () => {
        const text = document.getElementById('broadcastText').value.trim();
        if (!text) {
            showNotification('Введите текст', 'error');
            return;
        }
        document.getElementById('broadcastStatus').innerHTML =
            '<div class="status-success">✅ Рассылка отправлена пользователям</div>';
        document.getElementById('broadcastText').value = '';
        showNotification('Рассылка отправлена');
    });

    updateStats();
    renderProducts();
    renderUsers();
});
