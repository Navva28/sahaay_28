import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Nexconn Server Integration Service
 * 
 * Handles secure server-side communications with Nexconn:
 * - Computes HMAC / SHA1 security signature using App-Secret, Nonce, and Timestamp in milliseconds
 * - Issues official user access tokens through Nexconn server endpoints: POST /v4/auth/access-token/issue
 * - Targets the regional data center matching the App Key (Singapore: api.sg-light-api.com)
 * - Never leaks App Secret to the client application
 */
export class NexconnService {
  public appKey: string;
  public appSecret: string;
  public primaryDomain: string;
  public secondaryDomain: string;

  constructor() {
    this.appKey = config.nexconn.appKey.trim();
    this.appSecret = config.nexconn.appSecret.trim();
    this.primaryDomain = config.nexconn.primaryApiDomain.replace(/\/$/, '');
    this.secondaryDomain = config.nexconn.secondaryApiDomain.replace(/\/$/, '');
  }

  /**
   * Refreshes credentials from config in case env reloaded
   */
  private refreshConfig() {
    this.appKey = config.nexconn.appKey.trim();
    this.appSecret = config.nexconn.appSecret.trim();
    this.primaryDomain = config.nexconn.primaryApiDomain.replace(/\/$/, '');
    this.secondaryDomain = config.nexconn.secondaryApiDomain.replace(/\/$/, '');
  }

  /**
   * Generates standard Nexconn authentication headers
   * Signature = SHA1(AppSecret + Nonce + Timestamp)
   * Timestamp: Unix timestamp in milliseconds
   */
  private generateAuthHeaders(): Record<string, string> {
    this.refreshConfig();
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const timestamp = Date.now().toString(); // Must be milliseconds
    
    // Hash AppSecret + Nonce + Timestamp
    const hash = crypto.createHash('sha1');
    hash.update(this.appSecret + nonce + timestamp);
    const signature = hash.digest('hex');

    return {
      'App-Key': this.appKey,
      'Nonce': nonce,
      'Timestamp': timestamp,
      'Signature': signature,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID().replace(/-/g, ''),
    };
  }

  /**
   * Check if credentials are configured
   */
  public hasCredentials(): boolean {
    this.refreshConfig();
    return Boolean(this.appKey && this.appSecret);
  }

  /**
   * Issues an official Nexconn chat access token for a given user.
   * Official API: POST https://api.sg-light-api.com/v4/auth/access-token/issue
   * Body: application/json { userId, name, avatarUrl }
   */
  public async issueUserToken(params: {
    userId: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ token: string; userId: string; appKey: string }> {
    const { userId, name, avatarUrl = '' } = params;

    this.refreshConfig();

    if (!this.hasCredentials()) {
      throw new Error(
        'NEXCONN_CREDENTIALS_MISSING: Please configure NEXCONN_APP_KEY and NEXCONN_APP_SECRET in backend/.env'
      );
    }

    const headers = this.generateAuthHeaders();
    
    // Official JSON payload format
    const payload = JSON.stringify({
      userId,
      name: name || userId,
      avatarUrl: avatarUrl || undefined,
    });

    const endpoints = [
      `${this.primaryDomain}/v4/auth/access-token/issue`,
      'https://api.sg-light-api.com/v4/auth/access-token/issue',
      'https://api-b.sg-light-api.com/v4/auth/access-token/issue',
      'https://api.us-light-api.com/v4/auth/access-token/issue',
    ];

    let lastError: any = null;

    for (const url of endpoints) {
      try {
        console.log(`[NexconnService] Requesting token for ${userId} from ${url}...`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: payload,
        });

        const data: any = await response.json();
        console.log(`[NexconnService] Response from ${url}:`, data);

        // Official response: { code: 0, result: { userId, accessToken } }
        if (data && (data.code === 0 || data.code === 200)) {
          const token =
            data.result?.accessToken ||
            data.result?.token ||
            data.token ||
            data.accessToken;

          if (token) {
            console.log(`✅ [NexconnService] Successfully issued token for ${userId}`);
            return {
              token,
              userId,
              appKey: this.appKey,
            };
          }
        }

        if (data && data.errorMessage) {
          lastError = new Error(`Nexconn API Error (${data.code}): ${data.errorMessage}`);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[NexconnService] Failed request to ${url}:`, err.message);
      }
    }

    throw new Error(
      `Failed to issue Nexconn token from server API: ${lastError?.message || 'Unknown network error'}`
    );
  }

  /**
   * Generates a deterministic group channel ID for an assistance request
   */
  public generateChannelId(requestId: string): string {
    return `sahaay_req_${requestId}`;
  }
}

export const nexconnService = new NexconnService();
