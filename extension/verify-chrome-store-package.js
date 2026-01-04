#!/usr/bin/env node

/**
 * Chrome Store Package Verification Script
 *
 * Verifies that a Chrome Store package is correctly configured
 * before submission to prevent critical bugs.
 *
 * Usage: node verify-chrome-store-package.js <package-directory>
 * Example: node verify-chrome-store-package.js chrome-store-v1.4.4
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, RED);
}

function success(message) {
  log(`✅ ${message}`, GREEN);
}

function warning(message) {
  log(`⚠️  WARNING: ${message}`, YELLOW);
}

function verifyPackage(packageDir) {
  log('\n🔍 Verifying Chrome Store Package...\n');

  let hasErrors = false;
  let hasWarnings = false;

  // 1. Check if directory exists
  if (!fs.existsSync(packageDir)) {
    error(`Directory not found: ${packageDir}`);
    return false;
  }
  success(`Package directory found: ${packageDir}`);

  // 2. Check config.js
  const configPath = path.join(packageDir, 'config.js');
  if (!fs.existsSync(configPath)) {
    error('config.js not found');
    hasErrors = true;
  } else {
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Check ENV setting
    const envMatch = configContent.match(/const ENV = ['"](\w+)['"]/);
    if (!envMatch) {
      error('Could not find ENV setting in config.js');
      hasErrors = true;
    } else if (envMatch[1] !== 'production') {
      error(`ENV is set to '${envMatch[1]}' but should be 'production'`);
      error('This will cause the extension to look for localhost instead of nestyil.com');
      hasErrors = true;
    } else {
      success('config.js ENV is set to production');
    }

    // Check if localhost is mentioned
    if (configContent.includes('localhost') && configContent.match(/WEB_URL.*localhost/)) {
      warning('config.js contains localhost references (should only be in development config)');
      hasWarnings = true;
    }
  }

  // 3. Check manifest.json
  const manifestPath = path.join(packageDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    error('manifest.json not found');
    hasErrors = true;
  } else {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    // Check version
    if (!manifest.version) {
      error('No version found in manifest.json');
      hasErrors = true;
    } else {
      success(`Version: ${manifest.version}`);
    }

    // Check for localhost in host_permissions
    if (manifest.host_permissions) {
      const hasLocalhost = manifest.host_permissions.some(perm => perm.includes('localhost'));
      if (hasLocalhost) {
        error('manifest.json contains localhost in host_permissions');
        error('Remove localhost URLs before submitting to Chrome Store');
        hasErrors = true;
      } else {
        success('No localhost in host_permissions');
      }
    }

    // Check for localhost in content_scripts
    if (manifest.content_scripts) {
      manifest.content_scripts.forEach((script, index) => {
        const hasLocalhost = script.matches && script.matches.some(match => match.includes('localhost'));
        if (hasLocalhost) {
          error(`content_scripts[${index}] contains localhost in matches`);
          error('Remove localhost URLs before submitting to Chrome Store');
          hasErrors = true;
        }
      });
      if (!hasErrors) {
        success('No localhost in content_scripts');
      }
    }
  }

  // 4. Check required files
  const requiredFiles = [
    'background.js',
    'content.js',
    'manifest.json',
    'config.js',
    'icon16.png',
    'icon48.png',
    'icon128.png'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(packageDir, file);
    if (!fs.existsSync(filePath)) {
      error(`Required file missing: ${file}`);
      hasErrors = true;
    }
  });

  if (!hasErrors && !hasWarnings) {
    success('All required files present');
  }

  // Summary
  log('\n' + '='.repeat(50));
  if (hasErrors) {
    error('\n❌ VERIFICATION FAILED');
    error('Fix the errors above before submitting to Chrome Store');
    log('\n' + '='.repeat(50) + '\n');
    return false;
  } else if (hasWarnings) {
    warning('\n⚠️  VERIFICATION PASSED WITH WARNINGS');
    warning('Review the warnings above');
    log('\n' + '='.repeat(50) + '\n');
    return true;
  } else {
    success('\n✅ VERIFICATION PASSED');
    success('Package is ready for Chrome Store submission');
    log('\n' + '='.repeat(50) + '\n');
    return true;
  }
}

// Main
const packageDir = process.argv[2];

if (!packageDir) {
  error('Usage: node verify-chrome-store-package.js <package-directory>');
  error('Example: node verify-chrome-store-package.js chrome-store-v1.4.4');
  process.exit(1);
}

const result = verifyPackage(packageDir);
process.exit(result ? 0 : 1);
