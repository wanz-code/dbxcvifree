const fetch = require('node-fetch');

// Configuration - SIMPAN DI SINI
const CONFIG = {
  GITHUB_TOKEN: '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',
  GITHUB_USERNAME: 'xcvisimilarity-latest',
  REPO_NAME: 'xcvidatabase',
  FILE_PATH: 'xcvifree.json',
  TELEGRAM_BOT_TOKEN: '8207201116:AAHyth3gbJInooesGUp3QoGvSlVVXYOy8Bg',
  TELEGRAM_CHAT_ID: '6716435472'
};

const RAW_URL = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.REPO_NAME}/refs/heads/main/${CONFIG.FILE_PATH}`;
const API_URL = `https://api.github.com/repos/${CONFIG.GITHUB_USERNAME}/${CONFIG.REPO_NAME}/contents/${CONFIG.FILE_PATH}`;

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { username, action } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      if (action === 'check') {
        // Check username availability
        const exists = await checkUsernameExists(username);
        return res.json({ exists });
      } else if (action === 'create') {
        // Create new account
        const result = await createAccount(username);
        return res.json(result);
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  // GET method - return service status
  return res.json({ 
    status: 'active',
    service: 'XCVI Database API',
    timestamp: new Date().toISOString()
  });
};

// Helper functions
async function checkUsernameExists(username) {
  try {
    const response = await fetch(RAW_URL + '?t=' + Date.now());
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data.some(account => account.username.toLowerCase() === username.toLowerCase());
  } catch (error) {
    throw new Error('Failed to check username availability');
  }
}

async function createAccount(username) {
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

  try {
    // Get current data
    const response = await fetch(RAW_URL + '?t=' + Date.now());
    if (!response.ok) throw new Error('Failed to fetch current data');
    const currentData = await response.json();

    // Add new account
    currentData.push(newAccount);

    // Update GitHub file
    await updateGitHubFile(currentData);

    // Send Telegram notification
    await sendTelegramNotification(username, newAccount);

    return {
      success: true,
      account: newAccount,
      message: 'Account created successfully'
    };

  } catch (error) {
    throw new Error('Failed to create account: ' + error.message);
  }
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = 'XCVI_';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateExpirationDate() {
  const now = Date.now();
  const minDays = 30;
  const maxDays = 60;
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  return now + (randomDays * 24 * 60 * 60 * 1000);
}

async function updateGitHubFile(newData) {
  // Get current file content and SHA
  const fileResponse = await fetch(API_URL, {
    headers: {
      'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!fileResponse.ok) {
    const errorData = await fileResponse.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${fileResponse.status}`);
  }

  const fileData = await fileResponse.json();
  const sha = fileData.sha;

  // Convert data to JSON string with proper formatting
  const contentString = JSON.stringify(newData, null, 2);
  const contentBase64 = Buffer.from(contentString).toString('base64');

  // Update file
  const updateResponse = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `🎯 Add premium account: ${newData[newData.length - 1].username}`,
      content: contentBase64,
      sha: sha,
      committer: {
        name: 'XCVI Database Enterprise',
        email: 'xcvispport@gmail.com'
      }
    })
  });

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json().catch(() => ({}));
    throw new Error(`GitHub update error: ${updateResponse.status}`);
  }

  return true;
}

async function sendTelegramNotification(username, accountData) {
  const message = `🎉 *AKUN PREMIUM BARU DIBUAT!*\n\n👤 *Username:* ${username}\n🔑 *Password:* ${accountData.password}\n⭐ *Role:* ${accountData.role}\n📅 *Expired:* ${new Date(accountData.expired).toLocaleDateString('id-ID')}\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n🏢 *XCVI DATABASE* - Wanz Official`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CONFIG.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Telegram notification failed:', error);
    return false;
  }
}
