document.addEventListener('DOMContentLoaded', () => {

  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  const generateBtn = document.getElementById('generate-btn');
  const passwordField = document.getElementById('generated-password');
  const strengthDisplay = document.getElementById('password-strength');
  const passwordLengthSlider = document.getElementById('password-length');
  const lengthValue = document.getElementById('length-value');
  
  const whitelistBtn = document.getElementById('whitelist-btn');
  const currentWebsiteSpan = document.getElementById('current-website');
  const whitelistItemsContainer = document.getElementById('whitelist-items');
  
  // Tab navigation functionality
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');
      
      // If whitelist tab is selected, refresh the whitelist
      if (button.getAttribute('data-tab') === 'whitelist') {
        loadWhitelist();
      }
    });
  });
  
  // Update password length display when slider changes
  passwordLengthSlider.addEventListener('input', () => {
    lengthValue.textContent = passwordLengthSlider.value;
  });
  
  // Get current tab URL and update display
  function getCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        currentWebsiteSpan.textContent = domain || 'Not available';
        
        // Check if domain is already in whitelist and update button text
        chrome.storage.sync.get(['whitelist'], (result) => {
          const whitelist = result.whitelist || [];
          if (whitelist.includes(domain)) {
            whitelistBtn.textContent = 'Remove from Whitelist';
            whitelistBtn.classList.add('remove');
          } else {
            whitelistBtn.textContent = 'Add to Whitelist';
            whitelistBtn.classList.remove('remove');
          }
        });
      }
    });
  }
  
  // Load whitelist from storage and display in the UI
  function loadWhitelist() {
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      whitelistItemsContainer.innerHTML = '';
      
      if (whitelist.length === 0) {
        whitelistItemsContainer.innerHTML = '<div class="empty-list-message">No websites in whitelist yet.</div>';
        return;
      }
      
      whitelist.forEach(domain => {
        const itemElement = document.createElement('div');
        itemElement.className = 'whitelist-item';
        
        const domainText = document.createElement('span');
        domainText.className = 'domain-text';
        domainText.textContent = domain;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-btn';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeFromWhitelist(domain));
        
        itemElement.appendChild(domainText);
        itemElement.appendChild(removeButton);
        whitelistItemsContainer.appendChild(itemElement);
      });
    });
  }
  
  // Remove a domain from the whitelist
  function removeFromWhitelist(domain) {
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      const updatedWhitelist = whitelist.filter(item => item !== domain);
      
      chrome.storage.sync.set({ whitelist: updatedWhitelist }, () => {
        loadWhitelist();
        
        // If the current website is the one being removed, update the add/remove button
        if (currentWebsiteSpan.textContent === domain) {
          whitelistBtn.textContent = 'Add to Whitelist';
          whitelistBtn.classList.remove('remove');
        }
      });
    });
  }
  
  // Try to get current tab URL on popup load
  getCurrentTabUrl();
  
  // Load initial whitelist
  loadWhitelist();
  
  function generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // Evaluate password strength using zxcvbn
  function evaluatePassword(password) {
    const result = zxcvbn(password);
    const score = result.score; // 0-4 scale
    let strengthText, strengthColor;

    switch (score) {
      case 0:
      case 1:
        strengthText = 'Weak';
        strengthColor = 'red';
        break;
      case 2:
      case 3:
        strengthText = 'Medium';
        strengthColor = 'orange';
        break;
      case 4:
        strengthText = 'Strong';
        strengthColor = 'green';
        break;
      default:
        strengthText = 'Unknown';
        strengthColor = 'gray';
    }

    return { strengthText, strengthColor };
  }

  // Event listener for the Generate Password button
  generateBtn.addEventListener('click', () => {
    // Get the password length from the slider
    const passwordLength = parseInt(passwordLengthSlider.value);
    const newPassword = generatePassword(passwordLength);
    passwordField.value = newPassword;

    // Evaluate the generated password
    const { strengthText, strengthColor } = evaluatePassword(newPassword);
    strengthDisplay.textContent = `Strength: ${strengthText}`;
    strengthDisplay.style.color = strengthColor;
  });

  // Allow copying the generated password by clicking the input field
  passwordField.addEventListener('click', () => {
    passwordField.select();
    navigator.clipboard.writeText(passwordField.value)
      .then(() => {
        alert('Password copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy password:', err);
      });
  });
  
  // Event listener for the Add/Remove from Whitelist button
  whitelistBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        
        // Get existing whitelist from storage
        chrome.storage.sync.get(['whitelist'], (result) => {
          const whitelist = result.whitelist || [];
          const domainIndex = whitelist.indexOf(domain);
          
          if (domainIndex === -1) {
            // Add domain to whitelist
            whitelist.push(domain);
            whitelistBtn.textContent = 'Remove from Whitelist';
            whitelistBtn.classList.add('remove');
            alert(`Added ${domain} to whitelist!`);
          } else {
            // Remove domain from whitelist
            whitelist.splice(domainIndex, 1);
            whitelistBtn.textContent = 'Add to Whitelist';
            whitelistBtn.classList.remove('remove');
            alert(`Removed ${domain} from whitelist.`);
          }
          
          // Save updated whitelist
          chrome.storage.sync.set({ whitelist }, () => {
            // Refresh whitelist display if on whitelist tab
            if (document.querySelector('.tab-button[data-tab="whitelist"]').classList.contains('active')) {
              loadWhitelist();
            }
          });
        });
      }
    });
  });
});