// Dados dos produtos
const products = {
    iphone15: {
        name: 'iPhone 15',
        stock: 3,
        colors: {
            'Preto': { available: true, stock: 1 },
            'Branco': { available: true, stock: 1 },
            'Azul': { available: true, stock: 1 },
            'Rosa': { available: false, stock: 0 },
            'Verde': { available: false, stock: 0 },
            'Amarelo': { available: false, stock: 0 }
        }
    },
    iphone13: {
        name: 'iPhone 13',
        stock: 4,
        colors: {
            'Preto': { available: true, stock: 1 },
            'Branco': { available: true, stock: 1 },
            'Azul': { available: true, stock: 1 },
            'Rosa': { available: true, stock: 1 },
            'Verde': { available: false, stock: 0 },
            'Vermelho': { available: false, stock: 0 }
        }
    }
};

// Estado atual
let currentModel = 'iphone15';
let currentColor = null;

// Preços dos produtos
const PRODUCT_PRICES = {
    iphone15: 119.99,
    iphone13: 95.99
};

// Carrinho de compras (máximo 1 de cada modelo)
const cart = {
    iphone15: null,
    iphone13: null
};

// Função para obter preço do modelo atual
function getCurrentPrice() {
    return PRODUCT_PRICES[currentModel] || 0;
}

// Firebase Configuration - CORRIGIDA para usar SEU banco de dados
const firebaseConfig = {
    databaseURL: "https://saoluisbanco-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
let database;
let firebaseInitialized = false;

function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            // Verifica se já foi inicializado
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
            }
            database = firebase.database();
            firebaseInitialized = true;
            console.log("✅ Firebase inicializado com sucesso");
            console.log("📊 URL do banco:", firebaseConfig.databaseURL);
            return true;
        } else {
            console.error("❌ Firebase SDK não carregado");
            return false;
        }
    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
        // Se já existe app, tenta usar
        try {
            if (firebase.apps && firebase.apps.length > 0) {
                database = firebase.database();
                firebaseInitialized = true;
                console.log("✅ Firebase já inicializado, usando instância existente");
                return true;
            }
        } catch (e) {
            console.error("❌ Erro ao usar Firebase existente:", e);
        }
        return false;
    }
}

// Cores em hex para os botões
const colorMap = {
    'Preto': '#000000',
    'Branco': '#FFFFFF',
    'Azul': '#007AFF',
    'Rosa': '#FF69B4',
    'Verde': '#34C759',
    'Amarelo': '#FFD700',
    'Vermelho': '#FF3B30'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa Firebase primeiro
    setTimeout(() => {
        initializeFirebase();
    }, 500);
    
    // Inicializa outras funcionalidades
    initCarousel();
    initModelSelection();
    initColorSelection();
    initButtons();
    initModals();
    initFormValidation();
    initWhatsAppLink();
    updateStockDisplay();
    updatePriceDisplay();
    updateProductTitle();
});

// Carrossel de imagens
function initCarousel() {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const totalSlides = 8;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Auto-play do carrossel
    setInterval(nextSlide, 5000);
}

// Seleção de modelo
function initModelSelection() {
    const modelButtons = document.querySelectorAll('.model-btn');
    
    modelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            modelButtons.forEach(b => b.classList.remove('active'));
            // Adiciona active no clicado
            btn.classList.add('active');
            
            // Atualiza modelo atual
            currentModel = btn.dataset.model;
            currentColor = null;
            
            // Atualiza cores disponíveis
            updateColorOptions();
            updateStockDisplay();
            updatePriceDisplay();
            updateProductTitle();
        });
    });
}

// Atualiza título do produto
function updateProductTitle() {
    const titleElement = document.getElementById('productTitleDisplay');
    if (titleElement) {
        titleElement.textContent = `${products[currentModel].name} - Oferta Especial Black Friday`;
    }
}

