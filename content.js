// Global variables
let popup = null;
let selectionIcon = null;
let currentSelectedText = '';
let translatedText = '';
let isTranslating = false;
let detectedLanguage = '';
let lastIconPosition = { left: 0, top: 0 };
let selectedFromElement = null;
let originalSelectionStart = null;
let originalSelectionEnd = null;

// Language options (Google Translate supported languages only)
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

// Load saved language preferences
function getLanguagePreferences() {
    const saved = localStorage.getItem('translatorPrefs');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return { source: 'auto', target: 'en' };
        }
    }
    return { source: 'auto', target: 'en' };
}

// Save language preferences
function saveLanguagePreferences(source, target) {
    localStorage.setItem('translatorPrefs', JSON.stringify({ source, target }));
}

// Create the icon element
function createIcon() {
    if (selectionIcon) {
        document.body.removeChild(selectionIcon);
    }
    
    selectionIcon = document.createElement('div');
    selectionIcon.id = 'selection-icon';
    selectionIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#fff" stroke="#bbb" stroke-width="1"/>
        <circle cx="6" cy="10" r="1.2" fill="#888"/>
        <circle cx="10" cy="10" r="1.2" fill="#888"/>
        <circle cx="14" cy="10" r="1.2" fill="#888"/>
      </svg>
    `;
    selectionIcon.style.cssText = `
        position: absolute;
        z-index: 10000;
        background: transparent;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;
        pointer-events: auto;
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    // Add hover effect to icon
    selectionIcon.addEventListener('mouseenter', function() {
        selectionIcon.style.transform = 'scale(1.1)';
        selectionIcon.style.filter = 'brightness(1.1)';
    });
    
    selectionIcon.addEventListener('mouseleave', function() {
        selectionIcon.style.transform = 'scale(1)';
        selectionIcon.style.filter = 'brightness(1)';
    });
    
    // Add click event to icon
    selectionIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        // Store current position before hiding
        const rect = selectionIcon.getBoundingClientRect();
        lastIconPosition = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        
        // Just fade out the icon, don't remove it
        selectionIcon.style.opacity = '0';
        showPopup();
    });
    
    document.body.appendChild(selectionIcon);
}

// Create popup element
function createPopup() {
    if (popup) {
        document.body.removeChild(popup);
    }
    
    popup = document.createElement('div');
    popup.id = 'selection-popup';
    popup.style.cssText = `
        position: fixed;
        z-index: 10001;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        min-width: 320px;
        max-width: 420px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        overflow: hidden;
    `;
    
    document.body.appendChild(popup);
}

// Generate language options HTML with proper option text
function generateLanguageOptions(selectedLang = 'auto', includeAuto = true) {
    const langEntries = includeAuto ? Object.entries(languages) : Object.entries(languages).filter(([code]) => code !== 'auto');
    return langEntries.map(([code, name]) => 
        `<option value="${code}" ${code === selectedLang ? 'selected' : ''}>${name}</option>`
    ).join('');
}

// Detect language from Google Translate response
function extractDetectedLanguage(data) {
    try {
        if (data && data[2]) {
            return data[2];
        }
        return 'unknown';
    } catch (e) {
        return 'unknown';
    }
}

// Translate text using Google Translate
async function translateText(text, sourceLang, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Extract detected language
        detectedLanguage = extractDetectedLanguage(data);
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
        
        throw new Error('Translation failed');
    } catch (error) {
        console.error('Translation error:', error);
        return 'Translation failed. Please try again.';
    }
}

// Text-to-speech function
function speakText(text, lang, rate = 1) {
    if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-SA' : lang;
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        speechSynthesis.speak(utterance);
    }
}

