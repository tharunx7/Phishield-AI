document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');
    const threatsParam = urlParams.get('threats');
    
    if (!targetUrl) {
        document.getElementById('url-display').textContent = 'Unknown URL';
        return;
    }

    // Display the URL securely
    document.getElementById('url-display').textContent = targetUrl;

    // Display threats if provided
    if (threatsParam) {
        try {
            const threats = JSON.parse(decodeURIComponent(threatsParam));
            const threatList = document.getElementById('threat-list');
            
            if (threats && threats.length > 0) {
                threats.forEach(threat => {
                    const div = document.createElement('div');
                    div.className = 'threat-item';
                    div.innerHTML = `
                        <svg class="threat-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span style="font-size: 14px; color: #d1d5db;">${threat}</span>
                    `;
                    threatList.appendChild(div);
                });
            } else {
                document.getElementById('threat-list').innerHTML = '<span style="color:#d1d5db;font-size:14px;">High risk score based on AI heuristics.</span>';
            }
        } catch (e) {
            console.error('Failed to parse threats');
        }
    }

    // Toggle details
    document.getElementById('toggle-details').addEventListener('click', function() {
        const details = document.getElementById('threat-details');
        if (details.classList.contains('visible')) {
            details.classList.remove('visible');
            this.textContent = 'View Threat Details';
        } else {
            details.classList.add('visible');
            this.textContent = 'Hide Threat Details';
        }
    });

    // Go Back Action
    document.getElementById('btn-back').addEventListener('click', () => {
        if (window !== window.parent) {
            window.parent.postMessage({ action: 'phishshield_goback' }, '*');
        } else {
            if (window.history.length > 2) {
                // Go back 2 steps to skip the malicious URL in history
                window.history.go(-2);
            } else {
                // If not enough history (e.g. opened in a new tab), close the tab
                chrome.tabs.getCurrent((tab) => {
                    if (tab) {
                        chrome.tabs.remove(tab.id);
                    } else {
                        window.close();
                    }
                });
            }
        }
    });

    // Proceed Anyway Action
    document.getElementById('btn-proceed').addEventListener('click', () => {
        try {
            const urlObj = new URL(targetUrl);
            const domain = urlObj.hostname;
            
            // Add to session whitelist so we don't block it again immediately
            chrome.storage.local.get(['whitelist'], (res) => {
                const whitelist = res.whitelist || [];
                if (!whitelist.includes(domain)) {
                    whitelist.push(domain);
                }
                chrome.storage.local.set({ whitelist }, () => {
                    if (window !== window.parent) {
                        window.parent.postMessage({ action: 'phishshield_proceed' }, '*');
                    } else {
                        // Navigate to the target URL
                        window.location.replace(targetUrl);
                    }
                });
            });
        } catch (e) {
            if (window !== window.parent) {
                window.parent.postMessage({ action: 'phishshield_proceed' }, '*');
            } else {
                window.location.replace(targetUrl);
            }
        }
    });
});