// Atualiza exibição do preço
function updatePriceDisplay() {
    const price = getCurrentPrice();
    const priceDisplay = document.getElementById('currentPriceDisplay');
    const installmentDisplay = document.getElementById('priceInstallment');
    const priceElements = document.querySelectorAll('#modalProductPrice, #summaryTotal');
    
    if (priceDisplay) {
        priceDisplay.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    
    if (installmentDisplay) {
        const installmentValue = (price / 12).toFixed(2).replace('.', ',');
        installmentDisplay.textContent = `ou 12x de R$ ${installmentValue} sem juros`;
    }
    
    priceElements.forEach(element => {
        element.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    });
}

// Seleção de cor
function initColorSelection() {
    updateColorOptions();
}

function updateColorOptions() {
    const colorOptions = document.getElementById('colorOptions');
    const product = products[currentModel];
    
    colorOptions.innerHTML = '';
    
    Object.entries(product.colors).forEach(([colorName, colorData]) => {
        const colorBtn = document.createElement('button');
        colorBtn.className = `color-btn ${!colorData.available ? 'sold-out' : ''}`;
        colorBtn.style.backgroundColor = colorMap[colorName] || '#CCCCCC';
        colorBtn.dataset.color = colorName;
        colorBtn.disabled = !colorData.available;
        
        if (colorData.available) {
            colorBtn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                colorBtn.classList.add('active');
                currentColor = colorName;
            });
        }
        
        // Label abaixo do botão
        const label = document.createElement('div');
        label.className = 'color-label';
        label.textContent = colorData.available ? colorName : `${colorName} (Esgotado)`;
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.appendChild(colorBtn);
        wrapper.appendChild(label);
        
        colorOptions.appendChild(wrapper);
    });
}

// Atualizar display de estoque
function updateStockDisplay() {
    const product = products[currentModel];
    const totalStockElement = document.getElementById('total-stock');
    const stockMessage = document.getElementById('stockMessage');
    
    // Calcula estoque total
    let totalStock = 0;
    Object.values(product.colors).forEach(colorData => {
        totalStock += colorData.stock;
    });
    
    totalStockElement.textContent = totalStock;
    
    // Atualiza mensagem de estoque
    if (totalStock <= 2) {
        stockMessage.textContent = `⚠️ ÚLTIMAS ${totalStock} UNIDADES! Não perca esta oportunidade única!`;
        stockMessage.style.color = '#d32f2f';
    } else if (totalStock <= 4) {
        stockMessage.textContent = `⚠️ Apenas ${totalStock} unidades restantes! Garanta já o seu!`;
        stockMessage.style.color = '#d32f2f';
    } else {
        stockMessage.textContent = `⚠️ Estoque limitado! Aproveite enquanto dura!`;
        stockMessage.style.color = '#424242';
    }
}

// Botões de ação
function initButtons() {
    const buyBtn = document.getElementById('buyBtn');
    const cartBtn = document.getElementById('cartBtn');
    const whatsappFloat = document.getElementById('whatsappFloat');
    
    buyBtn.addEventListener('click', () => {
        if (!currentColor) {
            alert('Por favor, selecione uma cor antes de comprar!');
            return;
        }
        
        // Abre modal de confirmação
        openProductModal();
    });
    
    cartBtn.addEventListener('click', () => {
        if (!currentColor) {
            alert('Por favor, selecione uma cor antes de adicionar ao carrinho!');
            return;
        }
        
        // Verifica se já tem 1 deste modelo no carrinho
        if (cart[currentModel]) {
            alert(`Você já adicionou 1 ${products[currentModel].name} ao carrinho. Máximo de 1 unidade por modelo.`);
            return;
        }
        
        // Adiciona ao carrinho
        cart[currentModel] = {
            model: currentModel,
            name: products[currentModel].name,
            color: currentColor,
            price: getCurrentPrice()
        };
        
        // Feedback visual
        cartBtn.textContent = '✓ Adicionado!';
        cartBtn.style.background = '#10b981';
        cartBtn.disabled = true;
        
        // Atualiza badge do carrinho se existir
        updateCartBadge();
        
        setTimeout(() => {
            cartBtn.textContent = 'Adicionar ao Carrinho';
            cartBtn.style.background = '';
            cartBtn.disabled = false;
        }, 2000);
    });
    
    // Atualiza botão do carrinho quando modelo/cor mudam
    function updateCartButton() {
        if (cart[currentModel]) {
            cartBtn.textContent = '✓ Já no Carrinho';
            cartBtn.style.background = '#10b981';
            cartBtn.disabled = true;
        } else {
            cartBtn.textContent = 'Adicionar ao Carrinho';
            cartBtn.style.background = '';
            cartBtn.disabled = false;
        }
    }
    
    // Observa mudanças no modelo
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(updateCartButton, 100);
        });
    });
    
    // Atualiza inicialmente
    updateCartButton();
}

