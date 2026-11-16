const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const netInfo of nets[name]) {
      if (netInfo.family === 'IPv4' && !netInfo.internal) {
        return netInfo.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();
const port = '5000';

console.log(`\x1b[32m✔ Detected Local Host IP:\x1b[0m ${localIp}`);

// 1. Update .env file
const envPath = path.resolve(process.cwd(), '.env');
const envContent = `# Ulavan Santhai Mobile - Dynamic Backend Connection
BACKEND_URL=http://${localIp}:${port}
EXPO_PUBLIC_API_URL=http://${localIp}:${port}
`;
fs.writeFileSync(envPath, envContent, 'utf-8');
console.log(`\x1b[32m✔ Updated .env with:\x1b[0m http://${localIp}:${port}`);

// 2. Update src/config/api.js default IP
const apiConfigPath = path.resolve(process.cwd(), 'src', 'config', 'api.js');
if (fs.existsSync(apiConfigPath)) {
  let content = fs.readFileSync(apiConfigPath, 'utf-8');
  content = content.replace(
    /const DEFAULT_LAN_IP = ['"][^'"]+['"];/,
    `const DEFAULT_LAN_IP = '${localIp}';`
  );
  fs.writeFileSync(apiConfigPath, content, 'utf-8');
  console.log(`\x1b[32m✔ Updated src/config/api.js with default IP:\x1b[0m ${localIp}`);
}
