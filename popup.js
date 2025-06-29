// Popup functionality for 888 AI Translator Extension

document.addEventListener('DOMContentLoaded', function() {
    // Get current tab info
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        updateUI(currentTab);
    });
    
    // Load extension settings and update popup
    loadExtensionSettings();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
    
            chrome.runtime.openOptionsPage();
            window.close(); // Close popup after opening settings
        });
    }
    
    // History button
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
    
            // Send message to content script to show history
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'showHistory'
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        // Silent error handling
                    }
                });
            });
            window.close();
        });
    }
    
    // Test button
    const testBtn = document.getElementById('test-btn');
    if (testBtn) {
        testBtn.addEventListener('click', () => {

            // Send test message to content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'testExtension'
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        showStatus('Please refresh the page and try again', 'error');
                    } else {
                        showStatus('Extension is working correctly!', 'success');
                    }
                });
            });
        });
    }
}

function showStatus(message, type = 'success') {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        const originalText = statusText.textContent;
        statusText.textContent = message;
        statusText.className = `text-xs text-center ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
        
        setTimeout(() => {
            statusText.textContent = originalText;
            statusText.className = 'text-xs text-gray-500 text-center';
        }, 3000);
    }
}

async function loadExtensionSettings() {
    try {
        const settings = await chrome.storage.sync.get({
            defaultSourceLang: 'auto',
            defaultTargetLang: 'fa',
            fontSize: '14',
            multiLangDetection: true,
            textToSpeech: true,
            slowSpeechRate: 0.25
        });
        
        updatePopupWithSettings(settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings', 'error');
    }
}

function updatePopupWithSettings(settings) {
    // Update popup based on settings
    const statusElement = document.getElementById('status-text');
    if (statusElement) {
        const langName = getLanguageName(settings.defaultTargetLang);
        statusElement.textContent = `Default target: ${langName} • Ready to translate`;
    }
}

function updateUI(tab) {
    // Update popup based on current tab
    if (tab && tab.url) {
        try {
            const domain = new URL(tab.url).hostname;
            const statusElement = document.getElementById('status-text');
            if (statusElement) {
                statusElement.textContent = `Active on ${domain}`;
            }
        } catch (error) {

        }
    }
}

function getLanguageName(langCode) {
    const languages = {
        'auto': 'Auto Detect',
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'ar': 'Arabic',
        'hy': 'Armenian',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'zh': 'Chinese',
        'co': 'Corsican',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'en': 'English',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'tl': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'fy': 'Frisian',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'ha': 'Hausa',
        'haw': 'Hawaiian',
        'he': 'Hebrew',
        'hi': 'Hindi',
        'hmn': 'Hmong',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'ig': 'Igbo',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jw': 'Javanese',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'rw': 'Kinyarwanda',
        'ko': 'Korean',
        'ku': 'Kurdish',
        'ky': 'Kyrgyz',
        'lo': 'Lao',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'lb': 'Luxembourgish',
        'mk': 'Macedonian',
        'mg': 'Malagasy',
        'ms': 'Malay',
        'ml': 'Malayalam',
        'mt': 'Maltese',
        'mi': 'Maori',
        'mr': 'Marathi',
        'mn': 'Mongolian',
        'my': 'Myanmar',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'or': 'Odia',
        'ps': 'Pashto',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'pa': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sm': 'Samoan',
        'gd': 'Scottish Gaelic',
        'sr': 'Serbian',
        'st': 'Sesotho',
        'sn': 'Shona',
        'sd': 'Sindhi',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'es': 'Spanish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'tg': 'Tajik',
        'ta': 'Tamil',
        'tt': 'Tatar',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'tk': 'Turkmen',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'ug': 'Uyghur',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'zu': 'Zulu'
    };
    
    return languages[langCode] || langCode;
} 