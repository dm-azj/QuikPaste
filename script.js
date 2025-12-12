// DOM elements for index.html
const pasteContent = document.getElementById('paste-content');
const syntaxHighlighting = document.getElementById('syntax-highlighting');
const expiration = document.getElementById('expiration');
const createPasteBtn = document.getElementById('create-paste');
const resultDiv = document.getElementById('result');
const pasteUrlInput = document.getElementById('paste-url');
const copyUrlBtn = document.getElementById('copy-url');
const viewLink = document.getElementById('view-link');
const rawLink = document.getElementById('raw-link');

// DOM elements for view.html
const codeDisplay = document.getElementById('code-display');
const pasteId = document.getElementById('paste-id');
const pasteDate = document.getElementById('paste-date');
const pasteExpiration = document.getElementById('paste-expiration');
const copyContentBtn = document.getElementById('copy-content');
const newPasteBtn = document.getElementById('new-paste');
const rawLinkView = document.getElementById('raw-link');

// DOM elements for raw.html
const rawContent = document.getElementById('raw-content');

// Check which page we're on
const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
const isViewPage = window.location.pathname.endsWith('view.html');
const isRawPage = window.location.pathname.endsWith('raw.html');

// Helper function to show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to calculate expiration date
function getExpirationDate(expiration) {
    const now = new Date();
    switch (expiration) {
        case '1hour':
            return new Date(now.getTime() + 60 * 60 * 1000);
        case '1day':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case '1week':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        default:
            return null; // Never expires
    }
}

// Function to format date
function formatDate(date) {
    if (!date) return 'Never';
    return date.toLocaleString();
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Copied to clipboard!'))
        .catch(err => showNotification('Failed to copy text', 'error'));
}

// Function to generate unique ID
function generateId() {
    return nanoid(8);
}

// Function to create paste
function createPaste() {
    const content = pasteContent.value.trim();
    
    if (!content) {
        showNotification('Please enter some content', 'error');
        return;
    }
    
    const id = generateId();
    const syntax = syntaxHighlighting.value;
    const expires = getExpirationDate(expiration.value);
    const created = new Date();
    
    const pasteData = {
        id,
        content,
        syntax,
        expires: expires ? expires.toISOString() : null,
        created: created.toISOString()
    };
    
    // Compress and encode the data
    const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(pasteData));
    
    // Create URLs
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    const viewUrl = `${baseUrl}view.html#${compressedData}`;
    const rawUrl = `${baseUrl}raw.html#${compressedData}`;
    
    // Display result
    pasteUrlInput.value = viewUrl;
    viewLink.href = viewUrl;
    rawLink.href = rawUrl;
    resultDiv.classList.remove('hidden');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Function to load paste on view page
function loadPaste() {
    const hash = window.location.hash.substring(1);
    
    if (!hash) {
        codeDisplay.textContent = 'No paste data found.';
        return;
    }
    
    try {
        const pasteData = JSON.parse(LZString.decompressFromEncodedURIComponent(hash));
        
        // Check if paste has expired
        if (pasteData.expires) {
            const expirationDate = new Date(pasteData.expires);
            if (new Date() > expirationDate) {
                codeDisplay.textContent = 'This paste has expired.';
                return;
            }
        }
        
        // Display paste data
        codeDisplay.textContent = pasteData.content;
        codeDisplay.className = `language-${pasteData.syntax}`;
        
        pasteId.textContent = `ID: ${pasteData.id}`;
        pasteDate.textContent = `Created: ${formatDate(new Date(pasteData.created))}`;
        pasteExpiration.textContent = `Expires: ${formatDate(pasteData.expires ? new Date(pasteData.expires) : null)}`;
        
        // Set raw link
        if (rawLinkView) {
            rawLinkView.href = `raw.html#${hash}`;
        }
        
        // Apply syntax highlighting
        Prism.highlightElement(codeDisplay);
    } catch (e) {
        codeDisplay.textContent = 'Error loading paste. Invalid URL.';
    }
}

// Function to load paste on raw page
function loadRawPaste() {
    const hash = window.location.hash.substring(1);
    
    if (!hash) {
        rawContent.textContent = 'No paste data found.';
        return;
    }
    
    try {
        const pasteData = JSON.parse(LZString.decompressFromEncodedURIComponent(hash));
        
        // Check if paste has expired
        if (pasteData.expires) {
            const expirationDate = new Date(pasteData.expires);
            if (new Date() > expirationDate) {
                rawContent.textContent = 'This paste has expired.';
                return;
            }
        }
        
        rawContent.textContent = pasteData.content;
    } catch (e) {
        rawContent.textContent = 'Error loading paste. Invalid URL.';
    }
}

// Event listeners for index.html
if (isIndexPage) {
    createPasteBtn.addEventListener('click', createPaste);
    
    copyUrlBtn.addEventListener('click', () => {
        copyToClipboard(pasteUrlInput.value);
    });
}

// Event listeners for view.html
if (isViewPage) {
    document.addEventListener('DOMContentLoaded', loadPaste);
    
    copyContentBtn.addEventListener('click', () => {
        copyToClipboard(codeDisplay.textContent);
    });
    
    newPasteBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
}

// Event listeners for raw.html
if (isRawPage) {
    document.addEventListener('DOMContentLoaded', loadRawPaste);
}