// Atualiza badge do carrinho
function updateCartBadge() {
    const cartCount = Object.keys(cart).filter(key => cart[key] !== null).length;
    // Você pode adicionar um badge visual aqui se quiser
    console.log(`Carrinho: ${cartCount} item(s)`);
}

// Atualiza link do WhatsApp flutuante
function initWhatsAppLink() {
    const whatsappFloat = document.getElementById('whatsappFloat');
    if (!whatsappFloat) return;
    
    const updateWhatsAppLink = () => {
        let message = 'Olá! Tenho interesse no iPhone.';
        if (currentModel && currentColor) {
            message = `Olá! Gostaria de comprar o ${products[currentModel].name} na cor ${currentColor}.`;
        } else if (currentModel) {
            message = `Olá! Tenho interesse no ${products[currentModel].name}.`;
        }
        whatsappFloat.href = `https://wa.me/5598984708467?text=${encodeURIComponent(message)}`;
    };
    
    // Atualiza link inicial
    updateWhatsAppLink();
    
    // Observa mudanças no modelo
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(updateWhatsAppLink, 100);
        });
    });
    
    // Observa mudanças na cor
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-btn') && !e.target.disabled) {
            setTimeout(updateWhatsAppLink, 100);
        }
    });
}

// Efeito de contagem regressiva (opcional - pode ser adicionado)
function startCountdown() {
    const hours = 23;
    const minutes = 59;
    const seconds = 59;
    
    // Você pode adicionar um contador visual aqui se desejar
}

// Animação de números no estoque
function animateStockNumber(element, targetValue) {
    const duration = 1000;
    const startValue = parseInt(element.textContent) || 0;
    const increment = targetValue > startValue ? 1 : -1;
    const steps = Math.abs(targetValue - startValue);
    const stepDuration = duration / steps;
    
    let current = startValue;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetValue) {
            clearInterval(timer);
        }
    }, stepDuration);
}

// Modal de Confirmação do Produto
function openProductModal() {
    const modal = document.getElementById('productModal');
    const productName = document.getElementById('modalProductName');
    const productColor = document.getElementById('modalProductColor');
    const productPrice = document.getElementById('modalProductPrice');
    const price = getCurrentPrice();
    
    productName.textContent = products[currentModel].name;
    productColor.textContent = currentColor;
    productPrice.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Modal de Checkout
function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const summaryProduct = document.getElementById('summaryProduct');
    const summaryColor = document.getElementById('summaryColor');
    const summaryTotal = document.getElementById('summaryTotal');
    const price = getCurrentPrice();
    
    summaryProduct.textContent = products[currentModel].name;
    summaryColor.textContent = currentColor;
    summaryTotal.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    
    // Limpa o formulário
    document.getElementById('checkoutForm').reset();
    
    // Limpa e reseta campos de endereço
    const addressFields = ['street', 'neighborhood', 'city', 'state'];
    addressFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
            field.setAttribute('readonly', 'readonly');
        }
    });
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Inicializar Modais
function initModals() {
    const productModal = document.getElementById('productModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const closeCheckoutModalBtn = document.getElementById('closeCheckoutModal');
    const finalizeBtn = document.getElementById('finalizeBtn');
    
    // Fechar modais ao clicar fora
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });
    
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
    
    // Botões de fechar
    closeProductModalBtn.addEventListener('click', closeProductModal);
    closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);
    
    // Botão finalizar compra
    finalizeBtn.addEventListener('click', () => {
        closeProductModal();
        setTimeout(() => {
            openCheckoutModal();
        }, 300);
    });
}