// Detect multiple languages in text and segment them
async function detectMultipleLanguages(text) {
    try {
        const segments = [];
        
        // Split text into words and phrases to detect mixed languages better
        const words = text.split(/\s+/);
        let currentSegment = null;
        
        for (let word of words) {
            if (word.trim().length === 0) continue;
            
            // Try to detect language for each word/phrase
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(word)}`);
            const data = await response.json();
            
            if (data && data[2]) {
                const detectedLang = data[2];
                const langName = languages[detectedLang] || detectedLang;
                
                // If this is the same language as current segment, add to it
                if (currentSegment && currentSegment.language === detectedLang) {
                    currentSegment.text += ' ' + word;
                } else {
                    // Start new segment
                    if (currentSegment) {
                        segments.push(currentSegment);
                    }
                    currentSegment = {
                        language: detectedLang,
                        languageName: langName,
                        text: word
                    };
                }
            } else {
                // If detection fails, add to current segment or create unknown segment
                if (currentSegment) {
                    currentSegment.text += ' ' + word;
                } else {
                    currentSegment = {
                        language: 'unknown',
                        languageName: 'Unknown',
                        text: word
                    };
                }
            }
        }
        
        // Add the last segment
        if (currentSegment) {
            segments.push(currentSegment);
        }
        
        // Merge consecutive segments of the same language
        const mergedSegments = [];
        for (let segment of segments) {
            const lastSegment = mergedSegments[mergedSegments.length - 1];
            if (lastSegment && lastSegment.language === segment.language) {
                lastSegment.text += ' ' + segment.text;
            } else {
                mergedSegments.push(segment);
            }
        }
        
        return mergedSegments.length > 1 ? mergedSegments : null;
    } catch (error) {
        console.error('Multi-language detection failed:', error);
        return null;
    }
}

// Speak specific language segment
function speakLanguageSegment(text, lang, rate = 1) {
    if ('speechSynthesis' in window) {
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        
        // Try to find a voice for the specific language
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang)) || 
                     voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = lang;
        }
        
        window.speechSynthesis.speak(utterance);
    }
}

// Text selection change handler
function handleSelectionChange() {
    setTimeout(() => {
        const activeElement = document.activeElement;
        let hasSelection = false;
        let selectionInInput = false;
        
        // Check if there's selection in input/textarea
        if (isInputElement(activeElement)) {
            const selectedText = getInputSelection(activeElement);
            if (selectedText.trim() !== '') {
                hasSelection = true;
                selectionInInput = true;
                
                // Store the element info when we detect selection in input/textarea
                selectedFromElement = activeElement;
                originalSelectionStart = activeElement.selectionStart;
                originalSelectionEnd = activeElement.selectionEnd;
                console.log('Selection detected in input/textarea:', activeElement);
                console.log('Stored selection positions:', originalSelectionStart, 'to', originalSelectionEnd);
            }
        }
        
        // Check regular text selection only if no input selection
        if (!selectionInInput) {
            const selection = window.getSelection();
            if (selection.toString().trim() !== '') {
                hasSelection = true;
                
                // Only clear stored element info if we're sure this is a new regular text selection
                // and not just a secondary event from the same input selection
                if (!selectedFromElement || !isInputElement(selectedFromElement)) {
                    selectedFromElement = null;
                    originalSelectionStart = null;
                    originalSelectionEnd = null;
                    console.log('Selection detected in regular text (not editable)');
                }
            }
        }
        
        if (hasSelection) {
            showIcon();
        } else {
            // Text deselected - hide icon and popup
            hideIcon();
            hidePopup();
            // Clear stored element info only when no selection exists
            selectedFromElement = null;
            originalSelectionStart = null;
            originalSelectionEnd = null;
        }
    }, 10);
}

// Get language name from code
function getLanguageName(langCode) {
    return languages[langCode] || langCode || 'Unknown';
}

// Detect if language is RTL
function isRTLLanguage(langCode) {
    const rtlLanguages = ['ar', 'fa', 'he', 'ur', 'ps', 'sd', 'ckb', 'dv'];
    return rtlLanguages.includes(langCode);
}

// Validate if stored element is still valid and accessible
function isStoredElementValid() {
    if (!selectedFromElement) {
        return false;
    }
    
    // Check if element is still in DOM
    if (!document.contains(selectedFromElement)) {
        console.log('Stored element is no longer in DOM');
        return false;
    }
    
    // Check if it's still an input/textarea
    if (!isInputElement(selectedFromElement)) {
        console.log('Stored element is no longer an input/textarea');
        return false;
    }
    
    // Check if selection positions are still valid
    if (originalSelectionStart === null || originalSelectionEnd === null) {
        console.log('Selection positions are null');
        return false;
    }
    
    // Check if element still has the expected text length
    if (selectedFromElement.value.length < originalSelectionEnd) {
        console.log('Element text is shorter than expected selection end');
        return false;
    }
    
    return true;
}

// Show popup with intelligent positioning
async function showPopup() {
    if (!popup) {
        createPopup();
    }
    
    // Reset translation state
    translatedText = '';
    isTranslating = false;
    detectedLanguage = '';
    
    // Get saved preferences
    const prefs = getLanguagePreferences();
    
    // Check if we're in an editable area using stored element with validation
    const isInEditableArea = isStoredElementValid();
    
    // Debug logging
    console.log('Selected from element:', selectedFromElement);
    console.log('Is stored element valid:', isInEditableArea);
    console.log('Element tag:', selectedFromElement?.tagName);
    console.log('Element contentEditable:', selectedFromElement?.contentEditable);
    console.log('Original selection positions:', originalSelectionStart, 'to', originalSelectionEnd);
    
    // Generate replace button HTML ONLY if in editable area
    const replaceButtonHTML = isInEditableArea ? `
        <button id="replace-btn" style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 4px 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s ease; font-size: 11px; color: #374151;" title="Replace selected text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                <path d="M16 3l4 4-4 4"></path>
                <path d="M20 7H4"></path>
                <path d="M8 21l-4-4 4-4"></path>
                <path d="M4 17h16"></path>
            </svg>
            <span style="font-weight: 500;">Replace</span>
        </button>
    ` : '';
    
    console.log('Replace button HTML length:', replaceButtonHTML.length);
    console.log('Will show replace button:', isInEditableArea);
    
    // Update popup content
    popup.innerHTML = `
        <!-- Compact Header with Language Selection and Controls -->
        <div style="background: #f5f5f5; padding: 6px 10px; border-bottom: 1px solid #d1d5db; height: 36px; display: flex; align-items: center; justify-content: space-between;">
            <!-- Language Selectors (Left) -->
            <div style="display: flex; gap: 4px; align-items: center; flex: 1;">
                <select id="source-lang" style="padding: 2px 4px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 10px; background: white; width: 60px; color: #374151; cursor: pointer; transition: all 0.2s ease;">
                    ${generateLanguageOptions(prefs.source, true)}
                </select>
                <span style="color: #374151; font-size: 12px; margin: 0 2px; font-weight: bold;">→</span>
                <select id="target-lang" style="padding: 2px 4px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 10px; background: white; width: 60px; color: #374151; cursor: pointer; transition: all 0.2s ease;">
                    ${generateLanguageOptions(prefs.target, false)}
                </select>
            </div>
            
            <!-- Control Icons (Right) -->
            <div style="display: flex; gap: 8px; align-items: center;">
                <div id="history-btn" style="cursor: pointer; color: #6b7280; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; padding: 2px;" title="History">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                        <path d="M12 7v5l4 2"></path>
                    </svg>
                </div>
                <div id="settings-btn" style="cursor: pointer; color: #6b7280; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; padding: 2px;" title="Settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </div>
                <div id="close-btn" style="cursor: pointer; color: #6b7280; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; font-size: 18px; padding: 2px;">×</div>
            </div>
        </div>
        
        <!-- Content Area -->
        <div style="padding: 12px;">
            <!-- Multi-Language Detection Section -->
            <div id="multi-lang-section" style="margin-bottom: 12px; display: none;">
                <div id="language-segments"></div>
            </div>
            
            <!-- Single Language Detection Section -->
            <div id="single-lang-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div id="detected-lang" style="font-size: 12px; color: #6b7280; flex: 1;">
                    Detecting language...
                </div>
                <!-- Speech Buttons -->
                <div style="display: flex; gap: 4px;">
                    <button id="speak-normal" style="background: #f3f4f6; border: 1px solid #d1d5db; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" title="Normal speed">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                    <button id="speak-slow" style="background: #f3f4f6; border: 1px solid #d1d5db; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; position: relative;" title="Slow speed (0.25x)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        <span style="position: absolute; top: -2px; right: -2px; background: #6b7280; color: white; font-size: 7px; padding: 1px 2px; border-radius: 2px; line-height: 1;">0.25x</span>
                    </button>
                </div>
            </div>
            
            <!-- Translation Result -->
            <div id="translation-section" style="margin-bottom: 6px; display: none;">
                <div id="translation-result" style="background: #f9fafb; padding: 12px; border-radius: 6px; color: #374151; font-size: 14px; max-height: 120px; overflow-y: auto; border: 1px solid #e5e7eb; line-height: 1.5; text-align: center;">
                    <!-- Translation will appear here -->
                </div>
                
                <!-- Action Buttons (Below Translation, Centered) -->
                <div style="display: flex; justify-content: center; gap: 6px; margin-top: 6px;">
                    ${replaceButtonHTML}
                    <button id="copy-btn" style="background: #f3f4f6; border: 1px solid #d1d5db; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" title="Copy translation">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Loading State -->
            <div id="loading-state" style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">
                <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #6b7280; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></div>
                Translating...
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 6px 10px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; align-items: center; height: 32px;">
            <!-- AI Explain Button (Left) -->
            <button id="ai-explain-btn" style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 4px 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s ease; font-size: 10px; color: #1976d2; font-weight: 500;" title="AI Explain">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                    <rect x="9" y="7" width="6" height="6"></rect>
                </svg>
                AI Explain
            </button>
            
            <!-- Correction Toggle (Right) -->
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; color: #6b7280; font-weight: 500;">Correction</span>
                <div id="correction-toggle" style="width: 32px; height: 16px; background: #e5e7eb; border-radius: 8px; cursor: pointer; position: relative; transition: all 0.3s ease;" title="Toggle correction mode">
                    <div style="width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.3s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Hover effects */
            #close-btn:hover, #settings-btn:hover, #history-btn:hover {
                color: #374151 !important;
                transform: scale(1.1) !important;
            }
            
            #source-lang:hover, #target-lang:hover {
                border-color: #9ca3af !important;
                box-shadow: 0 0 0 1px #9ca3af !important;
            }
            
            #speak-normal:hover, #speak-slow:hover {
                background: #e5e7eb !important;
                border-color: #9ca3af !important;
                transform: scale(1.05) !important;
            }
            
            #copy-btn:hover, #replace-btn:hover {
                background: #e5e7eb !important;
                border-color: #9ca3af !important;
                transform: scale(1.05) !important;
            }
            
            #ai-explain-btn:hover {
                background: #bbdefb !important;
                border-color: #90caf9 !important;
                transform: scale(1.05) !important;
            }
            
            #correction-toggle:hover {
                background: #d1d5db !important;
            }
            
            .lang-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 3px;
                padding: 2px 0;
            }
            
            .lang-name {
                font-weight: 500;
                color: #374151;
                font-size: 11px;
            }
            
            .lang-buttons {
                display: flex;
                gap: 1px;
            }
            
            .lang-speak-btn {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                width: 20px;
                height: 20px;
                border-radius: 2px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .lang-speak-btn:hover {
                background: #e5e7eb !important;
                transform: scale(1.05) !important;
            }
            
            /* RTL Support */
            .rtl-text {
                direction: rtl;
                text-align: right;
                unicode-bidi: embed;
            }
        </style>
    `;
    
    // Position popup intelligently
    positionPopup();
    
    // Show popup with animation
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0)';
    
    // Start auto-translation and multi-language detection
    setTimeout(async () => {
        await performTranslation();
        await detectAndShowMultipleLanguages();
        setupEventListeners();
    }, 100);
}

// Detect and show multiple languages
async function detectAndShowMultipleLanguages() {
    const segments = await detectMultipleLanguages(currentSelectedText);
    
    if (segments && segments.length > 1) {
        // Show multi-language section with speech buttons
        const multiLangSection = popup.querySelector('#multi-lang-section');
        const singleLangSection = popup.querySelector('#single-lang-section');
        const languageSegments = popup.querySelector('#language-segments');
        
        if (multiLangSection && singleLangSection && languageSegments) {
            multiLangSection.style.display = 'block';
            singleLangSection.style.display = 'none';
            
            // Generate HTML for each language with speech buttons
            languageSegments.innerHTML = segments.map((segment, index) => `
                <div class="lang-item">
                    <span class="lang-name">${segment.languageName}</span>
                    <div class="lang-buttons">
                        <button class="lang-speak-btn" onclick="speakLanguageSegment('${segment.text.replace(/'/g, "\\'")}', '${segment.language}', 1)" title="Normal speed">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </button>
                        <button class="lang-speak-btn" onclick="speakLanguageSegment('${segment.text.replace(/'/g, "\\'")}', '${segment.language}', 0.25)" title="Slow speed" style="position: relative;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                            <span style="position: absolute; top: -2px; right: -2px; background: #6b7280; color: white; font-size: 7px; padding: 1px 2px; border-radius: 2px; line-height: 1;">0.25x</span>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Perform translation
