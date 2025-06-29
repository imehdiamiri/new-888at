// Background script for handling extension actions

// Listen for messages from content script and options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptions') {
        // Open the options page
        chrome.runtime.openOptionsPage();
        sendResponse({success: true});
    } else if (request.action === 'settingsChanged') {
        // Broadcast settings change to all tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'settingsUpdated',
                    settings: request.settings
                }).catch(() => {
                    // Ignore errors for tabs without content script
                });
            });
        });
        sendResponse({success: true});
    }
    
    return true; // Keep message channel open for async response
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {

        // Set default settings on install
        chrome.storage.sync.set({
            defaultSourceLang: 'auto',
            defaultTargetLang: 'fa',
            fontSize: '14',
            multiLangDetection: true,
            textToSpeech: true,
            slowSpeechRate: 0.25
        });
    } else if (details.reason === 'update') {

    }
});

// Listen for storage changes and broadcast to content scripts
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Get current settings and broadcast to all tabs
        chrome.storage.sync.get({
            defaultSourceLang: 'auto',
            defaultTargetLang: 'fa',
            fontSize: '14',
            multiLangDetection: true,
            textToSpeech: true,
            slowSpeechRate: 0.25
        }, (settings) => {
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated',
                        settings: settings
                    }).catch(() => {
                        // Ignore errors for tabs without content script
                    });
                });
            });
        });
    }
}); 