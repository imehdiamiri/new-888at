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
    console.log('Loading settings from storage...');
    
    // Check if chrome.storage is available
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
        console.error('Chrome storage API not available!');
        return defaultSettings;
    }
    
    try {
        console.log('Attempting to load settings with defaults:', defaultSettings);
        const result = await chrome.storage.sync.get(defaultSettings);
        console.log('Successfully loaded settings:', result);
        return result;
    } catch (error) {
        console.error('Error loading settings:', error);
        console.log('Returning default settings due to error');
        return defaultSettings;
    }
}

// Save settings to storage
async function saveSettings(settings) {
    console.log('Saving settings to storage:', settings);
    
    // Check if chrome.storage is available
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
        console.error('Chrome storage API not available!');
        return false;
    }
    
    try {
        await chrome.storage.sync.set(settings);
        console.log('Settings saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Update UI with loaded settings
function updateUI(settings) {
    console.log('Updating UI with settings:', settings);
    
    // Language settings
    const sourceSelect = document.getElementById('default-source-lang');
    const targetSelect = document.getElementById('default-target-lang');
    
    if (sourceSelect) {
        console.log('Setting source language to:', settings.defaultSourceLang);
        sourceSelect.value = settings.defaultSourceLang;
        console.log('Source select value is now:', sourceSelect.value);
    } else {
        console.error('Source language select not found!');
    }
    
    if (targetSelect) {
        console.log('Setting target language to:', settings.defaultTargetLang);
        targetSelect.value = settings.defaultTargetLang;
        console.log('Target select value is now:', targetSelect.value);
    } else {
        console.error('Target language select not found!');
    }
    
    // Font size
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
        console.log('Setting font size to:', settings.fontSize);
        fontSizeSelect.value = settings.fontSize;
        console.log('Font size select value is now:', fontSizeSelect.value);
    } else {
        console.error('Font size select not found!');
    }
    
    // Toggle switches
    console.log('Updating toggles...');
    updateToggle('multi-lang-toggle', settings.multiLangDetection);
    updateToggle('tts-toggle', settings.textToSpeech);
    
    // Range sliders
    const slowSpeechSlider = document.getElementById('slow-speech-rate');
    const slowSpeechValue = document.getElementById('slow-speech-rate-value');
    
    if (slowSpeechSlider) {
        console.log('Setting slow speech rate to:', settings.slowSpeechRate);
        slowSpeechSlider.value = settings.slowSpeechRate;
        console.log('Slow speech slider value is now:', slowSpeechSlider.value);
    } else {
        console.error('Slow speech slider not found!');
    }
    
    if (slowSpeechValue) {
        slowSpeechValue.textContent = settings.slowSpeechRate + 'x';
        console.log('Slow speech value display updated to:', slowSpeechValue.textContent);
    } else {
        console.error('Slow speech value display not found!');
    }
    
    console.log('UI update complete');
}

// Update toggle switch appearance
function updateToggle(toggleId, isActive) {
    console.log('Updating toggle:', toggleId, 'to active:', isActive);
    const toggle = document.getElementById(toggleId);
    if (toggle) {
        if (isActive) {
            toggle.classList.add('active');
            console.log('Added active class to', toggleId);
        } else {
            toggle.classList.remove('active');
            console.log('Removed active class from', toggleId);
        }
        console.log('Toggle', toggleId, 'classes:', toggle.className);
    } else {
        console.error('Toggle not found:', toggleId);
    }
}

// Get current settings from UI
function getCurrentSettings() {
    console.log('Getting current settings from UI...');
    
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
    
    console.log('Current settings from UI:', settings);
    
    // Log individual values for debugging
    console.log('Source lang:', sourceSelect?.value);
    console.log('Target lang:', targetSelect?.value);
    console.log('Font size:', fontSizeSelect?.value);
    console.log('Multi-lang active:', multiLangToggle?.classList.contains('active'));
    console.log('TTS active:', ttsToggle?.classList.contains('active'));
    console.log('Slow speech rate:', slowSpeechSlider?.value);
    
    return settings;
}

// Show status message
function showStatus(message, isSuccess = true) {
    console.log('Showing status:', message, 'success:', isSuccess);
    const statusElement = document.getElementById('status-message');
    
    if (!statusElement) {
        console.error('Status element not found!');
        return;
    }
    
    statusElement.textContent = message;
    statusElement.className = `status-message ${isSuccess ? 'success' : 'error'} show`;
    
    console.log('Status element updated:', statusElement.className, statusElement.textContent);
    
    setTimeout(() => {
        statusElement.classList.remove('show');
        console.log('Status message hidden');
    }, 3000);
}

// Initialize the options page
async function init() {
    console.log('Options page initializing...');
    
    // Load and display current settings
    const settings = await loadSettings();
    console.log('Loaded settings:', settings);
    updateUI(settings);
    console.log('UI updated with settings');
    
    // Setup event listeners for toggles (NO AUTO-SAVE)
    const toggles = document.querySelectorAll('.toggle-switch');
    console.log('Found toggles:', toggles.length);
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            console.log('Toggle clicked:', toggle.id);
            toggle.classList.toggle('active');
            // No auto-save - user must click Save button
        });
    });
    
    // Setup event listeners for range sliders (NO AUTO-SAVE)
    const slowSpeechRateSlider = document.getElementById('slow-speech-rate');
    const slowSpeechRateValue = document.getElementById('slow-speech-rate-value');
    if (slowSpeechRateSlider && slowSpeechRateValue) {
        console.log('Setting up speech rate slider');
        slowSpeechRateSlider.addEventListener('input', (e) => {
            slowSpeechRateValue.textContent = e.target.value + 'x';
            // No auto-save - user must click Save button
        });
    }
    
    // Save button
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        console.log('Setting up save button');
        saveButton.addEventListener('click', async () => {
            console.log('Save button clicked');
            const settingsToSave = getCurrentSettings();
            console.log('Current settings from UI:', settingsToSave);
            const success = await saveSettings(settingsToSave);
            
            if (success) {
                console.log('Settings saved successfully');
                showStatus('✅ Settings saved successfully!');
                
                // The background script will automatically broadcast settings changes
                // via chrome.storage.onChanged listener - no need to manually notify tabs
                console.log('Settings saved, background script will handle broadcasting');
            } else {
                console.log('Failed to save settings');
                showStatus('Failed to save settings. Please try again.', false);
            }
        });
    } else {
        console.error('Save button not found!');
    }
    

    
    // Reset button
    const resetButton = document.getElementById('reset-settings');
    if (resetButton) {
        console.log('Setting up reset button');
        resetButton.addEventListener('click', async () => {
            console.log('Reset button clicked');
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                console.log('User confirmed reset, applying defaults:', defaultSettings);
                
                // Update UI first
                updateUI(defaultSettings);
                
                // Save to storage
                const success = await saveSettings(defaultSettings);
                
                if (success) {
                    console.log('Settings reset successfully');
                    showStatus('Settings reset to defaults successfully!');
                    
                    // The background script will automatically broadcast the reset
                    console.log('Settings reset, background script will handle broadcasting');
                } else {
                    console.log('Failed to reset settings');
                    showStatus('Failed to reset settings. Please try again.', false);
                }
            } else {
                console.log('User cancelled reset');
            }
        });
    } else {
        console.error('Reset button not found!');
    }
    
    // No auto-save - all changes require manual Save button click
    
    console.log('Options page initialization complete');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 