async function performTranslation() {
    if (!currentSelectedText || isTranslating) return;
    
    isTranslating = true;
    const loadingState = popup.querySelector('#loading-state');
    const translationSection = popup.querySelector('#translation-section');
    const translationResult = popup.querySelector('#translation-result');
    
    if (loadingState) loadingState.style.display = 'block';
    if (translationSection) translationSection.style.display = 'none';
    
    try {
        const prefs = getLanguagePreferences();
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${prefs.source}&tl=${prefs.target}&dt=t&q=${encodeURIComponent(currentSelectedText)}`);
        
        if (response.ok) {
            const result = await response.json();
            translatedText = result[0][0][0];
            detectedLanguage = result[2] || prefs.source;
            
            // Update detected language display
            const detectedLangDiv = popup.querySelector('#detected-lang');
            if (detectedLangDiv) {
                const languageName = getLanguageName(detectedLanguage);
                detectedLangDiv.textContent = `Detected: ${languageName}`;
            }
            
            // Show translation with RTL support while preserving buttons
            if (translationResult) {
                const isTargetRTL = isRTLLanguage(prefs.target);
                const rtlClass = isTargetRTL ? 'rtl-text' : '';
                
                // Find existing buttons container
                const existingButtons = translationResult.querySelector('div[style*="position: absolute"]');
                const buttonsHTML = existingButtons ? existingButtons.outerHTML : '';
                
                // Update content while preserving buttons
                translationResult.innerHTML = `
                    <div class="${rtlClass}" style="text-align: center;">${translatedText}</div>
                `;
            }
            
            if (loadingState) loadingState.style.display = 'none';
            if (translationSection) translationSection.style.display = 'block';
            
            // Save translation to history
            await saveTranslationToHistory(currentSelectedText, translatedText, detectedLanguage, prefs.target);
            
            // Re-setup event listeners for buttons after content update
            setupTranslationButtons();
        }
    } catch (error) {
        console.error('Translation error:', error);
        if (translationResult) {
            const existingButtons = translationResult.querySelector('div[style*="position: absolute"]');
            const buttonsHTML = existingButtons ? existingButtons.outerHTML : '';
            
            translationResult.innerHTML = `
                <div style="text-align: center;">Translation failed. Please try again.</div>
            `;
        }
        if (loadingState) loadingState.style.display = 'none';
        if (translationSection) translationSection.style.display = 'block';
        
        // Re-setup event listeners for buttons
        setupTranslationButtons();
    }
    
    isTranslating = false;
}

// Setup event listeners specifically for translation buttons
function setupTranslationButtons() {
    // Copy button
    const copyBtn = popup.querySelector('#copy-btn');
    if (copyBtn) {
        copyBtn.removeEventListener('click', handleCopyClick); // Remove existing listener
        copyBtn.addEventListener('click', handleCopyClick);
    }
    
    // Replace button (only for editable areas)
    const replaceBtn = popup.querySelector('#replace-btn');
    if (replaceBtn) {
        replaceBtn.removeEventListener('click', handleReplaceClick); // Remove existing listener
        replaceBtn.addEventListener('click', handleReplaceClick);
    }
}

// Copy button click handler
function handleCopyClick() {
    if (translatedText) {
        navigator.clipboard.writeText(translatedText).then(() => {
            const copyBtn = popup.querySelector('#copy-btn');
            if (copyBtn) {
                // Visual feedback
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                `;
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                }, 1500);
            }
        });
    }
}

