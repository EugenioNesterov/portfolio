    // Language Switcher Logic
    let currentLang = 'ru';
    function switchLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('data-lang', lang);
        const elements = document.querySelectorAll('[data-en]');
        elements.forEach(el => {
            if (el.hasAttribute(`data-${lang}`)) {
                el.innerHTML = el.getAttribute(`data-${lang}`);
            }
        });

        // Update Toggle UI (Desktop & Mobile)
        const isEn = lang === 'en';
        const toggles = [document.getElementById('lang-toggle'), document.getElementById('lang-toggle-mobile')];
        toggles.forEach(t => { if (t) t.checked = isEn; });

        ['label-ru', 'mobile-label-ru'].forEach(id => {
            const el = document.getElementById(id);
            if (el) isEn ? el.classList.remove('lang-active') : el.classList.add('lang-active');
        });
        ['label-en', 'mobile-label-en'].forEach(id => {
            const el = document.getElementById(id);
            if (el) isEn ? el.classList.add('lang-active') : el.classList.remove('lang-active');
        });
    }

document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons (call once)
    lucide.createIcons();

    // --- AI Swarm Cursor Logic ---
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    if (window.innerWidth >= 768 && !isTouchDevice) {
        const swarmContainer = document.getElementById('cursor-swarm-container');
        const core = swarmContainer.querySelector('.swarm-core');
        const agents = swarmContainer.querySelectorAll('.swarm-agent');
        
        let mX = window.innerWidth / 2, mY = window.innerHeight / 2;
        let cX = mX, cY = mY;
        
        // Physics variables
        let angle = 0;
        let targetRadius = 15;
        let currentRadius = 15;
        let targetSpeed = 0.03;
        let currentSpeed = 0.03;

        window.addEventListener('mousemove', (e) => {
            mX = e.clientX;
            mY = e.clientY;
        });

        const interactives = document.querySelectorAll('a, button, label, .magnetic, [data-project-id]');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                targetRadius = 35; // Expand orbit
                targetSpeed = 0.12; // Speed up agents
                core.style.transform = 'scale(0.3)'; // Shrink core
                core.style.backgroundColor = '#ffffff'; // Turn white
                core.style.boxShadow = '0 0 10px #ffffff';
            });
            el.addEventListener('mouseleave', () => {
                targetRadius = 15; // Normal orbit
                targetSpeed = 0.03; // Normal speed
                core.style.transform = 'scale(1)'; // Restore core
                core.style.backgroundColor = '#f59e0b'; // Turn amber
                core.style.boxShadow = '0 0 10px #f59e0b';
            });
        });

        function renderSwarm() {
            // Smooth mouse follow (Lerp)
            cX += (mX - cX) * 0.25;
            cY += (mY - cY) * 0.25;
            swarmContainer.style.transform = `translate(${cX}px, ${cY}px)`;

            // Smooth transitions for radius and speed
            currentRadius += (targetRadius - currentRadius) * 0.1;
            currentSpeed += (targetSpeed - currentSpeed) * 0.05;
            angle += currentSpeed;

            // Position agents mathematically
            agents.forEach((agent, index) => {
                const offset = index * ((Math.PI * 2) / 3); // 120 degrees apart
                const x = Math.cos(angle + offset) * currentRadius;
                const y = Math.sin(angle + offset) * currentRadius;
                agent.style.transform = `translate(${x}px, ${y}px)`;
            });

            requestAnimationFrame(renderSwarm);
        }
        renderSwarm();
    }

    // --- Mobile Scroll 3D Parallax ---
    if (isTouchDevice) {
        const glassCards = document.querySelectorAll('.glass-card');
        
        const updateCardsPhysics = () => {
            const wh = window.innerHeight;
            glassCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                // Process only if the card is within the viewport
                if (rect.top < wh && rect.bottom > 0) {
                    // Normalize position: 1 (bottom edge) to -1 (top edge), 0 is center
                    const center = rect.top + rect.height / 2;
                    const delta = (center - wh / 2) / (wh / 2);
                    
                    // Calculate 3D tilt (max 8 degrees)
                    const tiltX = delta * 8; 
                    
                    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg)`;
                    
                    // Animate the internal glare layer
                    const glare = card.querySelector('.bg-gradient-to-br');
                    if (glare) {
                        // Max opacity at center, shifts up/down based on scroll
                        glare.style.opacity = 1 - Math.abs(delta) * 0.6;
                        glare.style.transform = `translateY(${delta * 15}px)`;
                    }
                }
            });
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateCardsPhysics();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        // Initial call to set starting positions
        updateCardsPhysics();
    }

    // --- Connected Nodes Logic ---
    const canvas = document.getElementById('nodes-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        // Brand colors: Emerald, Amber, Purple, Gray
        const colors = ['#10b981', '#f59e0b', '#a855f7', '#71717a']; 
        
        let mouse = { x: null, y: null, radius: 150 };
        window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

        let lastWidth = window.innerWidth;
        function resize() {
            // Only trigger if width changes significantly (ignores 1px scrollbar UI changes)
            if (Math.abs(window.innerWidth - lastWidth) > 20) {
                lastWidth = window.innerWidth;
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
                initParticles();
            }
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.6; // Speed
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 1.5 + 0.5;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const numParticles = Math.floor((width * height) / 15000); // Density
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Gradient Links between particles
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        grad.addColorStop(0, particles[i].color);
                        grad.addColorStop(1, particles[j].color);
                        ctx.strokeStyle = grad;
                        ctx.globalAlpha = 1 - (dist / 150);
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
                
                // Mouse interaction (repel + connect)
                if (mouse.x != null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        ctx.beginPath();
                        ctx.strokeStyle = particles[i].color;
                        ctx.globalAlpha = 1 - (dist / mouse.radius);
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                        
                        const force = (mouse.radius - dist) / mouse.radius;
                        particles[i].x += (dx / dist) * force * 0.5;
                        particles[i].y += (dy / dist) * force * 0.5;
                    }
                }
            }
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    switchLanguage('ru'); // Initial call

    // Burger Button / Mobile Menu
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (burgerBtn && mobileMenu) {
        burgerBtn.onclick = () => mobileMenu.classList.toggle('hidden');
    }

    // Swiper.js Initialization
    new Swiper('.workSwiper', {
      slidesPerView: 1, spaceBetween: 24, loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      grabCursor: true,
      navigation: { nextEl: '.swiper-btn-next', prevEl: '.swiper-btn-prev' },
      breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
    });

    // --- Scroll Reveal Logic ---
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Slight offset for better feel
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Magnetic Elements Logic ---
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Вычисляем дистанцию от центра элемента (сила притяжения 40%)
            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
            
            el.style.transform = `translate(${x}px, ${y}px)`;
            el.style.transition = 'none'; // Мгновенное следование за курсором
        });

        el.addEventListener('mouseleave', () => {
            // Плавный отскок на исходную позицию
            el.style.transform = 'translate(0px, 0px)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'; 
        });
    });

    // --- Text Scramble Logic ---
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
      }
      setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 40);
          this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }
      update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += `<span class="opacity-40 font-mono">${char}</span>`;
          } else {
            output += from;
          }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
        }
      }
      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

    // --- Initialization ---
    const scrambleEl = document.getElementById('scramble-text');
    if (scrambleEl) {
        window.headerScramble = new TextScramble(scrambleEl);
        const originalText = scrambleEl.innerText;
        scrambleEl.innerText = ''; // Очищаем перед началом
        setTimeout(() => window.headerScramble.setText(originalText), 500);

        // --- Trigger Scramble on Language Change via Toggle ---
        const handleToggle = (e) => {
            const newLang = e.target.checked ? 'en' : 'ru';
            switchLanguage(newLang);
            setTimeout(() => {
                const el = document.getElementById('scramble-text');
                if (window.headerScramble && el) window.headerScramble.setText(el.innerText);
            }, 100);
        };

        const dT = document.getElementById('lang-toggle');
        const mT = document.getElementById('lang-toggle-mobile');
        if (dT) dT.addEventListener('change', handleToggle);
        if (mT) mT.addEventListener('change', handleToggle);
    }

    // --- Terminal Typewriter Logic ---
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) {
        const terminalLines = [
            "> [SYSTEM] Initialize infrastructure...",
            "> Loading core languages: Python 3.12, Node.js, JavaScript (ES6+)... [OK]",
            "> Compiling frontend: HTML5, Tailwind CSS, Vanilla JS... [OK]",
            "> Mounting frameworks: FastAPI, Aiogram 3.x, Asyncio... [OK]",
            "> Connecting data layer: PostgreSQL, Redis, Supabase... [OK]",
            "> Booting AI engines: LLM APIs... [OK]",
            "> Establishing integrations: Telegram API, MAX Protocol, Instagram API, VK API... [OK]",
            "> Deploying containers: Docker, Vercel... [OK]",
            "> Syncing version control: Git VCS, CI/CD pipelines... [OK]",
            "> [STATUS] ALL SYSTEMS NOMINAL. READY FOR LAUNCH."
        ];
        
        let lineIndex = 0;
        let charIndex = 0;
        let isTyping = false;
        
        const typeWriter = () => {
            if (lineIndex < terminalLines.length) {
                if (charIndex === 0) {
                    const lineDiv = document.createElement('div');
                    lineDiv.className = 'mb-2 opacity-90';
                    terminalOutput.insertBefore(lineDiv, terminalOutput.querySelector('.cursor-blink'));
                }
                
                const currentLine = terminalLines[lineIndex];
                const lineElements = terminalOutput.querySelectorAll('div.mb-2');
                const currentDiv = lineElements[lineElements.length - 1];
                
                if (charIndex < currentLine.length) {
                    currentDiv.textContent += currentLine.charAt(charIndex);
                    charIndex++;
                    // Реалистичная задержка между символами (10-50ms)
                    setTimeout(typeWriter, Math.random() * 40 + 10);
                } else {
                    lineIndex++;
                    charIndex = 0;
                    // Пауза перед следующей строкой
                    setTimeout(typeWriter, 400);
                }
            }
        };

        const termObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isTyping) {
                isTyping = true;
                setTimeout(typeWriter, 500); // Небольшая пауза перед стартом
                termObserver.unobserve(terminalOutput);
            }
        }, { threshold: 0.5 });
        
        termObserver.observe(terminalOutput);
    }

    // Service Modals Logic
    const serviceModalLinks = { 'bots-info': 'modal-bots', 'web-info': 'modal-web', 'automation-info': 'modal-automation', 'mvp-info': 'modal-mvp', 'ai-info': 'modal-ai' };
    let activeServiceBlock = null;

    for (const [blockId, modalId] of Object.entries(serviceModalLinks)) {
        const block = document.getElementById(blockId);
        if (block) {
            const btn = block.querySelector('button');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modal = document.getElementById(modalId);
                    if (!modal) return;
                    const modalInner = modal.querySelector('.relative.bg-zinc-950');
                    
                    activeServiceBlock = block;

                    const openLogic = () => {
                        modal.classList.replace('hidden', 'flex');
                        document.body.style.overflow = 'hidden'; 
                        document.documentElement.style.overflow = 'hidden';
                    };

                    if (document.startViewTransition && modalInner) {
                        activeServiceBlock.style.viewTransitionName = 'service-expand';
                        modalInner.style.viewTransitionName = '';

                        document.startViewTransition(() => {
                            activeServiceBlock.style.viewTransitionName = '';
                            modalInner.style.viewTransitionName = 'service-expand';
                            openLogic();
                        });
                    } else {
                        openLogic();
                    }
                });
            }
        }
    }

    const closeAllServiceModals = () => {
        const openModal = Array.from(document.querySelectorAll('#services-modals > div')).find(m => m.classList.contains('flex'));
        
        const closeLogic = () => {
            document.querySelectorAll('#services-modals > div').forEach(modal => { 
                modal.classList.add('hidden'); 
                modal.classList.remove('flex'); 
            });
            document.body.style.overflow = ''; 
            document.documentElement.style.overflow = '';
        };

        if (document.startViewTransition && openModal && activeServiceBlock) {
            const modalInner = openModal.querySelector('.relative.bg-zinc-950');
            
            if (modalInner) {
                modalInner.style.viewTransitionName = 'service-expand';
                activeServiceBlock.style.viewTransitionName = '';

                const transition = document.startViewTransition(() => {
                    modalInner.style.viewTransitionName = '';
                    activeServiceBlock.style.viewTransitionName = 'service-expand';
                    closeLogic();
                });

                transition.finished.finally(() => {
                    if (activeServiceBlock) activeServiceBlock.style.viewTransitionName = '';
                    if (modalInner) modalInner.style.viewTransitionName = '';
                    activeServiceBlock = null;
                });
                return;
            }
        }
        closeLogic();
    };
    document.querySelectorAll('.modal-close, .modal-bg').forEach(el => el.onclick = closeAllServiceModals);

    // Project Modal Logic & Data
    const projectData = {
      "1": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]", stack: "Nano Banana Pro, ComfyUI (Custom Workflow), Gen-AI Video.", request: "Полная автономия от фотостудий, моделей и фотографов. Создание уникального «лица» бренда, которое на 100% принадлежит компании.", result: "4 часа на реализацию всего цикла. Создана уникальная модель по заданным параметрам (рост, вес, фигура, лицо, волосы). Реализованы виртуальный фотосет и видео-продакшен. Сокращение расходов на контент." },
      "2": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]", stack: "Tailwind CSS, Vanilla JS, Swiper.js, Intersection Observer.", request: "Создать технологичную витрину, которая сочетает «тяжелый» визуал с молниеносной скоростью загрузки на любых устройствах.", result: "Безупречный UX за счет Zero-Runtime JS. Нативная плавная навигация. Итоговый балл 100/100 Lighthouse по всем параметрам. Сайт служит доказательством скилла в оптимизации интерфейсов." },
      "3": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]", stack: "Python 3, Aiogram 3, Asyncio, Zero-DB Storage, Cloud VPS (Free Tier).", request: "Разработать закрытый инструмент для трекинга ежедневных практик осознанности и дисциплины. Требования: максимальная автономность, нулевая стоимость поддержки и уникальная система мотивации на целый год.", result: "Развернут легковесный бот без тяжелых баз данных. Написан алгоритм ротации 730 уникальных сообщений без повторов. Настроена жесткая система пуш-уведомлений с компенсацией часового пояса сервера. Безотказный личный ассистент." },
      "4": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]", stack: "Python, Aiogram 3, Grok AI (Search Logic), PostgreSQL, Web Scraping (JSON/RSS/Scrapy).", request: "Разработать автономную систему формирования продуктовой корзины под жесткий бюджет и локацию пользователя без использования платных API торговых сетей.", result: "Создан интеллектуальный AI-агент, имитирующий поведение пользователя для поиска цен. Сначала нейросеть подбирает рецепт под ингредиенты, затем ищет позиции в магазинах города и калибрует корзину под бюджет. Погрешность расчетов снижена до 10-15%." },
      "5": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(161,161,170,0.8)]", stack: "Python 3.12, JSON Scraping (Bypass API limits), Grok AI (Semantic Analysis), Supabase (Postgres), Telegram API.", request: "Разработать систему мониторинга Reddit для поиска заказов на разработку в обход официального API. Главная проблема — жесткие лимиты платформы и 95% информационного мусора (спам, самопиар, вакансии с привязкой к офису).", result: "Развернут многоступенчатый конвейер: парсинг через JSON-эндпоинты (Bypass API bans) -> семантическая фильтрация через LLM (Grok) -> дедупликация в Supabase. Реализована жесткая логика отсева по ключевым словам и гео-меткам (NYC/London). Система заменяет 5 часов ручного поиска на 15-минутный дайджест «горячих» лидов с высоким Score релевантности." },
      "6": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]", stack: "Antigravity Engine, JavaScript (ES6+), In-Memory Processing.", request: "Разработать полностью анонимный мессенджер с волатильной архитектурой. Главная цель — отсутствие любого цифрового следа и хранение данных исключительно в RAM пользователя.", result: "Реализован прототип с концепцией Zero-Trace. Все сообщения и метаданные существуют только в рамках текущей сессии и мгновенно уничтожаются при закрытии вкладки браузера. Интегрирована система волатильного хранения без использования серверных БД." },
      "7": { colorClass: "text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]", stack: "Python (Back-end), Cross-platform Mobile Framework, AI Vision API, Database (User History).", request: "Масштабировать логику Telegram-бота в полноценное мобильное приложение. Требования: внедрение системы распознавания продуктов по фото (Computer Vision), создание личных кабинетов и системы аналитики расходов.", result: "Разработан кроссплатформенный прототип (iOS/Android). Интегрирован нейро-ассистент для мгновенного анализа содержимого холодильника по фотографии. Реализован модуль «Рандомайзер ужинов» и система сохранения подтвержденных корзин в БД для отслеживания статистики трат в реальном времени. Продукт прошел полевое тестирование на реальных устройствах." },
      "8": {
        colorClass: "text-white drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]",
        stack: "HTML5, Tailwind CSS, JavaScript, Swiper.js, Lucide Icons, FormSubmit, SEO (Schema.org)",
        request: {
          ru: "Глубокий редизайн и полное техническое обновление устаревшей платформы (old.vtec-team.ru). Требовался переход на чистый код без тяжелых CMS для достижения максимальной скорости загрузки. Важные задачи: переработка структуры блоков для повышения конверсии, адаптивность под мобильные устройства и настройка прямой отправки заявок с сайта на почту.",
          en: "Deep redesign and full technical update of the legacy platform (old.vtec-team.ru). Transition to clean code without heavy CMS for maximum speed. Key tasks: block structure rework for better conversion, mobile responsiveness, and email lead integration."
        },
        result: {
          ru: "Разработан и запущен сверхбыстрый лендинг с агрессивным автомобильным дизайном. Оптимизирована производительность через чистый код и WebP. Реализована система модальных окон для каждой услуги, интерактивные слайдеры работ и FAQ. Интегрирована система сбора лидов FormSubmit и семантическая разметка Schema.org.",
          en: "Launched an ultra-fast landing page with an aggressive automotive design. Performance optimized via clean code and WebP. Implemented service modals, sliders, and FAQ. Integrated FormSubmit lead system and Schema.org SEO markup."
        }
      }
    };

    const pModal = document.getElementById('project-modal');
    let activeProjectCard = null;
    const pModalInner = pModal.querySelector('.max-w-4xl'); // Внутренний контейнер модалки

    document.querySelectorAll('[data-project-id]').forEach(btn => {
      btn.onclick = (e) => {
        const data = projectData[btn.dataset.projectId];
        if (!data) return;

        activeProjectCard = e.target.closest('.glass-card');

        const openLogic = () => {
          ['stack', 'request', 'result'].forEach(key => {
            const label = document.getElementById(`label-${key}`);
            if (label) label.className = `text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] sm:w-1/4 shrink-0 mt-1 transition-colors duration-300 ${data.colorClass}`;
            const content = document.getElementById(`modal-${key}`);
            if (content) {
              const val = data[key];
              content.innerText = (typeof val === 'object') ? (val[currentLang] || val['ru']) : val;
            }
          });
          pModal.classList.replace('hidden', 'flex');
          document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden';
        };

        if (document.startViewTransition && activeProjectCard && pModalInner) {
          // 1. Before snapshot: name is ONLY on the card
          activeProjectCard.style.viewTransitionName = 'project-expand';
          pModalInner.style.viewTransitionName = '';

          document.startViewTransition(() => {
            // 2. After snapshot, before render: transfer name to the modal
            activeProjectCard.style.viewTransitionName = '';
            pModalInner.style.viewTransitionName = 'project-expand';
            openLogic();
          });
        } else {
          openLogic();
        }
      };
    });

    const closePModal = () => {
      const closeLogic = () => {
        pModal.classList.replace('flex', 'hidden');
        document.body.style.overflow = ''; document.documentElement.style.overflow = '';
      };

      if (document.startViewTransition && activeProjectCard && pModalInner) {
        // 1. Before snapshot: name is ONLY on the modal
        pModalInner.style.viewTransitionName = 'project-expand';
        activeProjectCard.style.viewTransitionName = '';

        const transition = document.startViewTransition(() => {
          // 2. After snapshot: transfer name back to the card
          pModalInner.style.viewTransitionName = '';
          activeProjectCard.style.viewTransitionName = 'project-expand';
          closeLogic();
        });

        transition.finished.finally(() => {
          if (activeProjectCard) activeProjectCard.style.viewTransitionName = '';
          if (pModalInner) pModalInner.style.viewTransitionName = '';
          activeProjectCard = null;
        });
      } else {
        closeLogic();
      }
    };
    document.querySelectorAll('.close-modal, .modal-overlay').forEach(el => el.onclick = closePModal);
    
    // Global Shortcuts
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAllServiceModals(); closePModal(); } });
});
