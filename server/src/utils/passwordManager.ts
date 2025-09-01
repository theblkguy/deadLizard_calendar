import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordManager {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Generate a secure random access code
   */
  static generateSecureCode(length: number = 16): string {
    return crypto.randomBytes(length).toString('base64url').slice(0, length);
  }

  /**
   * Hash a password/access code using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate access code strength
   */
  static validateCodeStrength(code: string): { isValid: boolean; message: string } {
    if (code.length < 12) {
      return { isValid: false, message: 'Access code must be at least 12 characters long' };
    }
    
    if (!/[A-Z]/.test(code) || !/[a-z]/.test(code) || !/\d/.test(code)) {
      return { isValid: false, message: 'Access code must contain uppercase, lowercase, and numbers' };
    }
    
    return { isValid: true, message: 'Access code is strong' };
  }
}

export class AccessCodeManager {
  private static guestCodeHash: string | null = null;
  private static userCodeHash: string | null = null;
  private static adminCodeHash: string | null = null;
  
  // Support for both plaintext and hashed passwords
  private static guestCodePlain: string | null = null;
  private static userCodePlain: string | null = null;
  private static adminCodePlain: string | null = null;
  private static initialized: boolean = false;

  /**
   * Check if access codes have been properly initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize access codes from environment variables
   * Supports both plaintext codes and pre-hashed codes
   */
  static initialize(): void {
    // Load hashed versions (if available)
    this.guestCodeHash = process.env.GUEST_ACCESS_CODE_HASH || null;
    this.userCodeHash = process.env.USER_ACCESS_CODE_HASH || null;
    this.adminCodeHash = process.env.ADMIN_ACCESS_CODE_HASH || null;

    // Load plaintext versions (if available)
    this.guestCodePlain = process.env.GUEST_ACCESS_CODE || null;
    this.userCodePlain = process.env.USER_ACCESS_CODE || null;
    this.adminCodePlain = process.env.ADMIN_ACCESS_CODE || null;

    // Validate that at least one method is configured for each role
    if ((!this.guestCodeHash && !this.guestCodePlain) ||
        (!this.userCodeHash && !this.userCodePlain) ||
        (!this.adminCodeHash && !this.adminCodePlain)) {
      this.initialized = false;
      throw new Error('All access codes must be set in environment variables (either plain or hashed)');
    }

    this.initialized = true;
    console.log('🔐 Access codes initialized successfully');
    if (this.guestCodeHash || this.userCodeHash || this.adminCodeHash) {
      console.log('🔒 Using bcrypt hashed passwords for enhanced security');
    }
    if (this.guestCodePlain || this.userCodePlain || this.adminCodePlain) {
      console.log('⚠️  Using plaintext passwords - consider using hashed versions for production');
    }
  }

  /**
   * Verify an access code and return the corresponding role
   * Supports both plaintext and bcrypt hashed verification
   */
  static async verifyAccessCode(code: string): Promise<'guest' | 'user' | 'admin' | null> {
    if (!code) return null;

    try {
      // Check guest access
      if (await this.verifyCodeForRole(code, 'guest')) return 'guest';
      if (await this.verifyCodeForRole(code, 'user')) return 'user';  
      if (await this.verifyCodeForRole(code, 'admin')) return 'admin';

      return null;
    } catch (error) {
      console.error('Error verifying access code:', error);
      return null;
    }
  }

  /**
   * Verify a code against a specific role's stored password
   */
  private static async verifyCodeForRole(code: string, role: 'guest' | 'user' | 'admin'): Promise<boolean> {
    const hash = this.getHashForRole(role);
    const plaintext = this.getPlaintextForRole(role);

    // If we have a hash, use bcrypt verification
    if (hash) {
      return await PasswordManager.verifyPassword(code, hash);
    }
    
    // If we have plaintext, use timing-safe comparison
    if (plaintext) {
      return this.timingSafeEqual(code, plaintext);
    }

    return false;
  }

  /**
   * Get the hash for a specific role
   */
  private static getHashForRole(role: 'guest' | 'user' | 'admin'): string | null {
    switch (role) {
      case 'guest': return this.guestCodeHash;
      case 'user': return this.userCodeHash;
      case 'admin': return this.adminCodeHash;
      default: return null;
    }
  }

  /**
   * Get the plaintext code for a specific role
   */
  private static getPlaintextForRole(role: 'guest' | 'user' | 'admin'): string | null {
    switch (role) {
      case 'guest': return this.guestCodePlain;
      case 'user': return this.userCodePlain;
      case 'admin': return this.adminCodePlain;
      default: return null;
    }
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    
    return crypto.timingSafeEqual(bufferA, bufferB);
  }

  /**
   * Get available access levels (without revealing codes)
   */
  static getAccessLevels(): string[] {
    return ['guest', 'user', 'admin'];
  }
}

// Rate limiting for access code attempts
export class AccessRateLimit {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(ip);

    if (!userAttempts) return false;

    // Reset if window has passed
    if (now - userAttempts.lastAttempt > this.WINDOW_MS) {
      this.attempts.delete(ip);
      return false;
    }

    return userAttempts.count >= this.MAX_ATTEMPTS;
  }

  static recordAttempt(ip: string): void {
    const now = Date.now();
    const userAttempts = this.attempts.get(ip);

    if (!userAttempts || now - userAttempts.lastAttempt > this.WINDOW_MS) {
      this.attempts.set(ip, { count: 1, lastAttempt: now });
    } else {
      userAttempts.count++;
      userAttempts.lastAttempt = now;
    }
  }
}