// Replace selected text with translation in editable areas
function replaceSelectedText(translationText) {
    console.log('Replace function called with text:', translationText);
    console.log('Selected from element:', selectedFromElement);
    console.log('Original selection start:', originalSelectionStart);
    console.log('Original selection end:', originalSelectionEnd);
    
    // Validate stored element
    if (!isStoredElementValid()) {
        console.log('Cannot replace: stored element is not valid');
        return;
    }
    
    const element = selectedFromElement;
    const startPos = originalSelectionStart;
    const endPos = originalSelectionEnd;
    
    console.log('Using validated element:', element);
    console.log('Element tag:', element.tagName);
    console.log('Element type:', element.type);
    console.log('Current value length:', element.value.length);
    console.log('Selection range:', startPos, 'to', endPos);
    
    try {
        // Get current text
        const currentText = element.value;
        const selectedText = currentText.substring(startPos, endPos);
        
        console.log('Current full text:', currentText);
        console.log('Selected text from positions:', selectedText);
        console.log('Expected selected text:', currentSelectedText);
        
        // Verify the text matches what we expect
        if (selectedText !== currentSelectedText) {
            console.log('Warning: Selected text does not match expected text');
            console.log('Expected:', currentSelectedText);
            console.log('Found:', selectedText);
            
            // Try to find the text in current content
            const textIndex = currentText.indexOf(currentSelectedText);
            if (textIndex !== -1) {
                console.log('Found text at index:', textIndex);
                // Update positions
                const newStartPos = textIndex;
                const newEndPos = textIndex + currentSelectedText.length;
                
                // Replace using found positions
                const newText = currentText.substring(0, newStartPos) + translationText + currentText.substring(newEndPos);
                element.value = newText;
                
                // Set cursor position after replaced text
                const newCursorPos = newStartPos + translationText.length;
                element.setSelectionRange(newCursorPos, newCursorPos);
                
                console.log('Successfully replaced text using search method');
                
                // Trigger events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                
                return;
            } else {
                console.log('Could not find text in current content');
                return;
            }
        }
        
        // Replace text using stored positions
        const newText = currentText.substring(0, startPos) + translationText + currentText.substring(endPos);
        element.value = newText;
        
        // Set cursor position after replaced text
        const newCursorPos = startPos + translationText.length;
        element.setSelectionRange(newCursorPos, newCursorPos);
        
        console.log('New text:', newText);
        console.log('New cursor position:', newCursorPos);
        console.log('Successfully replaced text using stored positions');
        
        // Trigger input and change events to notify the page
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Focus the element to ensure it's active
        element.focus();
        
    } catch (error) {
        console.error('Error replacing text:', error);
    }
}

