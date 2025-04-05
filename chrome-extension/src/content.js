// Content script for NotedAI Chrome Extension
// This can be used to manipulate the page or handle tab-specific functionality

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle any content script specific actions here
  if (message.action === 'someContentAction') {
    // Perform action
    sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async response
});
