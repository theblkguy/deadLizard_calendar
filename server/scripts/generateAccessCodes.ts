#!/usr/bin/env node

/**
 * Secure Access Code Generator for Dead Lizard Studio Calendar
 * 
 * This script generates cryptographically secure access codes
 * and optionally creates bcrypt hashes for additional security.
 */

import { PasswordManager } from '../src/utils/passwordManager';
import crypto from 'crypto';

async function generateAccessCodes() {
  console.log('🔐 Generating Secure Access Codes for Dead Lizard Studio Calendar\n');

  // Generate secure access codes
  const guestCode = PasswordManager.generateSecureCode(16);
  const userCode = PasswordManager.generateSecureCode(16);
  const adminCode = PasswordManager.generateSecureCode(20); // Admin gets longer code

  console.log('Generated Access Codes:');
  console.log('=' .repeat(50));
  console.log(`🏠 GUEST_ACCESS_CODE="${guestCode}"`);
  console.log(`👤 USER_ACCESS_CODE="${userCode}"`);
  console.log(`🔑 ADMIN_ACCESS_CODE="${adminCode}"`);
  console.log();

  // Generate bcrypt hashes (optional, for extra security)
  console.log('Optional: Bcrypt Hashes (for enhanced security):');
  console.log('=' .repeat(50));
  try {
    const guestHash = await PasswordManager.hashPassword(guestCode);
    const userHash = await PasswordManager.hashPassword(userCode);
    const adminHash = await PasswordManager.hashPassword(adminCode);

    console.log(`🏠 GUEST_ACCESS_CODE_HASH="${guestHash}"`);
    console.log(`👤 USER_ACCESS_CODE_HASH="${userHash}"`);
    console.log(`🔑 ADMIN_ACCESS_CODE_HASH="${adminHash}"`);
  } catch (error) {
    console.error('Error generating hashes:', error);
  }

  console.log('\n📋 Instructions:');
  console.log('=' .repeat(50));
  console.log('1. Copy the access codes to your server/.env file');
  console.log('2. Share these codes securely with your band members:');
  console.log(`   • Guest Code (read-only): ${guestCode}`);
  console.log(`   • User Code (booking): ${userCode}`);
  console.log(`   • Admin Code (management): ${adminCode}`);
  console.log('3. Keep the admin code secure and limit its distribution');
  console.log('4. Consider rotating codes periodically for security');

  console.log('\n🔒 Security Tips:');
  console.log('=' .repeat(50));
  console.log('• Never commit .env files to version control');
  console.log('• Use different codes for development/production');
  console.log('• Monitor access logs for suspicious activity');
  console.log('• Rotate codes if they are compromised');
  console.log('• Consider using the bcrypt hashes for additional security');
}

// Generate a simple memorable code for sharing
function generateMemorableCode(prefix: string, length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars
  let result = prefix.toUpperCase() + '-';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

async function generateMemorableCodes() {
  console.log('\n🎵 Alternative: Memorable Codes for Band Members\n');
  
  const guestCode = generateMemorableCode('GUEST', 6);
  const userCode = generateMemorableCode('BAND', 6);
  const adminCode = generateMemorableCode('ADMIN', 8);

  console.log('Memorable Access Codes:');
  console.log('=' .repeat(50));
  console.log(`🏠 Guest Access: ${guestCode}`);
  console.log(`👤 Band Member: ${userCode}`);
  console.log(`🔑 Admin Access: ${adminCode}`);
  console.log();
  console.log('These are easier to share verbally or remember!');
}

// Run the generators
(async () => {
  await generateAccessCodes();
  await generateMemorableCodes();
})().catch(console.error);