// Replace button click handler
function handleReplaceClick() {
    console.log('Replace button clicked');
    console.log('Translated text:', translatedText);
    console.log('Current selected text:', currentSelectedText);
    
    if (translatedText) {
        replaceSelectedText(translatedText);
    } else {
        console.log('No translated text available');
    }
}

// Setup event listeners for popup
function setupEventListeners() {
    if (!popup) return;
    
    // Close button
    const closeBtn = popup.querySelector('#close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hidePopup();
            hideIcon();
        });
    }
    
    // Setup translation buttons
    setupTranslationButtons();
    
    // Language selectors
    const sourceLang = popup.querySelector('#source-lang');
    const targetLang = popup.querySelector('#target-lang');
    
    if (sourceLang) {
        sourceLang.addEventListener('change', () => {
            saveLanguagePreferences(sourceLang.value, targetLang.value);
            performTranslation();
        });
    }
    
    if (targetLang) {
        targetLang.addEventListener('change', () => {
            saveLanguagePreferences(sourceLang.value, targetLang.value);
            performTranslation();
        });
    }
    
    // Speech buttons
    const speakNormal = popup.querySelector('#speak-normal');
    const speakSlow = popup.querySelector('#speak-slow');
    
    if (speakNormal) {
        speakNormal.addEventListener('click', () => {
            speakText(currentSelectedText, detectedLanguage || 'auto', 1);
        });
    }
    
    if (speakSlow) {
        speakSlow.addEventListener('click', () => {
            speakText(currentSelectedText, detectedLanguage || 'auto', 0.25);
        });
    }
    
    // Settings and History buttons (placeholder)
    const settingsBtn = popup.querySelector('#settings-btn');
    const historyBtn = popup.querySelector('#history-btn');
    const correctionToggle = popup.querySelector('#correction-toggle');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings clicked - opening options page');
            chrome.runtime.sendMessage({ action: 'openOptions' });
        });
    }
    
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            console.log('History clicked');
            showHistoryDialog();
        });
    }
    
    if (correctionToggle) {
        correctionToggle.addEventListener('click', () => {
            console.log('Correction toggle clicked');
            // TODO: Implement correction functionality
            const isActive = correctionToggle.style.background === 'rgb(59, 130, 246)';
            if (isActive) {
                correctionToggle.style.background = '#e5e7eb';
                correctionToggle.style.color = '#374151';
            } else {
                correctionToggle.style.background = '#3b82f6';
                correctionToggle.style.color = 'white';
            }
        });
    }
}