// Validação e Formatação de Formulário
function initFormValidation() {
    const cepInput = document.getElementById('cep');
    const whatsappInput = document.getElementById('whatsapp');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Formatação e busca de CEP
    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
        
        // Busca CEP quando tiver 8 dígitos
        const cepClean = value.replace(/\D/g, '');
        if (cepClean.length === 8) {
            searchCEP(cepClean);
        } else {
            // Limpa campos se CEP incompleto
            clearAddressFields();
        }
    });
    
    // Busca CEP quando perder o foco (caso não tenha buscado automaticamente)
    cepInput.addEventListener('blur', (e) => {
        const cepClean = e.target.value.replace(/\D/g, '');
        if (cepClean.length === 8) {
            searchCEP(cepClean);
        }
    });
    
    // Formatação de WhatsApp
    whatsappInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 2) {
                value = '(' + value;
            } else if (value.length <= 7) {
                value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
            } else {
                value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
            }
        }
        e.target.value = value;
    });
    
    // Submissão do formulário - CORRIGIDA
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitOrderBtn');
        const submitBtnText = document.getElementById('submitBtnText');
        const submitBtnLoader = document.getElementById('submitBtnLoader');
        
        // Desabilita botão e mostra loading
        submitBtn.disabled = true;
        submitBtnText.style.display = 'none';
        submitBtnLoader.style.display = 'inline-block';
        
        try {
            // Coleta dados do formulário
            const formData = {
                nomeCompleto: document.getElementById('fullName').value.trim(),
                cep: document.getElementById('cep').value.trim(),
                rua: document.getElementById('street').value.trim(),
                numeroCasa: document.getElementById('houseNumber').value.trim(),
                bairro: document.getElementById('neighborhood').value.trim(),
                cidade: document.getElementById('city').value.trim(),
                estado: document.getElementById('state').value.trim(),
                email: document.getElementById('email').value.trim(),
                whatsapp: document.getElementById('whatsapp').value.trim(),
                produto: products[currentModel].name,
                cor: currentColor,
                valor: getCurrentPrice(),
                frete: 'Grátis',
                dataPedido: new Date().toISOString(),
                timestamp: Date.now(),
                dataHora: new Date().toLocaleString('pt-BR')
            };
            
            // Validação básica
            if (!formData.nomeCompleto || !formData.cep || !formData.rua || !formData.numeroCasa || 
                !formData.bairro || !formData.cidade || !formData.estado || !formData.email || !formData.whatsapp) {
                alert('Por favor, preencha todos os campos obrigatórios. Certifique-se de que o CEP foi buscado corretamente.');
                submitBtn.disabled = false;
                submitBtnText.style.display = 'inline';
                submitBtnLoader.style.display = 'none';
                return;
            }
            
            // Gera ID do pedido único
            const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            formData.orderId = orderId;
            
            console.log('📦 Tentando salvar pedido:', formData);
            
            // Tenta salvar no Firebase usando múltiplos métodos
            const saved = await saveOrderToFirebase(formData, orderId);
            
            if (saved) {
                console.log('✅ Pedido salvo com sucesso no Firebase');
                
                // Prepara mensagem para WhatsApp
                const message = `📱 *NOVO PEDIDO - iPhone Store MA*\n\n` +
                    `🆔 *ID do Pedido:* ${orderId}\n` +
                    `📦 *Produto:* ${formData.produto}\n` +
                    `🎨 *Cor:* ${formData.cor}\n` +
                    `💰 *Valor:* R$ ${formData.valor.toFixed(2).replace('.', ',')}\n` +
                    `🚚 *Frete:* ${formData.frete}\n\n` +
                    `👤 *Cliente:* ${formData.nomeCompleto}\n` +
                    `📧 *Email:* ${formData.email}\n` +
                    `📱 *WhatsApp:* ${formData.whatsapp}\n` +
                    `📍 *Endereço:* ${formData.rua}, ${formData.numeroCasa}\n` +
                    `📍 *Bairro:* ${formData.bairro}\n` +
                    `📍 *Cidade:* ${formData.cidade} - ${formData.estado}\n` +
                    `📍 *CEP:* ${formData.cep}\n\n` +
                    `⏰ *Data/Hora:* ${formData.dataHora}\n\n` +
                    `💎 *Pedido recebido com sucesso!*`;
                
                // Redireciona para WhatsApp
                setTimeout(() => {
                    window.location.href = `https://wa.me/5598984708467?text=${encodeURIComponent(message)}`;
                }, 1000);
                
            } else {
                throw new Error('Não foi possível salvar o pedido no banco de dados');
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar pedido:', error);
            alert('Erro ao processar pedido: ' + error.message);
            
            // Reabilita o botão
            submitBtn.disabled = false;
            submitBtnText.style.display = 'inline';
            submitBtnLoader.style.display = 'none';
        }
    });
}

