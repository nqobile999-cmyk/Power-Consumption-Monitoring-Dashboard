// ===== ENERGY MONITORING DASHBOARD =====
// Main application JavaScript

// ===== APP STATE MANAGEMENT =====
const AppState = {
    selectedCurrency: 'USD', // Default
    listeners: [],
    
    updateCurrency: function(newCurrency) {
        this.selectedCurrency = newCurrency;
        this.notifyCurrencyChange();
    },
    
    onCurrencyChange: function(callback) {
        this.listeners.push(callback);
    },
    
    notifyCurrencyChange: function() {
        this.listeners.forEach(callback => callback(this.selectedCurrency));
    },
    
    getCurrencySymbol: function() {
        const symbols = {
            // Current currencies
            'USD': '$',  // United States Dollar
            'ZAR': 'R',  // South African Rand
            'BWP': 'P',  // Botswana Pula
            'EUR': '€',  // Euro
            'GBP': '£',  // British Pound
            
            // Additional global currencies:
            'CAD': 'C$', // Canadian Dollar
            'AUD': 'A$', // Australian Dollar
            'JPY': '¥',  // Japanese Yen
            'CNY': '¥',  // Chinese Yuan
            'INR': '₹',  // Indian Rupee
            'CHF': 'CHF', // Swiss Franc
            'NZD': 'NZ$', // New Zealand Dollar
            'SEK': 'kr',  // Swedish Krona
            'NOK': 'kr',  // Norwegian Krone
            'DKK': 'kr',  // Danish Krona
            'SGD': 'S$',  // Singapore Dollar
            'HKD': 'HK$', // Hong Kong Dollar
            'KRW': '₩',  // South Korean Won
            'BRL': 'R$',  // Brazilian Real
            'TRY': '₺',  // Turkish Lira
            'MXN': 'Mex$', // Mexican Peso
            'AED': 'د.إ', // UAE Dirham
            'SAR': 'ر.س', // Saudi Riyal
            'ZMW': 'ZK',  // Zambian Kwacha
            'KES': 'KSh', // Kenyan Shilling
            'NGN': '₦',  // Nigerian Naira
            'EGP': 'E£'   // Egyptian Pound
        };
        return symbols[this.selectedCurrency] || '$';
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Energy Dashboard initialized');
    
    // Initialize components
    initDateTime();
    initCurrencySettings();
    initEventListeners();
    
    // Load saved settings
    loadUserSettings();
    
    // Initialize chart currency listeners
    initChartCurrencyListeners();
});

// ===== CHART CURRENCY LISTENERS =====
function initChartCurrencyListeners() {
    AppState.onCurrencyChange(function(newCurrency) {
        console.log('Chart currency update:', newCurrency);
        
        // Update daily chart if it exists
        if (window.dailyChart) {
            if (dailyChart.options.plugins.tooltip && dailyChart.options.plugins.tooltip.callbacks) {
                dailyChart.options.plugins.tooltip.callbacks.label = function(context) {
                    const price = parseFloat(document.getElementById('priceInput').value) || 0.15;
                    const cost = context.raw * price;
                    return `Cost: ${formatCurrency(cost, newCurrency)}`;
                };
                dailyChart.update();
            }
        }
        
        // Update monthly chart if it exists
        if (window.monthlyChart) {
            if (monthlyChart.options.plugins.tooltip && monthlyChart.options.plugins.tooltip.callbacks) {
                monthlyChart.options.plugins.tooltip.callbacks.label = function(context) {
                    const price = parseFloat(document.getElementById('priceInput').value) || 0.15;
                    const cost = context.raw * price;
                    return `Cost: ${formatCurrency(cost, newCurrency)}`;
                };
                monthlyChart.update();
            }
        }
    });
}

// ===== DATE & TIME UPDATER =====
function initDateTime() {
    updateDateTime();
    // Update every second
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        datetimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ===== CURRENCY & PRICE MANAGEMENT =====
function initCurrencySettings() {
    // Set up currency select
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
        // Add change listener
        currencySelect.addEventListener('change', function() {
            // Update BOTH the AppState AND the UI
            AppState.updateCurrency(this.value);
            updateCurrencySymbol(this.value);
            updateAllCurrencyDisplays(); // NEW: Update all dashboard displays
            saveSettings();
        });
        
        // Set initial currency symbol
        updateCurrencySymbol(currencySelect.value);
    }
    
    // Set up price input
    const priceInput = document.getElementById('priceInput');
    if (priceInput) {
        priceInput.addEventListener('change', function() {
            saveSettings();
            updateAllCurrencyDisplays(); // Also update when price changes
        });
        priceInput.addEventListener('input', function() {
            // Validate input
            if (this.value < 0) this.value = 0;
        });
    }
}

