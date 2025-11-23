const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Paths to certificate files
const certPath = path.join(__dirname, 'localhost-cert.pem');
const keyPath = path.join(__dirname, 'localhost-key.pem');

// Check if certificates exist
const certExists = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (!certExists) {
  console.log('\n⚠️  SSL certificates not found!');
  console.log('📝 Generating self-signed certificates...\n');
  
  // Generate self-signed certificate
  const { execSync } = require('child_process');
  try {
    execSync(
      `openssl req -x509 -newkey rsa:2048 -nodes -keyout ${keyPath} -out ${certPath} -days 365 -subj "/CN=localhost"`,
      { stdio: 'inherit' }
    );
    console.log('✅ Certificates generated!\n');
  } catch (error) {
    console.error('❌ Failed to generate certificates. Make sure OpenSSL is installed.');
    console.error('   On macOS: OpenSSL comes pre-installed');
    console.error('   On Linux: sudo apt-get install openssl');
    console.error('   On Windows: Install OpenSSL or use Git Bash\n');
    process.exit(1);
  }
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`\n🚀 Ready on https://${hostname}:${port}\n`);
    console.log('⚠️  You may see a security warning in your browser.');
    console.log('   This is normal for self-signed certificates.');
    console.log('   Click "Advanced" → "Proceed to localhost" to continue.\n');
  });
});