// Intelligent popup positioning
function positionPopup() {
    if (!popup) return;
    
    // Use stored icon position or fallback to current selection
    let iconRect = lastIconPosition;
    
    // If no stored position, try to get current selection position
    if (!iconRect.left && !iconRect.top) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            iconRect = {
                left: rect.left, // Use left side for positioning
                top: rect.bottom,
                width: 24,
                height: 24
            };
        } else {
            // Fallback to center of screen
            iconRect = {
                left: window.innerWidth / 2,
                top: window.innerHeight / 2,
                width: 24,
                height: 24
            };
        }
    }
    
    const popupRect = popup.getBoundingClientRect();
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position popup below and to the side to avoid covering selected text
    let left = iconRect.left + 30; // Offset to the right
    let top = iconRect.top + 15; // Small gap below selection
    
    // Adjust horizontal position if popup goes off-screen
    if (left + popupRect.width > viewport.width - 10) {
        left = iconRect.left - popupRect.width - 30; // Show to the left instead
    }
    if (left < 10) {
        left = 10;
    }
    
    // Adjust vertical position if popup goes off-screen
    if (top + popupRect.height > viewport.height - 10) {
        // Show popup above the selection instead
        top = iconRect.top - popupRect.height - 15;
        
        // If still off-screen, position at top of viewport
        if (top < 10) {
            top = 10;
        }
    }
    
    // Convert to absolute positioning
    popup.style.left = (left + scrollLeft) + 'px';
    popup.style.top = (top + scrollTop) + 'px';
}

// Hide popup
function hidePopup() {
    if (popup) {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (popup && popup.parentNode) {
                document.body.removeChild(popup);
                popup = null;
            }
        }, 200);
    }
    
    // Hide icon completely when popup is hidden
    if (selectionIcon) {
        selectionIcon.style.opacity = '0';
        setTimeout(() => {
            if (selectionIcon && selectionIcon.parentNode) {
                document.body.removeChild(selectionIcon);
                selectionIcon = null;
            }
        }, 200);
    }
}

// Check if element is input or textarea
function isInputElement(element) {
    return element && (
        element.tagName === 'INPUT' || 
        element.tagName === 'TEXTAREA' ||
        element.contentEditable === 'true'
    );
}

// Get selected text from input/textarea
function getInputSelection(element) {
    if (!element) return '';
    
    const start = element.selectionStart;
    const end = element.selectionEnd;
    
    if (start !== undefined && end !== undefined && start !== end) {
        return element.value.substring(start, end);
    }
    
    return '';
}

