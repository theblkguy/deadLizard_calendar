#!/usr/bin/env node

/**
 * Custom Password Hasher for Dead Lizard Studio Calendar
 * 
 * This script takes your custom passwords and creates secure bcrypt hashes
 */

import { PasswordManager } from '../src/utils/passwordManager';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function hashCustomPasswords() {
  console.log('🔐 Custom Password Hasher for Dead Lizard Studio Calendar\n');
  console.log('Enter your custom passwords to generate secure hashes.\n');
  console.log('💡 Tips:');
  console.log('• Use memorable but strong passwords');
  console.log('• Mix letters, numbers, and symbols'); 
  console.log('• Different password for each access level\n');

  try {
    // Get custom passwords
    const guestPassword = await askQuestion('🏠 Enter GUEST password (read-only access): ');
    const userPassword = await askQuestion('👤 Enter USER password (booking access): ');
    const adminPassword = await askQuestion('🔑 Enter ADMIN password (full management): ');

    console.log('\n🔄 Generating secure hashes...\n');

    // Validate password strength
    const guestValidation = PasswordManager.validateCodeStrength(guestPassword);
    const userValidation = PasswordManager.validateCodeStrength(userPassword);
    const adminValidation = PasswordManager.validateCodeStrength(adminPassword);

    if (!guestValidation.isValid) {
      console.log(`⚠️  Guest password: ${guestValidation.message}`);
    }
    if (!userValidation.isValid) {
      console.log(`⚠️  User password: ${userValidation.message}`);
    }
    if (!adminValidation.isValid) {
      console.log(`⚠️  Admin password: ${adminValidation.message}`);
    }

    // Generate hashes
    const guestHash = await PasswordManager.hashPassword(guestPassword);
    const userHash = await PasswordManager.hashPassword(userPassword);
    const adminHash = await PasswordManager.hashPassword(adminPassword);

    console.log('✅ Hashes generated successfully!\n');

    console.log('📋 Add these to your server/.env file:');
    console.log('=' .repeat(60));
    console.log('# Your custom passwords (hashed for security)');
    console.log(`GUEST_ACCESS_CODE_HASH="${guestHash}"`);
    console.log(`USER_ACCESS_CODE_HASH="${userHash}"`);
    console.log(`ADMIN_ACCESS_CODE_HASH="${adminHash}"`);
    console.log();
    
    console.log('Alternative: Use plaintext (less secure but simpler):');
    console.log('=' .repeat(60));
    console.log(`GUEST_ACCESS_CODE="${guestPassword}"`);
    console.log(`USER_ACCESS_CODE="${userPassword}"`);
    console.log(`ADMIN_ACCESS_CODE="${adminPassword}"`);
    console.log();

    console.log('🔒 Security Recommendation:');
    console.log('Use the hashed versions for production and plaintext for development.');
    console.log();

    console.log('📋 Your Access Codes for Sharing:');
    console.log('=' .repeat(60));
    console.log(`🏠 Guest Access: "${guestPassword}"`);
    console.log(`👤 User Access: "${userPassword}"`);
    console.log(`🔑 Admin Access: "${adminPassword}"`);
    console.log();
    console.log('Share these passwords securely with your band members!');

  } catch (error) {
    console.error('Error generating hashes:', error);
  } finally {
    rl.close();
  }
}

async function quickSetup() {
  console.log('🚀 Quick Setup with Example Passwords\n');
  
  const examplePasswords = {
    guest: 'StudioGuest2024!',
    user: 'DeadLizardBand!',
    admin: 'StudioAdmin2024!'
  };

  console.log('Example passwords:');
  console.log(`🏠 Guest: ${examplePasswords.guest}`);
  console.log(`👤 User: ${examplePasswords.user}`);
  console.log(`🔑 Admin: ${examplePasswords.admin}\n`);

  const useExamples = await askQuestion('Use these example passwords? (y/n): ');
  
  if (useExamples.toLowerCase() === 'y' || useExamples.toLowerCase() === 'yes') {
    console.log('\n🔄 Generating hashes for example passwords...\n');
    
    const guestHash = await PasswordManager.hashPassword(examplePasswords.guest);
    const userHash = await PasswordManager.hashPassword(examplePasswords.user);
    const adminHash = await PasswordManager.hashPassword(examplePasswords.admin);

    console.log('📋 Add these to your server/.env file:');
    console.log('=' .repeat(60));
    console.log(`GUEST_ACCESS_CODE_HASH="${guestHash}"`);
    console.log(`USER_ACCESS_CODE_HASH="${userHash}"`);
    console.log(`ADMIN_ACCESS_CODE_HASH="${adminHash}"`);
    console.log();
    
    console.log('🎵 Share these with your band:');
    console.log(`🏠 Guest Password: ${examplePasswords.guest}`);
    console.log(`👤 Band Password: ${examplePasswords.user}`);
    console.log(`🔑 Admin Password: ${examplePasswords.admin}`);
  } else {
    await hashCustomPasswords();
  }

  rl.close();
}

// Main execution
(async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick') || args.includes('-q')) {
    await quickSetup();
  } else {
    const mode = await askQuestion('Choose setup mode:\n1. Custom passwords\n2. Quick setup with examples\n\nEnter choice (1 or 2): ');
    
    if (mode === '2') {
      await quickSetup();
    } else {
      await hashCustomPasswords();
    }
  }
})().catch(console.error);
