#!/usr/bin/env node
/**
 * Test Runner Script for IPL Auction System
 * 
 * This script provides an interactive way to run Playwright tests
 * with proper server management and environment checks.
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.servers = [];
    this.isSetupComplete = false;
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if Playwright is installed
    try {
      await this.execAsync('npx playwright --version');
      console.log('✅ Playwright is installed');
    } catch (error) {
      console.error('❌ Playwright not found. Run: npm install');
      process.exit(1);
    }

    // Check if MongoDB is running
    try {
      const response = await fetch('http://localhost:27017');
      console.log('✅ MongoDB connection available');
    } catch (error) {
      console.log('⚠️  MongoDB connection failed - tests may fail');
    }

    // Check if test directories exist
    const requiredDirs = [
      'tests',
      'tests/helpers',
      'tests/screenshots'
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        console.log(`📁 Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    console.log('✅ Prerequisites check complete\n');
  }

  async checkServer(port, name) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok || response.status === 404) {
        console.log(`✅ ${name} server running on port ${port}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ ${name} server not running on port ${port}`);
      return false;
    }
  }

  async checkAllServers() {
    console.log('🌐 Checking required servers...');
    
    const servers = [
      { port: 3000, name: 'Express API', required: true },
      { port: 8000, name: 'Frontend', required: true },
      { port: 5000, name: 'Flask API', required: false }
    ];

    let allRequired = true;
    
    for (const server of servers) {
      const isRunning = await this.checkServer(server.port, server.name);
      if (!isRunning && server.required) {
        allRequired = false;
        console.log(`❗ Required server ${server.name} is not running`);
        console.log(`   Start it with: ${this.getStartCommand(server.name)}`);
      }
    }

    if (!allRequired) {
      console.log('\n❌ Required servers are not running. Please start them before running tests.');
      console.log('\n📝 Quick start commands:');
      console.log('   Express API: npm start');
      console.log('   Frontend: cd frontend && npm start');
      console.log('   Flask API: python api/app.py (optional)');
      process.exit(1);
    }

    console.log('✅ All required servers are running\n');
  }

  getStartCommand(serverName) {
    const commands = {
      'Express API': 'npm start',
      'Frontend': 'cd frontend && npm start',
      'Flask API': 'python api/app.py'
    };
    return commands[serverName] || 'Unknown';
  }

  async execAsync(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async runTests(testType = 'all', options = {}) {
    const testCommands = {
      all: 'playwright test',
      auth: 'playwright test tests/auth.spec.ts',
      dashboard: 'playwright test tests/dashboard.spec.ts',
      room: 'playwright test tests/room.spec.ts',
      team: 'playwright test tests/team.spec.ts',
      leaderboard: 'playwright test tests/leaderboard.spec.ts',
      e2e: 'playwright test tests/e2e-integration.spec.ts'
    };

    let command = testCommands[testType];
    if (!command) {
      console.error(`❌ Unknown test type: ${testType}`);
      console.log('Available types: ' + Object.keys(testCommands).join(', '));
      process.exit(1);
    }

    // Add options
    if (options.headed) command += ' --headed';
    if (options.debug) command += ' --debug';
    if (options.ui) command += ' --ui';
    if (options.workers) command += ` --workers=${options.workers}`;

    console.log(`🚀 Running tests: ${command}`);
    console.log('⏱️  This may take a few minutes...\n');

    try {
      const { stdout, stderr } = await this.execAsync(`npx ${command}`);
      console.log(stdout);
      if (stderr) console.warn(stderr);
      console.log('\n✅ Tests completed!');
    } catch (error) {
      console.error('\n❌ Tests failed:');
      console.error(error.message);
      console.log('\n📊 View detailed report with: npm run test:report');
      process.exit(1);
    }
  }

  printUsage() {
    console.log('🏏 IPL Auction System - Test Runner\n');
    console.log('Usage: node run-tests.js [testType] [options]\n');
    console.log('Test Types:');
    console.log('  all         - Run all tests (default)');
    console.log('  auth        - Authentication tests only');
    console.log('  dashboard   - Dashboard tests only');
    console.log('  room        - Room management tests only');
    console.log('  team        - Team management tests only');
    console.log('  leaderboard - Leaderboard tests only');
    console.log('  e2e         - End-to-end integration tests only\n');
    console.log('Options:');
    console.log('  --headed    - Run with browser UI visible');
    console.log('  --debug     - Run with debugging enabled');
    console.log('  --ui        - Run with Playwright UI');
    console.log('  --workers=N - Set number of parallel workers\n');
    console.log('Examples:');
    console.log('  node run-tests.js');
    console.log('  node run-tests.js auth --headed');
    console.log('  node run-tests.js e2e --debug');
    console.log('  node run-tests.js all --workers=1\n');
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      this.printUsage();
      return;
    }

    // Parse arguments
    const testType = args[0] && !args[0].startsWith('--') ? args[0] : 'all';
    const options = {
      headed: args.includes('--headed'),
      debug: args.includes('--debug'),
      ui: args.includes('--ui'),
      workers: args.find(arg => arg.startsWith('--workers='))?.split('=')[1]
    };

    try {
      await this.checkPrerequisites();
      await this.checkAllServers();
      await this.runTests(testType, options);
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }
}

// Self-executing function to add fetch polyfill for Node.js versions < 18
(async () => {
  // Simple fetch polyfill for older Node.js versions
  if (!global.fetch) {
    const http = require('http');
    global.fetch = (url) => {
      return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const req = http.request({
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname,
          method: 'GET'
        }, (res) => {
          resolve({ 
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode
          });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => reject(new Error('Timeout')));
        req.end();
      });
    };
  }

  const runner = new TestRunner();
  await runner.run();
})();
#!/usr/bin/env node
/**
 * Test Runner Script for IPL Auction System
 * 
 * This script provides an interactive way to run Playwright tests
 * with proper server management and environment checks.
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.servers = [];
    this.isSetupComplete = false;
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if Playwright is installed
    try {
      await this.execAsync('npx playwright --version');
      console.log('✅ Playwright is installed');
    } catch (error) {
      console.error('❌ Playwright not found. Run: npm install');
      process.exit(1);
    }

    // Check if MongoDB is running
    try {
      const response = await fetch('http://localhost:27017');
      console.log('✅ MongoDB connection available');
    } catch (error) {
      console.log('⚠️  MongoDB connection failed - tests may fail');
    }

    // Check if test directories exist
    const requiredDirs = [
      'tests',
      'tests/helpers',
      'tests/screenshots'
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        console.log(`📁 Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    console.log('✅ Prerequisites check complete\n');
  }

  async checkServer(port, name) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok || response.status === 404) {
        console.log(`✅ ${name} server running on port ${port}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ ${name} server not running on port ${port}`);
      return false;
    }
  }

  async checkAllServers() {
    console.log('🌐 Checking required servers...');
    
    const servers = [
      { port: 3000, name: 'Express API', required: true },
      { port: 8000, name: 'Frontend', required: true },
      { port: 5000, name: 'Flask API', required: false }
    ];

    let allRequired = true;
    
    for (const server of servers) {
      const isRunning = await this.checkServer(server.port, server.name);
      if (!isRunning && server.required) {
        allRequired = false;
        console.log(`❗ Required server ${server.name} is not running`);
        console.log(`   Start it with: ${this.getStartCommand(server.name)}`);
      }
    }

    if (!allRequired) {
      console.log('\n❌ Required servers are not running. Please start them before running tests.');
      console.log('\n📝 Quick start commands:');
      console.log('   Express API: npm start');
      console.log('   Frontend: cd frontend && npm start');
      console.log('   Flask API: python api/app.py (optional)');
      process.exit(1);
    }

    console.log('✅ All required servers are running\n');
  }

  getStartCommand(serverName) {
    const commands = {
      'Express API': 'npm start',
      'Frontend': 'cd frontend && npm start',
      'Flask API': 'python api/app.py'
    };
    return commands[serverName] || 'Unknown';
  }

  async execAsync(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async runTests(testType = 'all', options = {}) {
    const testCommands = {
      all: 'playwright test',
      auth: 'playwright test tests/auth.spec.ts',
      dashboard: 'playwright test tests/dashboard.spec.ts',
      room: 'playwright test tests/room.spec.ts',
      team: 'playwright test tests/team.spec.ts',
      leaderboard: 'playwright test tests/leaderboard.spec.ts',
      e2e: 'playwright test tests/e2e-integration.spec.ts'
    };

    let command = testCommands[testType];
    if (!command) {
      console.error(`❌ Unknown test type: ${testType}`);
      console.log('Available types: ' + Object.keys(testCommands).join(', '));
      process.exit(1);
    }

    // Add options
    if (options.headed) command += ' --headed';
    if (options.debug) command += ' --debug';
    if (options.ui) command += ' --ui';
    if (options.workers) command += ` --workers=${options.workers}`;

    console.log(`🚀 Running tests: ${command}`);
    console.log('⏱️  This may take a few minutes...\n');

    try {
      const { stdout, stderr } = await this.execAsync(`npx ${command}`);
      console.log(stdout);
      if (stderr) console.warn(stderr);
      console.log('\n✅ Tests completed!');
    } catch (error) {
      console.error('\n❌ Tests failed:');
      console.error(error.message);
      console.log('\n📊 View detailed report with: npm run test:report');
      process.exit(1);
    }
  }

  printUsage() {
    console.log('🏏 IPL Auction System - Test Runner\n');
    console.log('Usage: node run-tests.js [testType] [options]\n');
    console.log('Test Types:');
    console.log('  all         - Run all tests (default)');
    console.log('  auth        - Authentication tests only');
    console.log('  dashboard   - Dashboard tests only');
    console.log('  room        - Room management tests only');
    console.log('  team        - Team management tests only');
    console.log('  leaderboard - Leaderboard tests only');
    console.log('  e2e         - End-to-end integration tests only\n');
    console.log('Options:');
    console.log('  --headed    - Run with browser UI visible');
    console.log('  --debug     - Run with debugging enabled');
    console.log('  --ui        - Run with Playwright UI');
    console.log('  --workers=N - Set number of parallel workers\n');
    console.log('Examples:');
    console.log('  node run-tests.js');
    console.log('  node run-tests.js auth --headed');
    console.log('  node run-tests.js e2e --debug');
    console.log('  node run-tests.js all --workers=1\n');
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      this.printUsage();
      return;
    }

    // Parse arguments
    const testType = args[0] && !args[0].startsWith('--') ? args[0] : 'all';
    const options = {
      headed: args.includes('--headed'),
      debug: args.includes('--debug'),
      ui: args.includes('--ui'),
      workers: args.find(arg => arg.startsWith('--workers='))?.split('=')[1]
    };

    try {
      await this.checkPrerequisites();
      await this.checkAllServers();
      await this.runTests(testType, options);
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }
}

// Self-executing function to add fetch polyfill for Node.js versions < 18
(async () => {
  // Simple fetch polyfill for older Node.js versions
  if (!global.fetch) {
    const http = require('http');
    global.fetch = (url) => {
      return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const req = http.request({
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname,
          method: 'GET'
        }, (res) => {
          resolve({ 
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode
          });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => reject(new Error('Timeout')));
        req.end();
      });
    };
  }

  const runner = new TestRunner();
  await runner.run();
})();
