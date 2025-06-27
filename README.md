# Smart Translation Chrome Extension

A powerful Chrome extension that provides instant translation with advanced features like multi-language detection, text-to-speech, translation history, and smart text replacement.

## 🚀 Features

### Core Translation
- **Instant Translation**: Select any text on any webpage for immediate translation
- **Smart Language Detection**: Automatically detects source language
- **40+ Languages Support**: Translate between major world languages
- **RTL Language Support**: Proper support for Arabic, Persian, Hebrew, etc.

### Advanced Features
- **Multi-Language Detection**: Detects and handles mixed-language text
- **Text-to-Speech**: Listen to original and translated text with normal/slow speeds
- **Smart Text Replacement**: Replace selected text with translation in editable areas
- **Translation History**: Keep track of your last 50 translations with timestamps and source pages
- **Customizable Settings**: Configure default languages, font sizes, and behavior

### User Interface
- **Smart Popup Positioning**: Popup appears below selected text without covering it
- **Compact Design**: Minimal and clean interface that doesn't interfere with browsing
- **Responsive Layout**: Works perfectly on all screen sizes
- **Modern Icons**: Clean, consistent iconography throughout

## 📦 Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension is now installed and ready to use!

## 🎯 How to Use

1. **Select Text**: Highlight any text on any webpage
2. **Click the Icon**: A small icon appears near your selection
3. **View Translation**: Click the icon to see instant translation
4. **Use Features**: 
   - Click speaker icons for text-to-speech
   - Use copy button to copy translation
   - Use replace button in editable areas
   - Access history and settings from the header

## 🛠️ Technical Details

### Files Structure
- `manifest.json` - Extension configuration
- `content.js` - Main functionality and UI
- `content.css` - Styling for content script
- `popup.html/js/css` - Extension popup interface
- `options.html/js` - Settings page
- `background.js` - Service worker for background tasks

### Technologies Used
- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No external dependencies
- **Google Translate API**: Free translation service
- **Chrome Storage API**: Settings and history persistence
- **Web Speech API**: Text-to-speech functionality

### Key Features Implementation
- **Smart Positioning**: Advanced algorithm to position popup optimally
- **Multi-Language Detection**: Word-by-word language analysis
- **History Management**: Efficient storage with automatic cleanup
- **RTL Support**: Proper text direction handling
- **Error Handling**: Comprehensive error management and fallbacks

## ⚙️ Configuration

Access settings by clicking the gear icon in the translation popup:

- **Default Languages**: Set your preferred source and target languages
- **Translation Font Size**: Choose from 12px to 18px
- **Multi-Language Detection**: Enable/disable mixed language detection
- **Text-to-Speech**: Configure speech settings

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Edge**: Full support
- **Other Chromium browsers**: Should work with minor limitations

## 🔒 Privacy

- **No Data Collection**: Extension doesn't collect or store personal data
- **Local Storage**: All settings and history stored locally
- **Secure API Calls**: Translation requests made directly to Google Translate
- **No Tracking**: No analytics or user tracking

## 🐛 Known Issues & Limitations

- Translation quality depends on Google Translate service
- Some websites with strict CSP may limit functionality
- Text-to-speech availability varies by browser and system
- Large text selections may have slower translation times

## 🤝 Contributing

Feel free to contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆕 Version History

### v1.0.0 (Current)
- Initial release with full translation functionality
- Multi-language detection
- Text-to-speech support
- Translation history
- Settings page
- Smart text replacement

## 🙏 Acknowledgments

- Google Translate API for translation services
- Chrome Extensions team for the platform
- Open source community for inspiration and resources

---

**Made with ❤️ for better web browsing experience** 