// Função para buscar CEP na API ViaCEP
async function searchCEP(cep) {
    const cepClean = cep.replace(/\D/g, '');
    
    if (cepClean.length !== 8) {
        return;
    }
    
    const streetInput = document.getElementById('street');
    const neighborhoodInput = document.getElementById('neighborhood');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    
    // Mostra loading
    streetInput.value = 'Buscando...';
    streetInput.disabled = true;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        
        // Preenche os campos
        streetInput.value = data.logradouro || '';
        neighborhoodInput.value = data.bairro || '';
        cityInput.value = data.localidade || '';
        stateInput.value = data.uf || '';
        
        // Remove readonly e habilita edição se necessário
        streetInput.removeAttribute('readonly');
        neighborhoodInput.removeAttribute('readonly');
        cityInput.removeAttribute('readonly');
        stateInput.removeAttribute('readonly');
        
        // Foca no número da casa
        document.getElementById('houseNumber').focus();
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('CEP não encontrado. Por favor, verifique o CEP digitado ou preencha os dados manualmente.');
        
        // Limpa campos e permite preenchimento manual
        streetInput.value = '';
        neighborhoodInput.value = '';
        cityInput.value = '';
        stateInput.value = '';
        
        streetInput.removeAttribute('readonly');
        neighborhoodInput.removeAttribute('readonly');
        cityInput.removeAttribute('readonly');
        stateInput.removeAttribute('readonly');
        
        streetInput.focus();
    } finally {
        streetInput.disabled = false;
    }
}

// Função para limpar campos de endereço
function clearAddressFields() {
    const streetInput = document.getElementById('street');
    const neighborhoodInput = document.getElementById('neighborhood');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    
    if (streetInput && streetInput.value === 'Buscando...') {
        streetInput.value = '';
    }
}

// FUNÇÃO PRINCIPAL CORRIGIDA PARA SALVAR NO FIREBASE
async function saveOrderToFirebase(formData, orderId) {
    const firebaseUrl = 'https://saoluisbanco-default-rtdb.firebaseio.com';
    
    console.log('🔥 Tentando salvar no Firebase...');
    console.log('📊 URL:', firebaseUrl);
    console.log('📦 Dados:', formData);
    
    // Método 1: PUT com ID específico (mais confiável)
    try {
        const url = `${firebaseUrl}/pedidos/${orderId}.json`;
        console.log('🔄 Tentando PUT para:', url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📨 Resposta do Firebase:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ PUT bem-sucedido:', result);
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ PUT falhou:', errorText);
        }
    } catch (error) {
        console.log('❌ Erro no PUT:', error.message);
    }
    
    // Método 2: POST (cria novo registro)
    try {
        const url = `${firebaseUrl}/pedidos.json`;
        console.log('🔄 Tentando POST para:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📨 Resposta do Firebase (POST):', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ POST bem-sucedido:', result);
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ POST falhou:', errorText);
        }
    } catch (error) {
        console.log('❌ Erro no POST:', error.message);
    }
    
    // Método 3: Tentativa com caminho alternativo
    try {
        const timestamp = Date.now();
        const url = `${firebaseUrl}/vendas/${timestamp}.json`;
        console.log('🔄 Tentando caminho alternativo:', url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            console.log('✅ Salvo em caminho alternativo');
            return true;
        }
    } catch (error) {
        console.log('❌ Erro no caminho alternativo:', error.message);
    }
    
    // Método 4: Tentativa com dados simples
    try {
        const simpleData = {
            cliente: formData.nomeCompleto,
            produto: formData.produto,
            whatsapp: formData.whatsapp,
            data: formData.dataHora,
            valor: formData.valor
        };
        
        const url = `${firebaseUrl}/teste_pedidos/${orderId}.json`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(simpleData)
        });
        
        if (response.ok) {
            console.log('✅ Dados simples salvos');
            return true;
        }
    } catch (error) {
        console.log('❌ Erro ao salvar dados simples:', error.message);
    }
    
    console.log('❌ Todas as tentativas falharam');
    return false;
}

// Função auxiliar para testar conexão com Firebase
async function testFirebaseConnection() {
    const firebaseUrl = 'https://saoluisbanco-default-rtdb.firebaseio.com';
    
    try {
        const response = await fetch(`${firebaseUrl}/teste.json`, {
            method: 'PUT',
            body: JSON.stringify({ test: 'conexao', timestamp: Date.now() })
        });
        
        if (response.ok) {
            console.log('✅ Conexão com Firebase estabelecida');
            return true;
        } else {
            console.log('❌ Falha na conexão com Firebase');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na conexão com Firebase:', error.message);
        return false;
    }
}

// Testa a conexão quando a página carrega
setTimeout(() => {
    testFirebaseConnection();
}, 2000);
