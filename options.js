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
    // Check if chrome.storage is available
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
        console.error('Chrome storage API not available!');
        return defaultSettings;
    }
    
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
    // Check if chrome.storage is available
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
        console.error('Chrome storage API not available!');
        return false;
    }
    
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
    const sourceSelect = document.getElementById('default-source-lang');
    const targetSelect = document.getElementById('default-target-lang');
    
    if (sourceSelect) {
        sourceSelect.value = settings.defaultSourceLang;
    } else {
        console.error('Source language select not found!');
    }
    
    if (targetSelect) {
        targetSelect.value = settings.defaultTargetLang;
    } else {
        console.error('Target language select not found!');
    }
    
    // Font size
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
        fontSizeSelect.value = settings.fontSize;
    } else {
        console.error('Font size select not found!');
    }
    
    // Toggle switches
    updateToggle('multi-lang-toggle', settings.multiLangDetection);
    updateToggle('tts-toggle', settings.textToSpeech);
    
    // Range sliders
    const slowSpeechSlider = document.getElementById('slow-speech-rate');
    const slowSpeechValue = document.getElementById('slow-speech-rate-value');
    
    if (slowSpeechSlider) {
        slowSpeechSlider.value = settings.slowSpeechRate;
    } else {
        console.error('Slow speech slider not found!');
    }
    
    if (slowSpeechValue) {
        slowSpeechValue.textContent = settings.slowSpeechRate + 'x';
    } else {
        console.error('Slow speech value display not found!');
    }
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
    } else {
        console.error('Toggle not found:', toggleId);
    }
}

// Get current settings from UI
function getCurrentSettings() {
    const sourceSelect = document.getElementById('default-source-lang');
    const targetSelect = document.getElementById('default-target-lang');
    const fontSizeSelect = document.getElementById('font-size');
    const multiLangToggle = document.getElementById('multi-lang-toggle');
    const ttsToggle = document.getElementById('tts-toggle');
    const slowSpeechSlider = document.getElementById('slow-speech-rate');
    
    const settings = {
        defaultSourceLang: sourceSelect ? sourceSelect.value : 'auto',
        defaultTargetLang: targetSelect ? targetSelect.value : 'fa',
        fontSize: fontSizeSelect ? fontSizeSelect.value : '14',
        multiLangDetection: multiLangToggle ? multiLangToggle.classList.contains('active') : true,
        textToSpeech: ttsToggle ? ttsToggle.classList.contains('active') : true,
        slowSpeechRate: slowSpeechSlider ? parseFloat(slowSpeechSlider.value) : 0.25
    };
    
    return settings;
}

// Show status message
function showStatus(message, isSuccess = true) {
    const statusElement = document.getElementById('status-message');
    
    if (!statusElement) {
        console.error('Status element not found!');
        return;
    }
    
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
    
    // Setup event listeners for toggles (NO AUTO-SAVE)
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            // No auto-save - user must click Save button
        });
    });
    
    // Setup event listeners for range sliders (NO AUTO-SAVE)
    const slowSpeechRateSlider = document.getElementById('slow-speech-rate');
    const slowSpeechRateValue = document.getElementById('slow-speech-rate-value');
    if (slowSpeechRateSlider && slowSpeechRateValue) {
        slowSpeechRateSlider.addEventListener('input', (e) => {
            slowSpeechRateValue.textContent = e.target.value + 'x';
            // No auto-save - user must click Save button
        });
    }
    
    // Save button
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            const settingsToSave = getCurrentSettings();
            const success = await saveSettings(settingsToSave);
            
            if (success) {
                showStatus('✅ Settings saved successfully!');
                
                // The background script will automatically broadcast settings changes
                // via chrome.storage.onChanged listener - no need to manually notify tabs
            } else {
                showStatus('Failed to save settings. Please try again.', false);
            }
        });
    } else {
        console.error('Save button not found!');
    }
    
    // Reset button
    const resetButton = document.getElementById('reset-settings');
    if (resetButton) {
        resetButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                // Update UI first
                updateUI(defaultSettings);
                
                // Save to storage
                const success = await saveSettings(defaultSettings);
                
                if (success) {
                    showStatus('Settings reset to defaults successfully!');
                    
                    // The background script will automatically broadcast the reset
                } else {
                    showStatus('Failed to reset settings. Please try again.', false);
                }
            }
        });
    } else {
        console.error('Reset button not found!');
    }
    
    // No auto-save - all changes require manual Save button click
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 