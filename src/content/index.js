console.log("IRCTC Tatkal Extension: Content script loaded");

// Auto-execute when page loads
(function() {
  'use strict';
  
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log("IRCTC page detected - Extension activated");
    
    // Show notification that extension is active
    showExtensionNotification();
    
    // Auto-fill functionality - customize based on your needs
    autoFillForm();
    
    // Auto-select Tatkal option
    autoSelectTatkal();
    
    // Monitor for form changes
    observeFormChanges();
    
    // Monitor for booking page
    if (window.location.href.includes('bookTicket') || window.location.href.includes('booking')) {
      setupBookingPageAutomation();
    }
  }
  
  function showExtensionNotification() {
    // Create a small notification banner
    const notification = document.createElement('div');
    notification.id = 'irctc-extension-notification';
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '🚂 IRCTC Tatkal Extension Active';
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Add CSS animations
    if (!document.getElementById('irctc-extension-styles')) {
      const style = document.createElement('style');
      style.id = 'irctc-extension-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  function autoFillForm() {
    // Example: Auto-fill login credentials (customize as needed)
    const usernameInput = document.querySelector('input[type="text"], input[name*="user"], input[id*="user"]');
    const passwordInput = document.querySelector('input[type="password"]');
    
    // You can get stored credentials from chrome.storage
    chrome.storage.sync.get(['irctcUsername', 'irctcPassword'], (data) => {
      if (data.irctcUsername && usernameInput) {
        usernameInput.value = data.irctcUsername;
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      if (data.irctcPassword && passwordInput) {
        passwordInput.value = data.irctcPassword;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Auto-select train booking options
    autoSelectBookingOptions();
  }
  
  function autoSelectTatkal() {
    // Try multiple selectors for Tatkal checkbox/radio
    const selectors = [
      'input[type="checkbox"][value*="tatkal" i]',
      'input[type="checkbox"][id*="tatkal" i]',
      'input[type="checkbox"][name*="tatkal" i]',
      'input[type="radio"][value*="tatkal" i]',
      'input[type="radio"][id*="tatkal" i]',
      'label:has-text("Tatkal") input',
      '[aria-label*="tatkal" i] input'
    ];
    
    for (const selector of selectors) {
      try {
        const tatkalElement = document.querySelector(selector);
        if (tatkalElement && !tatkalElement.checked) {
          tatkalElement.click();
          console.log("✅ Tatkal option auto-selected");
          return true;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Also try clicking on labels containing "Tatkal"
    const labels = Array.from(document.querySelectorAll('label'));
    for (const label of labels) {
      if (label.textContent.toLowerCase().includes('tatkal')) {
        const input = label.querySelector('input');
        if (input && !input.checked) {
          input.click();
          console.log("✅ Tatkal option auto-selected via label");
          return true;
        }
      }
    }
    
    return false;
  }
  
  function setupBookingPageAutomation() {
    console.log("Booking page detected - Setting up automation");
    
    // Auto-select Tatkal on booking page
    setTimeout(() => {
      autoSelectTatkal();
    }, 1000);
    
    // Monitor for "Book Now" or similar buttons
    const bookButtonObserver = new MutationObserver(() => {
      const bookButtons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
      bookButtons.forEach(btn => {
        const text = btn.textContent || btn.value || '';
        if (text.toLowerCase().includes('book') || text.toLowerCase().includes('continue')) {
          btn.style.border = '2px solid #4CAF50';
          btn.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        }
      });
    });
    
    bookButtonObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  function fillPassengerDetails() {
    // Look for passenger name fields
    const nameInputs = document.querySelectorAll('input[name*="name"], input[id*="name"], input[placeholder*="Name"]');
    chrome.storage.sync.get(['passengerName'], (data) => {
      if (data.passengerName && nameInputs.length > 0) {
        nameInputs[0].value = data.passengerName;
        nameInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        console.log("Passenger name auto-filled");
      }
    });
  }
  
  function observeFormChanges() {
    // Watch for dynamic content loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Re-run auto-fill when new elements are added
          setTimeout(() => {
            autoFillForm();
            autoSelectTatkal();
          }, 500);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "AUTO_FILL") {
      console.log("Auto-fill triggered manually");
      autoFillForm();
      sendResponse({ success: true });
    }
    
    if (msg.type === "FILL_PASSENGER") {
      fillPassengerDetails();
      sendResponse({ success: true });
    }
    
    return true; // Keep message channel open for async response
  });
  
  // Notify background script that content script is ready
  chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_READY", url: window.location.href });
})();