function updateCurrencySymbol(currencyCode) {
    const symbolElement = document.querySelector('.currency-symbol');
    if (symbolElement) {
        symbolElement.textContent = AppState.getCurrencySymbol();
    }
}

// ===== UPDATE ALL CURRENCY DISPLAYS =====
function updateAllCurrencyDisplays() {
    const currency = AppState.selectedCurrency;
    const symbol = AppState.getCurrencySymbol();
    const price = parseFloat(document.getElementById('priceInput').value) || 0.15;
    
    console.log('Updating all displays with:', { currency, symbol, price });
    
    // 1. Update all currency symbols
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = symbol;
    });
    
    // 2. Update all cost calculations in the dashboard
    document.querySelectorAll('[data-kwh]').forEach(el => {
        const kwh = parseFloat(el.dataset.kwh) || 0;
        const cost = calculateCost(kwh, price);
        const costElement = el.querySelector('.cost-display') || el;
        costElement.textContent = formatCurrency(cost, currency);
    });
    
    // 3. Update any summary cards
    updateSummaryCards(currency, price);
}

function updateSummaryCards(currency, pricePerKwh) {
    // Example: Update summary cards if they exist
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach(card => {
        const kwhElement = card.querySelector('.kwh-value');
        const costElement = card.querySelector('.cost-value');
        
        if (kwhElement && costElement) {
            const kwh = parseFloat(kwhElement.dataset.kwh) || 0;
            const cost = calculateCost(kwh, pricePerKwh);
            costElement.textContent = formatCurrency(cost, currency);
        }
    });
}

// ===== SETTINGS MANAGEMENT =====
function saveSettings() {
    const currency = document.getElementById('currencySelect').value;
    const price = document.getElementById('priceInput').value;
    
    // Save to localStorage
    localStorage.setItem('energy_currency', currency);
    localStorage.setItem('energy_price', price);
    
    // Update display
    updatePriceDisplay(price);
    updateCurrencySymbol(currency);
    
    // Show confirmation
    showNotification('Settings saved successfully!');
    
    console.log('Settings saved:', { currency, price });
}

function loadUserSettings() {
    // Load from localStorage or use defaults
    const currency = localStorage.getItem('energy_currency') || 'USD';
    const price = localStorage.getItem('energy_price') || '0.15';
    
    // Apply to form
    const currencySelect = document.getElementById('currencySelect');
    const priceInput = document.getElementById('priceInput');
    
    if (currencySelect) currencySelect.value = currency;
    if (priceInput) priceInput.value = price;
    
    // Initialize AppState with saved currency
    AppState.selectedCurrency = currency;
    
    // Update UI
    updateCurrencySymbol(currency);
    updatePriceDisplay(price);
    updateAllCurrencyDisplays(); // Update dashboard on load
}

function updatePriceDisplay(price) {
    const priceElement = document.querySelector('.price-amount');
    if (priceElement) {
        priceElement.textContent = parseFloat(price).toFixed(3);
    }
}

// ===== EDIT PRICE FUNCTION =====
function editPrice() {
    const currentPrice = document.getElementById('priceInput').value;
    const newPrice = prompt('Enter new electricity price per kWh:', currentPrice);
    
    if (newPrice !== null && newPrice !== '' && !isNaN(newPrice)) {
        document.getElementById('priceInput').value = parseFloat(newPrice).toFixed(3);
        saveSettings();
        updateAllCurrencyDisplays(); // Update dashboard after price change
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Edit price button
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', editPrice);
    }
    
    // Save button
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveSettings();
            updateAllCurrencyDisplays(); // Update dashboard when manually saving
        });
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== UTILITY FUNCTIONS =====
function calculateCost(energyKwh, pricePerKwh) {
    return energyKwh * pricePerKwh;
}

function formatCurrency(amount, currencyCode) {
    // Get the symbol for the SPECIFIC currency code
    const symbols = {
        'USD': '$', 'ZAR': 'R', 'BWP': 'P', 'EUR': '€', 'GBP': '£',
        'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥', 'CNY': '¥', 'INR': '₹',
        'CHF': 'CHF', 'NZD': 'NZ$', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
        'SGD': 'S$', 'HKD': 'HK$', 'KRW': '₩', 'BRL': 'R$', 'TRY': '₺',
        'MXN': 'Mex$', 'AED': 'د.إ', 'SAR': 'ر.س', 'ZMW': 'ZK',
        'KES': 'KSh', 'NGN': '₦', 'EGP': 'E£'
    };
    
    const symbol = symbols[currencyCode] || '$';
    
    // Handle currencies that don't use decimal places
    const decimalPlaces = ['JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
    
    return `${symbol}${amount.toFixed(decimalPlaces)}`;
}

// Make functions available globally
window.editPrice = editPrice;
window.saveSettings = saveSettings;
window.updateAllCurrencyDisplays = updateAllCurrencyDisplays;
window.AppState = AppState; // Expose AppState for debugging
