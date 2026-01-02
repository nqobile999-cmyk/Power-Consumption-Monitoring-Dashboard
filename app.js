// ===== ENERGY MONITORING DASHBOARD =====
// Main application JavaScript

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Energy Dashboard initialized');
    
    // Initialize components
    initDateTime();
    initCurrencySettings();
    initEventListeners();
    
    // Load saved settings
    loadUserSettings();
});

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
            updateCurrencySymbol(this.value);
            saveSettings();
        });
        
        // Set initial currency symbol
        updateCurrencySymbol(currencySelect.value);
    }
    
    // Set up price input
    const priceInput = document.getElementById('priceInput');
    if (priceInput) {
        priceInput.addEventListener('change', saveSettings);
        priceInput.addEventListener('input', function() {
            // Validate input
            if (this.value < 0) this.value = 0;
        });
    }
}

function updateCurrencySymbol(currencyCode) {
    const symbols = {
      // In your updateCurrencySymbol function, expand the symbols object:
const symbols = {
    // Current currencies
    'USD': '$',  // United States Dollar
    'ZAR': 'R',  // South African Rand
    'BWP': 'P',  // Botswana Pula
    'EUR': '€',  // Euro
    'GBP': '£',  // British Pound
    
    // Suggested additional global currencies:
    'CAD': 'C$', // Canadian Dollar
    'AUD': 'A$', // Australian Dollar
    'JPY': '¥',  // Japanese Yen
    'CNY': '¥',  // Chinese Yuan (also uses ¥)
    'INR': '₹',  // Indian Rupee
    'CHF': 'CHF', // Swiss Franc
    'NZD': 'NZ$', // New Zealand Dollar
    'SEK': 'kr',  // Swedish Krona
    'NOK': 'kr',  // Norwegian Krone
    'DKK': 'kr',  // Danish Krone
    'SGD': 'S$',  // Singapore Dollar
    'HKD': 'HK$', // Hong Kong Dollar
    'KRW': '₩',  // South Korean Won
    'BRL': 'R$',  // Brazilian Real
    'RUB': '₽',  // Russian Ruble
    'TRY': '₺',  // Turkish Lira
    'MXN': 'Mex$', // Mexican Peso
    'AED': 'د.إ', // UAE Dirham (Arabic)
    'SAR': 'ر.س', // Saudi Riyal (Arabic)
    'ZMW': 'ZK',  // Zambian Kwacha
    'KES': 'KSh', // Kenyan Shilling
    'NGN': '₦',  // Nigerian Naira
    'EGP': 'E£'   // Egyptian Pound
};
    
    const symbolElement = document.querySelector('.currency-symbol');
    if (symbolElement && symbols[currencyCode]) {
        symbolElement.textContent = symbols[currencyCode];
    }
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
    
    // Update UI
    updateCurrencySymbol(currency);
    updatePriceDisplay(price);
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
        saveBtn.addEventListener('click', saveSettings);
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
    const symbols = {
        'USD': '$',
        'ZAR': 'R', 
        'BWP': 'P',
        'EUR': '€',
        'GBP': '£'
    };
    
    const symbol = symbols[currencyCode] || '$';
    return `${symbol}${amount.toFixed(2)}`;
}

// Make functions available globally
window.editPrice = editPrice;
window.saveSettings = saveSettings;
// In your main app.js or a dedicated state file (e.g., `state.js`)
const AppState = {
    selectedCurrency: 'ZAR', // default currency
    updateCurrency: function(newCurrency) {
        this.selectedCurrency = newCurrency;
        this.notifyCurrencyChange();
    },
    listeners: [],
    onCurrencyChange: function(callback) {
        this.listeners.push(callback);
    },
    notifyCurrencyChange: function() {
        this.listeners.forEach(callback => callback(this.selectedCurrency));
    }
};
// Assuming your currency dropdown has an id="currency-select"
document.getElementById('currency-select').addEventListener('change', function(event) {
    const selectedCurrency = event.target.value;
    AppState.updateCurrency(selectedCurrency);
});
// In your Daily view logic (e.g., dailyChart.js)
AppState.onCurrencyChange(function(newCurrency) {
    updateDailyDisplay(newCurrency); // Your function to redraw/update daily charts & numbers
});

// In your Monthly view logic (e.g., monthlyChart.js)
AppState.onCurrencyChange(function(newCurrency) {
    updateMonthlyDisplay(newCurrency); // Your function to redraw/update monthly charts & numbers
});
function updateDailyDisplay(currency) {
    const currencySymbols = { 'ZAR': 'R', 'USD': '$', 'EUR': '€' };
    const symbol = currencySymbols[currency];
    
    // Update all elements with a class like 'currency-value'
    document.querySelectorAll('.daily-cost').forEach(element => {
        const baseValue = element.dataset.baseValue; // Store original number in data-attribute
        element.textContent = `${symbol}${(baseValue * getConversionRate(currency)).toFixed(2)}`;
    });
    
    // Re-draw your daily chart with new currency
    dailyChart.updateCurrency(currency);
}
