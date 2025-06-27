// Default settings
const defaultSettings = {
    defaultSourceLang: 'auto',
    defaultTargetLang: 'fa',
    fontSize: '14',
    multiLangDetection: true,
    textToSpeech: true,
    slowSpeechRate: 0.25
};

// Load settings from storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(defaultSettings);
        return result;
    } catch (error) {
        console.error('Error loading settings:', error);
        return defaultSettings;
    }
}

// Save settings to storage
async function saveSettings(settings) {
    try {
        await chrome.storage.sync.set(settings);
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Update UI with loaded settings
function updateUI(settings) {
    // Language settings
    document.getElementById('default-source-lang').value = settings.defaultSourceLang;
    document.getElementById('default-target-lang').value = settings.defaultTargetLang;
    
    // Font size
    document.getElementById('font-size').value = settings.fontSize;
    
    // Toggle switches
    updateToggle('multi-lang-toggle', settings.multiLangDetection);
    updateToggle('tts-toggle', settings.textToSpeech);
    
    // Range sliders
    document.getElementById('slow-speech-rate').value = settings.slowSpeechRate;
    document.getElementById('slow-speech-rate-value').textContent = settings.slowSpeechRate + 'x';
}

// Update toggle switch appearance
function updateToggle(toggleId, isActive) {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
        if (isActive) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }
}

// Get current settings from UI
function getCurrentSettings() {
    return {
        defaultSourceLang: document.getElementById('default-source-lang').value,
        defaultTargetLang: document.getElementById('default-target-lang').value,
        fontSize: document.getElementById('font-size').value,
        multiLangDetection: document.getElementById('multi-lang-toggle').classList.contains('active'),
        textToSpeech: document.getElementById('tts-toggle').classList.contains('active'),
        slowSpeechRate: parseFloat(document.getElementById('slow-speech-rate').value)
    };
}

// Show status message
function showStatus(message, isSuccess = true) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status-message ${isSuccess ? 'success' : 'error'} show`;
    
    setTimeout(() => {
        statusElement.classList.remove('show');
    }, 3000);
}

// Initialize the options page
async function init() {
    // Load and display current settings
    const settings = await loadSettings();
    updateUI(settings);
    
    // Setup event listeners for toggles
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });
    
    // Setup event listeners for range sliders
    const slowSpeechRateSlider = document.getElementById('slow-speech-rate');
    const slowSpeechRateValue = document.getElementById('slow-speech-rate-value');
    slowSpeechRateSlider.addEventListener('input', (e) => {
        slowSpeechRateValue.textContent = e.target.value + 'x';
    });
    
    // Save button
    document.getElementById('save-settings').addEventListener('click', async () => {
        const currentSettings = getCurrentSettings();
        const success = await saveSettings(currentSettings);
        
        if (success) {
            showStatus('Settings saved successfully!');
            
            // Notify content script about settings change
            try {
                const tabs = await chrome.tabs.query({});
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated',
                        settings: currentSettings
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                });
            } catch (error) {
                console.log('Could not notify content scripts:', error);
            }
        } else {
            showStatus('Failed to save settings. Please try again.', false);
        }
    });
    
    // Reset button
    document.getElementById('reset-settings').addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            updateUI(defaultSettings);
            const success = await saveSettings(defaultSettings);
            
            if (success) {
                showStatus('Settings reset to defaults!');
            } else {
                showStatus('Failed to reset settings. Please try again.', false);
            }
        }
    });
    
    // Auto-save on change (optional)
    const autoSaveElements = [
        'default-source-lang',
        'default-target-lang',
        'font-size'
    ];
    
    autoSaveElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', async () => {
                const currentSettings = getCurrentSettings();
                await saveSettings(currentSettings);
                showStatus('Setting saved!');
            });
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 