// Show icon at selection position with improved positioning
function showIcon() {
    const activeElement = document.activeElement;
    let selectedText = '';
    let rect = null;
    
    // Check if selection is in input/textarea
    if (isInputElement(activeElement)) {
        selectedText = getInputSelection(activeElement);
        if (selectedText.trim() !== '') {
            currentSelectedText = selectedText.trim();
            
            // Element info is already stored in handleSelectionChange
            console.log('Showing icon for input/textarea selection');
            
            if (!selectionIcon) {
                createIcon();
            }
            
            // Get element position more accurately
            const elementRect = activeElement.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            // Position icon at left edge of input element with proper offset
            const iconLeft = elementRect.left + scrollLeft;
            const iconTop = elementRect.top + scrollTop - 35; // Above the input
            
            // Store position for popup
            lastIconPosition = {
                left: elementRect.left,
                top: elementRect.bottom,
                width: 24,
                height: 24
            };
            
            // Set icon position without jumping
            selectionIcon.style.position = 'absolute';
            selectionIcon.style.left = iconLeft + 'px';
            selectionIcon.style.top = iconTop + 'px';
            selectionIcon.style.opacity = '1';
            selectionIcon.style.transform = 'scale(1)';
            
            return;
        }
    }
    
    // Check regular text selection
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    
    if (selectedText === '') {
        hideIcon();
        return;
    }
    
    currentSelectedText = selectedText;
    
    // Element info is already cleared in handleSelectionChange for regular text
    console.log('Showing icon for regular text selection');
    
    if (!selectionIcon) {
        createIcon();
    }
    
    const range = selection.getRangeAt(0);
    rect = range.getBoundingClientRect();
    
    // Get scroll positions
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position icon at the beginning of selection (left side)
    const iconLeft = rect.left + scrollLeft;
    const iconTop = rect.top + scrollTop - 35; // Above the selection
    
    // Store position for popup
    lastIconPosition = {
        left: rect.left,
        top: rect.bottom,
        width: 24,
        height: 24
    };
    
    // Set icon position without jumping animation
    selectionIcon.style.position = 'absolute';
    selectionIcon.style.left = iconLeft + 'px';
    selectionIcon.style.top = iconTop + 'px';
    selectionIcon.style.opacity = '1';
    selectionIcon.style.transform = 'scale(1)';
}

// Hide icon
function hideIcon() {
    if (selectionIcon) {
        selectionIcon.style.opacity = '0';
        // Don't remove the icon element, just hide it
    }
    hidePopup();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add selection change listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    // Add input event listeners for input/textarea elements
    document.addEventListener('input', handleSelectionChange);
    document.addEventListener('focus', handleSelectionChange);
    document.addEventListener('blur', () => {
        // When focus is lost, check if there's still selection
        setTimeout(handleSelectionChange, 50);
    });
    
    // Add click listener to hide icon when clicking elsewhere
    document.addEventListener('click', (e) => {
        // Don't hide if clicking on the icon or popup
        if (selectionIcon && (e.target === selectionIcon || selectionIcon.contains(e.target))) {
            return;
        }
        if (popup && (e.target === popup || popup.contains(e.target))) {
            return;
        }
        
        // Check if there's still selection after click
        setTimeout(handleSelectionChange, 50);
    });
});

// Also add listeners when DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupSelectionListeners();
    });
} else {
    setupSelectionListeners();
}

function setupSelectionListeners() {
    // Add selection change listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    // Add input event listeners for input/textarea elements
    document.addEventListener('input', handleSelectionChange);
    document.addEventListener('focus', handleSelectionChange);
    document.addEventListener('blur', () => {
        // When focus is lost, check if there's still selection
        setTimeout(handleSelectionChange, 50);
    });
    
    // Add click listener to hide icon when clicking elsewhere
    document.addEventListener('click', (e) => {
        // Don't hide if clicking on the icon or popup
        if (selectionIcon && (e.target === selectionIcon || selectionIcon.contains(e.target))) {
            return;
        }
        if (popup && (e.target === popup || popup.contains(e.target))) {
            return;
        }
        
        // Check if there's still selection after click
        setTimeout(handleSelectionChange, 50);
    });
    
    // Handle window resize to reposition popup
    window.addEventListener('resize', function() {
        if (popup && popup.style.opacity === '1') {
            positionPopup();
        }
    });
}

// Speech synthesis for individual language segments
window.speakLanguageSegment = function(text, language, rate = 1) {
    if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        utterance.volume = 1;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
    }
};

