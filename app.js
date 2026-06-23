document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            burger.classList.toggle('active');
        });

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                burger.classList.remove('active');
            });
        });
    }

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.category;
                filterProducts(category);
            });
        });
    }

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

    const favButtons = document.querySelectorAll('.product-fav');
    favButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const svg = btn.querySelector('svg');
            const isFavorited = svg.getAttribute('fill') !== 'none';

            if (isFavorited) {
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                btn.style.background = 'rgba(0, 0, 0, 0.4)';
                showNotification('Удалено из избранного', 'info');
            } else {
                svg.setAttribute('fill', '#EC4899');
                svg.setAttribute('stroke', '#EC4899');
                btn.style.background = 'rgba(236, 72, 153, 0.3)';
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 200);
                showNotification('Добавлено в избранное', 'success');
            }
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.product-title').textContent;
            const price = card.querySelector('.price-stars').textContent;
            showProductModal(title, price);
        });
    });

    document.querySelectorAll('.seller-card .btn-outline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sellerName = btn.closest('.seller-card').querySelector('h3').textContent;
            showNotification(`Профиль ${sellerName} открыт`, 'info');
        });
    });

    document.querySelectorAll('.step-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('expanded');
        });
    });

    const loginBtn = document.getElementById('loginBtn');
    const sellerBtn = document.getElementById('sellerBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showAuthModal('login');
        });
    }

    if (sellerBtn) {
        sellerBtn.addEventListener('click', () => {
            showAuthModal('seller');
        });
    }

    document.querySelectorAll('.cta-actions .btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            showAuthModal('seller');
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.category-card, .product-card, .step-card, .seller-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
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

    function showProductModal(title, price) {
        const existing = document.querySelector('.modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">✕</button>
                <div class="modal-product-image gradient-1"></div>
                <h3>${title}</h3>
                <p class="modal-price">${price}</p>
                <p class="modal-desc">Цифровой товар будет доставлен мгновенно после оплаты через Telegram Stars.</p>
                <div class="modal-seller">
                    <div class="seller-avatar gradient-3"></div>
                    <span>@seller</span>
                </div>
                <button class="btn-primary full-width modal-buy">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Купить за ${price}
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.modal-buy').addEventListener('click', () => {
            showNotification('Оплата через Telegram Stars будет доступна после подключения бота', 'info');
            closeModal(modal);
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function showAuthModal(type) {
        const existing = document.querySelector('.modal');
        if (existing) existing.remove();

        const isLogin = type === 'login';
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">✕</button>
                <div class="modal-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="1.5">
                        ${isLogin
                            ? '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>'
                            : '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>'
                        }
                    </svg>
                </div>
                <h3>${isLogin ? 'Вход в аккаунт' : 'Стать продавцом'}</h3>
                <p class="modal-desc">${isLogin
                    ? 'Войдите через Telegram для доступа к покупкам и избранному.'
                    : 'Загружайте свои цифровые товары и зарабатывайте через Telegram Stars.'
                }</p>
                <button class="btn-primary full-width modal-telegram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    Открыть в Telegram
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.modal-telegram').addEventListener('click', () => {
            showNotification('Telegram WebApp будет доступен после подключения бота', 'info');
            closeModal(modal);
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }

    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.category-card, .product-card, .step-card, .seller-card, .faq-item');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    document.querySelectorAll('.mini-cat').forEach(cat => {
        cat.addEventListener('click', () => {
            document.querySelectorAll('.mini-cat').forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
        });
    });

    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Социальная сеть будет доступна после запуска', 'info');
        });
    });

    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') {
                e.preventDefault();
                showNotification('Раздел будет доступен после запуска', 'info');
            }
        });
    });
});
