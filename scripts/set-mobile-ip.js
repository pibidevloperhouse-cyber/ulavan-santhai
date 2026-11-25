const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIp() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    const lowerName = name.toLowerCase();
    const isVirtual =
      lowerName.includes('wsl') ||
      lowerName.includes('hyper-v') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('docker') ||
      lowerName.includes('virtual');

    for (const netInfo of nets[name]) {
      if (netInfo.family === 'IPv4' && !netInfo.internal) {
        candidates.push({
          address: netInfo.address,
          isVirtual,
          isLan: netInfo.address.startsWith('192.168.') || netInfo.address.startsWith('10.'),
        });
      }
    }
  }

  candidates.sort((a, b) => {
    if (a.isVirtual !== b.isVirtual) return a.isVirtual ? 1 : -1;
    if (a.isLan !== b.isLan) return a.isLan ? -1 : 1;
    return 0;
  });

  return candidates[0]?.address || '127.0.0.1';
}

const localIp = getLocalIp();
const port = '5000';

console.log(`\x1b[32m✔ Detected Local Host IP:\x1b[0m ${localIp}`);

// Update .env file (src/config/api.js reads directly from .env)
const envPath = path.resolve(process.cwd(), '.env');
const envContent = `# Ulavan Santhai Mobile - Backend API Configuration
EXPO_PUBLIC_API_URL=http://${localIp}:${port}
EXPO_PUBLIC_LAN_IP=${localIp}
EXPO_PUBLIC_BACKEND_PORT=${port}
`;
fs.writeFileSync(envPath, envContent, 'utf-8');
console.log(`\x1b[32m✔ Updated .env with:\x1b[0m http://${localIp}:${port}`);
