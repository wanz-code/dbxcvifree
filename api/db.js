// GitHub configuration
const GITHUB_TOKEN = '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';
const GITHUB_USERNAME = 'xcvisimilarity-latest';
const REPO_NAME = 'xcvidatabase';
const FILE_PATH = 'xcvifree.json';
const RAW_URL = 'https://raw.githubusercontent.com/xcvisimilarity-latest/xcvidatabase/refs/heads/main/xcvifree.json';
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = '8207201116:AAHyth3gbJInooesGUp3QoGvSlVVXYOy8Bg';
const TELEGRAM_CHAT_ID = '6716435472';

// DOM Elements
const usernameInput = document.getElementById('usernameInput');
const createAccountBtn = document.getElementById('createAccountBtn');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const accountModal = document.getElementById('accountModal');
const closeModal = document.getElementById('closeModal');
const accountInfo = document.getElementById('accountInfo');
const copyBtn = document.getElementById('copyBtn');
const downloadApkBtn = document.getElementById('downloadApk');

// Global state
let isCreatingAccount = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements if they exist
    if (createAccountBtn) createAccountBtn.addEventListener('click', createAccount);
    if (menuBtn) menuBtn.addEventListener('click', () => toggleSidebar(true));
    if (closeSidebar) closeSidebar.addEventListener('click', () => toggleSidebar(false));
    if (closeModal) closeModal.addEventListener('click', closeAccountModal);
    if (copyBtn) copyBtn.addEventListener('click', copyAccountInfo);
    if (downloadApkBtn) downloadApkBtn.addEventListener('click', downloadApk);
    
    // Close modal when clicking outside
    if (accountModal) {
        accountModal.addEventListener('click', function(e) {
            if (e.target === accountModal) {
                closeAccountModal();
            }
        });
    }
    
    // Input validation
    if (usernameInput) {
        usernameInput.addEventListener('input', function(e) {
            // Remove special characters and limit length
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30);
        });

        // Enter key to create account
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !isCreatingAccount) {
                createAccount();
            }
        });
    }

    // Close sidebar with overlay (if exists)
    document.addEventListener('click', function(e) {
        if (sidebar && sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            e.target !== menuBtn) {
            toggleSidebar(false);
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (accountModal && accountModal.classList.contains('active')) {
                closeAccountModal();
            }
            if (sidebar && sidebar.classList.contains('active')) {
                toggleSidebar(false);
            }
        }
    });

    // Focus username input
    setTimeout(() => {
        if (usernameInput) usernameInput.focus();
    }, 500);
});

