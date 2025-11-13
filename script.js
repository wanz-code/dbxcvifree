// Client-side JavaScript
const API_URL = '/api/db';

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
    if (createAccountBtn) createAccountBtn.addEventListener('click', createAccount);
    if (menuBtn) menuBtn.addEventListener('click', () => toggleSidebar(true));
    if (closeSidebar) closeSidebar.addEventListener('click', () => toggleSidebar(false));
    if (closeModal) closeModal.addEventListener('click', closeAccountModal);
    if (copyBtn) copyBtn.addEventListener('click', copyAccountInfo);
    if (downloadApkBtn) downloadApkBtn.addEventListener('click', downloadApk);
    
    if (accountModal) {
        accountModal.addEventListener('click', function(e) {
            if (e.target === accountModal) closeAccountModal();
        });
    }
    
    if (usernameInput) {
        usernameInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30);
        });

        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !isCreatingAccount) createAccount();
        });
    }

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

// Validate username
function validateUsername(username) {
    if (!username) return 'Username tidak boleh kosong!';
    if (username.length < 3) return 'Username minimal 3 karakter!';
    if (username.length > 30) return 'Username maksimal 30 karakter!';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username hanya boleh mengandung huruf, angka, underscore (_), dan dash (-)!';
    return null;
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
        // Check username availability via API
        showAlert('🔍 Memeriksa ketersediaan username...', 'info', 2000);
        
        const checkResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, action: 'check' })
        });

        if (!checkResponse.ok) throw new Error('Failed to check username');
        
        const checkResult = await checkResponse.json();
        
        if (checkResult.exists) {
            showAlert('❌ Username sudah terdaftar! Silakan gunakan nama lain.', 'error');
            if (usernameInput) usernameInput.focus();
            return;
        }

        // Create account via API
        showAlert('📡 Membuat akun premium...', 'info', 3000);
        
        const createResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, action: 'create' })
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.error || 'Failed to create account');
        }
        
        const result = await createResponse.json();
        
        if (result.success) {
            // Show success message and account info
            const accountData = `🎉 AKUN PREMIUM BERHASIL DIBUAT!\n\n👤 USERNAME: ${username}\n🔑 PASSWORD: ${result.account.password}\n⭐ ROLE: Premium Enterprise\n📅 DIBUAT: ${new Date(result.account.createdAt).toLocaleString('id-ID')}\n⏰ KADALUARSA: ${new Date(result.account.expired).toLocaleString('id-ID')}\n🔒 STATUS: Active\n📊 PLAN: Enterprise\n\n💡 *INFORMASI PENTING:*\n• Simpan data ini dengan aman\n• Data tidak dapat dipulihkan\n• Hubungi support untuk bantuan\n\n🏢 XCVI DATABASE ENTERPRISE\n📞 Support: @wanz_xcvi`;
            
            if (accountInfo) accountInfo.textContent = accountData;
            if (accountModal) accountModal.classList.add('active');
            
            showAlert('✅ Akun premium berhasil dibuat!', 'success');
        } else {
            throw new Error(result.error || 'Failed to create account');
        }
        
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
        }
        
        showAlert('✅ Data akun berhasil disalin!', 'success', 2000);
        
        setTimeout(() => {
            if (btnText) btnText.textContent = originalText;
            if (copyBtn) copyBtn.style.background = '';
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        showAlert('❌ Gagal menyalin data. Silakan salin manual.', 'error');
    }
}

// Download APK function
function downloadApk(e) {
    if (e) e.preventDefault();
    
    showAlert('⬇️ Memulai download APK...', 'info', 2000);
    
    const link = document.createElement('a');
    link.href = './xcvifree.apk';
    link.download = 'XCVI_Database_Enterprise.apk';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toggleSidebar(false);
    
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
        alert.offsetHeight; // Force reflow
        alert.classList.add('show');
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, duration);
    } else {
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