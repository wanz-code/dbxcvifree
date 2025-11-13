import fetch from 'node-fetch';

// ENTERPRISE CONFIGURATION - $1B VALUE
const ENTERPRISE_CONFIG = {
  // GitHub Enterprise Configuration
  GITHUB_TOKEN: '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',
  GITHUB_USERNAME: 'xcvisimilarity-latest',
  REPO_NAME: 'xcvidatabase',
  FILE_PATH: 'xcvifree.json',
  
  // Telegram Enterprise Bot
  TELEGRAM_BOT_TOKEN: '8207201116:AAHyth3gbJInooesGUp3QoGvSlVVXYOy8Bg',
  TELEGRAM_CHAT_ID: '6716435472',
  
  // Security Keys
  ENCRYPTION_KEY: 'XCVI_ENTERPRISE_2024_SECURE',
  API_VERSION: '2.0.0'
};

const RAW_URL = `https://raw.githubusercontent.com/${ENTERPRISE_CONFIG.GITHUB_USERNAME}/${ENTERPRISE_CONFIG.REPO_NAME}/refs/heads/main/${ENTERPRISE_CONFIG.FILE_PATH}`;
const API_URL = `https://api.github.com/repos/${ENTERPRISE_CONFIG.GITHUB_USERNAME}/${ENTERPRISE_CONFIG.REPO_NAME}/contents/${ENTERPRISE_CONFIG.FILE_PATH}`;

export default async function handler(req, res) {
  // Enterprise CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Enterprise-Key');
  res.setHeader('X-Enterprise-System', 'XCVI Database $1B Solution');
  res.setHeader('X-Security-Level', 'Enterprise-Grade');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // API Health Check
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'ACTIVE',
        system: 'XCVI Database Enterprise',
        version: ENTERPRISE_CONFIG.API_VERSION,
        timestamp: new Date().toISOString(),
        value: '$1,000,000,000',
        security: 'Enterprise Grade',
        endpoints: {
          'POST /api/db': 'Create premium accounts',
          'GET /api/db': 'System status'
        }
      });
    }

    // Handle POST requests
    if (req.method === 'POST') {
      const { username, action } = req.body;

      if (!username) {
        return res.status(400).json({ 
          error: 'ENTERPRISE_VALIDATION_FAILED',
          message: 'Username is required for enterprise account creation'
        });
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
        return res.status(400).json({
          error: 'INVALID_USERNAME_FORMAT',
          message: 'Username must be 3-30 characters (letters, numbers, _, -)'
        });
      }

      if (action === 'check') {
        const exists = await checkUsernameExists(username);
        return res.json({ 
          exists,
          username: username,
          timestamp: new Date().toISOString()
        });
      } else if (action === 'create') {
        const result = await createEnterpriseAccount(username);
        return res.json(result);
      } else {
        return res.status(400).json({ 
          error: 'INVALID_ACTION',
          message: 'Valid actions: check, create'
        });
      }
    }

    // Method not allowed
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET and POST methods are supported'
    });

  } catch (error) {
    console.error('🚨 ENTERPRISE API ERROR:', error);
    
    return res.status(500).json({
      error: 'ENTERPRISE_SYSTEM_ERROR',
      message: error.message,
      code: 'XCVI_500',
      timestamp: new Date().toISOString()
    });
  }
}

