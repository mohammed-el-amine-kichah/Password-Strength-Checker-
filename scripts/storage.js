// Initialize storage with empty whitelist if it doesn't exist
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['whitelist'], (result) => {
      if (!result.whitelist) {
        chrome.storage.sync.set({ whitelist: [] });
      }
    });
  });
  

  function isInWhitelist(domain, callback) {
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      callback(whitelist.includes(domain));
    });
  }
  
  
  function addToWhitelist(domain, callback) {
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      if (!whitelist.includes(domain)) {
        whitelist.push(domain);
        chrome.storage.sync.set({ whitelist }, () => {
          if (callback) callback(true);
        });
      } else {
        if (callback) callback(false);
      }
    });
  }
  
 
  function removeFromWhitelist(domain, callback) {
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      const index = whitelist.indexOf(domain);
      if (index > -1) {
        whitelist.splice(index, 1);
        chrome.storage.sync.set({ whitelist }, () => {
          if (callback) callback(true);
        });
      } else {
        if (callback) callback(false);
      }
    });
  }
  
  function getWhitelist(callback) {
    chrome.storage.sync.get(['whitelist'], (result) => {
      callback(result.whitelist || []);
    });
  }