// Translation History Management
async function saveTranslationToHistory(sourceText, translatedText, sourceLang, targetLang) {
    try {
        const historyItem = {
            id: Date.now(),
            sourceText: sourceText,
            translatedText: translatedText,
            sourceLang: sourceLang,
            targetLang: targetLang,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            title: document.title
        };
        
        // Get existing history
        const result = await chrome.storage.local.get(['translationHistory']);
        let history = result.translationHistory || [];
        
        // Add new item to beginning
        history.unshift(historyItem);
        
        // Keep only last 50 items
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        // Save back to storage
        await chrome.storage.local.set({ translationHistory: history });
        console.log('Translation saved to history');
    } catch (error) {
        console.error('Error saving translation to history:', error);
    }
}

async function getTranslationHistory() {
    try {
        const result = await chrome.storage.local.get(['translationHistory']);
        return result.translationHistory || [];
    } catch (error) {
        console.error('Error getting translation history:', error);
        return [];
    }
}

async function clearTranslationHistory() {
    try {
        await chrome.storage.local.remove(['translationHistory']);
        console.log('Translation history cleared');
    } catch (error) {
        console.error('Error clearing translation history:', error);
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

async function showHistoryDialog() {
    // Hide current popup first
    if (popup) {
        popup.style.display = 'none';
    }
    
    const history = await getTranslationHistory();
    
    // Create history dialog
    const historyDialog = document.createElement('div');
    historyDialog.id = 'translation-history-dialog';
    historyDialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        max-width: 90vw;
        max-height: 70vh;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;
    
    const historyItems = history.length > 0 ? history.map(item => `
        <div class="history-item" style="padding: 10px; margin: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fafafa; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div style="flex: 1;">
                    <div style="font-size: 10px; color: #6b7280; margin-bottom: 3px; display: flex; align-items: center; gap: 8px;">
                        <span>${formatDate(item.timestamp)}</span>
                        <a href="${item.url}" target="_blank" style="color: #3b82f6; text-decoration: none;" title="${item.title}">
                            ${item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title}
                        </a>
                    </div>
                    <div style="font-weight: 500; color: #374151; margin-bottom: 4px; font-size: 13px;">${item.sourceText}</div>
                    <div style="color: #1f2937; font-size: 13px; line-height: 1.3;">${item.translatedText}</div>
                </div>
                <button class="copy-history-btn" data-text="${item.translatedText.replace(/"/g, '&quot;')}" style="background: #f3f4f6; border: 1px solid #d1d5db; width: 24px; height: 24px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 8px; transition: all 0.2s ease;" title="Copy translation">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('') : `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px;">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M12 7v5l4 2"></path>
            </svg>
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 4px;">No translations yet</div>
            <div style="font-size: 14px;">Your translation history will appear here</div>
        </div>
    `;
    
    historyDialog.innerHTML = `
        <!-- Header -->
        <div style="background: #f8f9fa; padding: 10px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Translation History</h2>
                <p style="margin: 1px 0 0 0; font-size: 11px; color: #6b7280;">Last ${Math.min(history.length, 50)} translations</p>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
                ${history.length > 0 ? `
                    <button id="clear-history-btn" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s ease;" title="Clear all history">
                        Clear All
                    </button>
                ` : ''}
                <button id="close-history-btn" style="background: #6b7280; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s ease;">×</button>
            </div>
        </div>
        
        <!-- History List -->
        <div style="flex: 1; overflow-y: auto; max-height: 400px;">
            ${historyItems}
        </div>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(historyDialog);
    
    // Event listeners
    const closeBtn = historyDialog.querySelector('#close-history-btn');
    const clearBtn = historyDialog.querySelector('#clear-history-btn');
    const copyBtns = historyDialog.querySelectorAll('.copy-history-btn');
    
    function closeDialog() {
        document.body.removeChild(backdrop);
        document.body.removeChild(historyDialog);
        // Show popup back if it exists
        if (popup) {
            popup.style.display = 'block';
        }
    }
    
    closeBtn.addEventListener('click', closeDialog);
    backdrop.addEventListener('click', closeDialog);
    
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all translation history?')) {
                await clearTranslationHistory();
                closeDialog();
            }
        });
    }
    
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const text = btn.getAttribute('data-text').replace(/&quot;/g, '"');
            try {
                await navigator.clipboard.writeText(text);
                // Visual feedback
                const originalIcon = btn.innerHTML;
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                `;
                setTimeout(() => {
                    btn.innerHTML = originalIcon;
                }, 1500);
            } catch (error) {
                console.error('Failed to copy text:', error);
            }
        });
    });
    
    // Add hover effects
    const style = document.createElement('style');
    style.textContent = `
        .copy-history-btn:hover {
            background: #e5e7eb !important;
            border-color: #9ca3af !important;
            transform: scale(1.05) !important;
        }
        
        .history-item:hover {
            background: #f9fafb !important;
        }
        
        #clear-history-btn:hover {
            background: #dc2626 !important;
        }
        
        #close-history-btn:hover {
            background: #4b5563 !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize
createIcon(); 