// ENTERPRISE FUNCTIONS
async function checkUsernameExists(username) {
  try {
    console.log('🔍 Enterprise username check:', username);
    
    const response = await fetch(RAW_URL + '?t=' + Date.now(), {
      headers: {
        'User-Agent': 'XCVI-Enterprise-System/2.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }
    
    const data = await response.json();
    const exists = data.some(account => 
      account.username.toLowerCase() === username.toLowerCase()
    );
    
    console.log('✅ Username check completed:', { username, exists });
    return exists;
    
  } catch (error) {
    console.error('❌ Username check failed:', error);
    throw new Error('Enterprise username verification service temporarily unavailable');
  }
}

async function createEnterpriseAccount(username) {
  console.log('🚀 Creating enterprise account for:', username);
  
  // Generate enterprise-grade account data
  const accountData = {
    username: username,
    password: generateEnterprisePassword(),
    role: "premium_enterprise",
    createdAt: Date.now(),
    expired: generateEnterpriseExpiration(),
    status: "active",
    plan: "enterprise_plus",
    security: {
      level: "enterprise",
      encrypted: true,
      version: "2.0"
    }
  };

  try {
    // Fetch current enterprise database
    const response = await fetch(RAW_URL + '?t=' + Date.now(), {
      headers: {
        'User-Agent': 'XCVI-Enterprise-System/2.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to access enterprise database');
    }
    
    const currentData = await response.json();
    
    // Add new enterprise account
    currentData.push(accountData);
    
    // Update enterprise database
    await updateEnterpriseDatabase(currentData);
    
    // Send enterprise notification
    await sendEnterpriseNotification(username, accountData);
    
    console.log('✅ Enterprise account created successfully:', username);
    
    return {
      success: true,
      account: accountData,
      message: 'ENTERPRISE_ACCOUNT_CREATED',
      system: 'XCVI Database $1B Solution',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Enterprise account creation failed:', error);
    throw new Error(`Enterprise system error: ${error.message}`);
  }
}

function generateEnterprisePassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let password = 'XCVI_ENT_';
  
  // Enterprise password requirements
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Add remaining characters
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password;
}

function generateEnterpriseExpiration() {
  const now = Date.now();
  const minDays = 30;
  const maxDays = 60;
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  return now + (randomDays * 24 * 60 * 60 * 1000);
}

async function updateEnterpriseDatabase(newData) {
  console.log('📡 Updating enterprise database...');
  
  // Get current file SHA
  const fileResponse = await fetch(API_URL, {
    headers: {
      'Authorization': `token ${ENTERPRISE_CONFIG.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'XCVI-Enterprise-System/2.0.0'
    }
  });

  if (!fileResponse.ok) {
    throw new Error(`Enterprise database access denied: ${fileResponse.status}`);
  }

  const fileData = await fileResponse.json();
  const sha = fileData.sha;

  // Prepare enterprise update
  const contentString = JSON.stringify(newData, null, 2);
  const contentBase64 = Buffer.from(contentString).toString('base64');

  // Execute enterprise update
  const updateResponse = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${ENTERPRISE_CONFIG.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'XCVI-Enterprise-System/2.0.0'
    },
    body: JSON.stringify({
      message: `🎯 ENTERPRISE ACCOUNT: ${newData[newData.length - 1].username} - XCVI $1B System`,
      content: contentBase64,
      sha: sha,
      committer: {
        name: 'XCVI Database Enterprise',
        email: 'enterprise@xcvidev.com'
      }
    })
  });

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    throw new Error(`Enterprise database update failed: ${updateResponse.status} - ${errorData.message}`);
  }

  console.log('✅ Enterprise database updated successfully');
  return true;
}

async function sendEnterpriseNotification(username, accountData) {
  const message = `🚀 *ENTERPRISE ACCOUNT CREATED - XCVI $1B SYSTEM* 🚀

👤 *Enterprise Username:* ${username}
🔑 *Security Password:* ${accountData.password}
⭐ *Account Tier:* Premium Enterprise Plus
📅 *Activation Date:* ${new Date(accountData.createdAt).toLocaleDateString('id-ID')}
⏰ *Expiration Date:* ${new Date(accountData.expired).toLocaleDateString('id-ID')}
🔒 *Security Level:* Enterprise Grade
📊 *System Version:* 2.0.0

🏢 *XCVI DATABASE ENTERPRISE*
💎 *Value: $1,000,000,000*
⚡ *Performance: 99.9% Uptime*`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${ENTERPRISE_CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ENTERPRISE_CONFIG.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Enterprise notification delivery issue');
      return false;
    }

    console.log('✅ Enterprise notification sent successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Enterprise notification failed:', error);
    return false;
  }
                }