// Toggle sidebar
function toggleSidebar(show) {
    if (!sidebar) return;
    
    if (show) {
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close account modal
function closeAccountModal() {
    if (!accountModal) return;
    
    accountModal.classList.remove('active');
    if (usernameInput) {
        usernameInput.value = '';
        setTimeout(() => usernameInput.focus(), 300);
    }
}

// Set button loading state
function setLoadingState(loading) {
    if (!createAccountBtn) return;
    
    const btnText = createAccountBtn.querySelector('.btn-text');
    
    if (loading) {
        createAccountBtn.classList.add('btn-loading');
        createAccountBtn.disabled = true;
        if (btnText) btnText.textContent = 'Membuat Akun...';
        isCreatingAccount = true;
    } else {
        createAccountBtn.classList.remove('btn-loading');
        createAccountBtn.disabled = false;
        if (btnText) btnText.textContent = 'BUAT AKUN PREMIUM';
        isCreatingAccount = false;
    }
}

// Generate random password
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = 'XCVI_';
    
    // Ensure password has at least 16 characters
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
}

// Generate expiration date (30-60 days from now)
function generateExpirationDate() {
    const now = Date.now();
    const minDays = 30;
    const maxDays = 60;
    const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    return now + (randomDays * 24 * 60 * 60 * 1000);
}

// Validate username
function validateUsername(username) {
    if (!username) {
        return 'Username tidak boleh kosong!';
    }
    
    if (username.length < 3) {
        return 'Username minimal 3 karakter!';
    }
    
    if (username.length > 30) {
        return 'Username maksimal 30 karakter!';
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return 'Username hanya boleh mengandung huruf, angka, underscore (_), dan dash (-)!';
    }
    
    return null;
}

// Check if username already exists
async function checkUsernameExists(username) {
    try {
        showAlert('🔍 Memeriksa ketersediaan username...', 'info', 2000);
        
        const response = await fetch(RAW_URL + '?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.some(account => account.username.toLowerCase() === username.toLowerCase());
    } catch (error) {
        console.error('Error checking username:', error);
        throw new Error('Gagal memeriksa ketersediaan username. Silakan coba lagi.');
    }
}

// Send Telegram notification
async function sendTelegramNotification(username, accountData) {
    const message = `🎉 *AKUN PREMIUM BARU DIBUAT!*\n\n👤 *Username:* ${username}\n🔑 *Password:* ${accountData.password}\n⭐ *Role:* ${accountData.role}\n📅 *Expired:* ${new Date(accountData.expired).toLocaleDateString('id-ID')}\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n🏢 *XCVI DATABASE ENTERPRISE* - Wanz Official`;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

// Update GitHub file
async function updateGitHubFile(newData) {
    try {
        showAlert('📡 Menyimpan data ke server...', 'info', 3000);
        
        // Get current file content and SHA
        const fileResponse = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        });
        
        if (!fileResponse.ok) {
            const errorData = await fileResponse.json().catch(() => ({}));
            throw new Error(`GitHub API error: ${fileResponse.status} - ${errorData.message || 'Unknown error'}`);
        }
        
        const fileData = await fileResponse.json();
        const sha = fileData.sha;
        
        // Convert data to JSON string with proper formatting
        const contentString = JSON.stringify(newData, null, 2);
        const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));
        
        // Update file
        const updateResponse = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `🎯 Add premium account: ${newData[newData.length - 1].username}`,
                content: contentBase64,
                sha: sha,
                committer: {
                    name: 'XCVI Database Enterprise',
                    email: 'enterprise@xcvidev.com'
                }
            })
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json().catch(() => ({}));
            throw new Error(`GitHub update error: ${updateResponse.status} - ${errorData.message || 'Unknown error'}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error updating GitHub file:', error);
        throw error;
    }
}

// Create account function
async function createAccount() {
    if (isCreatingAccount) return;
    
    const username = usernameInput ? usernameInput.value.trim() : '';
    
    // Validate username
    const validationError = validateUsername(username);
    if (validationError) {
        showAlert(validationError, 'error');
        if (usernameInput) usernameInput.focus();
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Check if username already exists
        const usernameExists = await checkUsernameExists(username);
        if (usernameExists) {
            showAlert('❌ Username sudah terdaftar! Silakan gunakan nama lain.', 'error');
            if (usernameInput) usernameInput.focus();
            return;
        }
        
        // Generate account data
        const password = generatePassword();
        const createdAt = Date.now();
        const expired = generateExpirationDate();
        
        const newAccount = {
            username: username,
            password: password,
            role: "premium",
            createdAt: createdAt,
            expired: expired,
            status: "active",
            plan: "enterprise"
        };
        
        // Get current data
        const response = await fetch(RAW_URL + '?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Gagal mengambil data saat ini dari database');
        }
        const currentData = await response.json();
        
        // Add new account
        currentData.push(newAccount);
        
        // Update GitHub file
        await updateGitHubFile(currentData);
        
        // Show success message and account info
        const accountData = `🎉 AKUN PREMIUM BERHASIL DIBUAT!\n\n👤 USERNAME: ${username}\n🔑 PASSWORD: ${password}\n⭐ ROLE: Premium Enterprise\n📅 DIBUAT: ${new Date(createdAt).toLocaleString('id-ID')}\n⏰ KADALUARSA: ${new Date(expired).toLocaleString('id-ID')}\n🔒 STATUS: Active\n📊 PLAN: Enterprise\n\n💡 *INFORMASI PENTING:*\n• Simpan data ini dengan aman\n• Data tidak dapat dipulihkan\n• Hubungi support untuk bantuan\n\n🏢 XCVI DATABASE ENTERPRISE\n📞 Support: @wanz_xcvi`;
        
        if (accountInfo) accountInfo.textContent = accountData;
        if (accountModal) accountModal.classList.add('active');
        
        // Send Telegram notification
        sendTelegramNotification(username, newAccount).then(success => {
            if (!success) {
                console.warn('Telegram notification failed');
            }
        });
        
        showAlert('✅ Akun premium berhasil dibuat!', 'success');
        
    } catch (error) {
        console.error('Error creating account:', error);
        showAlert('❌ ' + (error.message || 'Terjadi kesalahan. Silakan coba lagi.'), 'error');
    } finally {
        setLoadingState(false);
    }
}

// Copy account info to clipboard
async function copyAccountInfo() {
    if (!accountInfo) return;
    
    const textToCopy = accountInfo.textContent;
    const btnText = copyBtn.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : 'SALIN DATA AKUN';
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Visual feedback
        if (btnText) btnText.textContent = '✅ DATA DISALIN!';
        if (copyBtn) {
            copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            copyBtn.style.transform = 'scale(0.98)';
        }
        
        showAlert('✅ Data akun berhasil disalin!', 'success', 2000);
        
        setTimeout(() => {
            if (btnText) btnText.textContent = originalText;
            if (copyBtn) {
                copyBtn.style.background = '';
                copyBtn.style.transform = '';
            }
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            if (btnText) btnText.textContent = '✅ DATA DISALIN!';
            showAlert('✅ Data akun berhasil disalin!', 'success', 2000);
            setTimeout(() => {
                if (btnText) btnText.textContent = originalText;
            }, 2000);
        } catch (fallbackErr) {
            console.error('Fallback copy failed: ', fallbackErr);
            showAlert('❌ Gagal menyalin data. Silakan salin manual.', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Download APK function
function downloadApk(e) {
    if (e) e.preventDefault();
    
    showAlert('⬇️ Memulai download APK...', 'info', 2000);
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = './xcvifree.apk';
    link.download = 'XCVI_Database_Enterprise.apk';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Close sidebar
    toggleSidebar(false);
    
    // Show success message after a delay
    setTimeout(() => {
        showAlert('✅ Download APK berhasil dimulai!', 'success');
    }, 1000);
}

// Show alert function
function showAlert(message, type = 'info', duration = 4000) {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = message;
        alert.className = `alert ${type}`;
        
        // Force reflow
        alert.offsetHeight;
        
        alert.classList.add('show');
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, duration);
    } else {
        // Fallback if alert element doesn't exist
        console.log(`${type}: ${message}`);
    }
}

// Export functions for global access
window.toggleSidebar = toggleSidebar;
window.closeAccountModal = closeAccountModal;
window.createAccount = createAccount;
window.copyAccountInfo = copyAccountInfo;
window.downloadApk = downloadApk;
window.showAlert = showAlert;
