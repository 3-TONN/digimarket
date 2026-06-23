document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#0a0a0f');
        tg.setBackgroundColor('#0a0a0f');
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts(btn.dataset.category);
        });
    });

    function filterProducts(category) {
        const products = document.querySelectorAll('.product-card');
        let delay = 0;
        products.forEach(product => {
            const productCategory = product.dataset.category;
            if (category === 'all' || productCategory === category) {
                product.style.display = '';
                product.style.opacity = '0';
                product.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                    product.style.opacity = '1';
                    product.style.transform = 'translateY(0) scale(1)';
                }, delay);
                delay += 80;
            } else {
                product.style.opacity = '0';
                product.style.transform = 'translateY(-10px) scale(0.95)';
                setTimeout(() => {
                    product.style.display = 'none';
                }, 200);
            }
        });
    }

    document.querySelectorAll('.product-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const svg = btn.querySelector('svg');
            if (svg.getAttribute('fill') !== 'none') {
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                btn.style.background = 'rgba(0, 0, 0, 0.4)';
                showNotification('Удалено из избранного', 'info');
            } else {
                svg.setAttribute('fill', '#EC4899');
                svg.setAttribute('stroke', '#EC4899');
                btn.style.background = 'rgba(236, 72, 153, 0.3)';
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
                showNotification('Добавлено в избранное', 'success');
            }
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.product-title').textContent;
            const price = card.querySelector('.price-stars').textContent;
            const image = card.querySelector('.product-image');
            openProductModal(title, price, image);
        });
    });

    function openProductModal(title, price, imageEl) {
        const modal = document.getElementById('productModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');

        modalTitle.textContent = title;
        modalPrice.textContent = price;

        modalImage.className = 'modal-product-image ' + Array.from(imageEl.classList).find(c => c.startsWith('gradient-'));

        modal.classList.add('show');

        modal.querySelector('.modal-overlay').onclick = () => modal.classList.remove('show');
        modal.querySelector('.modal-close').onclick = () => modal.classList.remove('show');

        document.getElementById('modalBuy').onclick = () => {
            if (tg) {
                tg.close();
            }
            showNotification('Оплата через Telegram Stars', 'info');
            modal.classList.remove('show');
        };
    }

    document.getElementById('adminBtn').addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    const animateOnScroll = () => {
        document.querySelectorAll('.product-card').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
});
