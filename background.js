// Background script for handling extension actions

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptions') {
        // Open the options page
        chrome.runtime.openOptionsPage();
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Translation Extension installed');
    } else if (details.reason === 'update') {
        console.log('Translation Extension updated');
    }
}); 