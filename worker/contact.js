/**
 * daca.me — Cloudflare Worker `/api/contact` B2B Consulting & Hiring Intake
 * Dependency-free ESM handler backed by Cloudflare D1 (`env.DB`)
 */

const VALID_INQUIRY_TYPES = new Set([
  'enterprise_network',
  'workstation_ai_build',
  'cloudflare_mcp',
  'leadership_hiring',
  'general_consulting'
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTROL_CHAR_PATTERN = /[\r\n\0]/;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map();

class FallbackHeaders {
  constructor(init = {}) {
    this._map = new Map();
    if (init && typeof init === 'object') {
      for (const [k, v] of Object.entries(init)) {
        this.set(k, v);
      }
    }
  }
  set(name, value) {
    this._map.set(String(name).toLowerCase(), String(value));
  }
  get(name) {
    const val = this._map.get(String(name).toLowerCase());
    return val === undefined ? null : val;
  }
  has(name) {
    return this._map.has(String(name).toLowerCase());
  }
  entries() {
    return this._map.entries();
  }
  [Symbol.iterator]() {
    return this._map.entries();
  }
}

class FallbackResponse {
  constructor(body = null, init = {}) {
    this._body = body === null || body === undefined ? '' : String(body);
    this.status = typeof init.status === 'number' ? init.status : 200;
    this.ok = this.status >= 200 && this.status < 300;
    const HeadersCtor = typeof globalThis.Headers === 'function' ? globalThis.Headers : FallbackHeaders;
    this.headers = init.headers instanceof HeadersCtor ? init.headers : new HeadersCtor(init.headers || {});
  }
  async text() {
    return this._body;
  }
  async json() {
    return JSON.parse(this._body);
  }
}

function createResponse(body, init = {}) {
  const ResponseCtor = typeof globalThis.Response === 'function' ? globalThis.Response : FallbackResponse;
  return new ResponseCtor(body, init);
}

function buildSecurityHeaders(extraHeaders = {}) {
  const base = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cache-Control': 'no-store',
    ...extraHeaders
  };
  const HeadersCtor = typeof globalThis.Headers === 'function' ? globalThis.Headers : FallbackHeaders;
  return new HeadersCtor(base);
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  const headers = buildSecurityHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders
  });
  return createResponse(JSON.stringify(payload), { status, headers });
}

function generateSecureUuid() {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  throw new Error('Secure Web Crypto provider is unavailable');
}

function generateTicketId() {
  const compact = generateSecureUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `INQ-${compact}`;
}

function getClientIp(request) {
  if (!request || !request.headers || typeof request.headers.get !== 'function') {
    return 'anonymous';
  }
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const xff = request.headers.get('X-Forwarded-For');
  if (xff && xff.trim()) {
    return xff.split(',')[0].trim() || 'anonymous';
  }
  return 'anonymous';
}

async function hashClientIp(ip) {
  if (!ip || ip === 'anonymous') return 'anonymous';
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && cryptoObj.subtle && typeof cryptoObj.subtle.digest === 'function' && typeof TextEncoder === 'function') {
    try {
      const digest = await cryptoObj.subtle.digest('SHA-256', new TextEncoder().encode(ip));
      return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'redacted';
    }
  }
  return 'redacted';
}

function isRateLimited(ip, now = Date.now()) {
  if (rateLimitStore.size > 1024) {
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (recent.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, recent);
      }
    }
  }

  const history = rateLimitStore.get(ip) || [];
  const activeWindow = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (activeWindow.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, activeWindow);
    return true;
  }
  activeWindow.push(now);
  rateLimitStore.set(ip, activeWindow);
  return false;
}

export function resetRateLimitStore() {
  rateLimitStore.clear();
}

function validateContactPayload(body) {
  const fields = [];

  const rawName = typeof body.name === 'string' ? body.name.trim() : '';
  if (rawName.length < 2 || rawName.length > 120 || CONTROL_CHAR_PATTERN.test(rawName)) {
    fields.push('name');
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  if (
    rawEmail.length === 0 ||
    rawEmail.length > 254 ||
    CONTROL_CHAR_PATTERN.test(rawEmail) ||
    !EMAIL_PATTERN.test(rawEmail)
  ) {
    fields.push('email');
  }

  let organization = '';
  if (body.organization !== undefined && body.organization !== null) {
    if (typeof body.organization !== 'string') {
      fields.push('organization');
    } else {
      organization = body.organization.trim();
      if (organization.length > 160 || CONTROL_CHAR_PATTERN.test(organization)) {
        fields.push('organization');
      }
    }
  }

  const inquiryType = typeof body.inquiry_type === 'string' ? body.inquiry_type.trim() : '';
  if (!VALID_INQUIRY_TYPES.has(inquiryType)) {
    fields.push('inquiry_type');
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length < 10 || message.length > 4000) {
    fields.push('message');
  }

  return {
    valid: fields.length === 0,
    fields,
    sanitized: {
      name: rawName,
      email: rawEmail.toLowerCase(),
      organization,
      inquiry_type: inquiryType,
      message
    }
  };
}

export async function handleContactRequest(request, env = {}) {
  const method = (request && request.method ? String(request.method) : 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    const headers = buildSecurityHeaders({
      'Allow': 'POST, OPTIONS'
    });
    return createResponse(null, { status: 204, headers });
  }

  if (method !== 'POST') {
    return jsonResponse(
      { success: false, error: 'Method not allowed' },
      405,
      { 'Allow': 'POST, OPTIONS' }
    );
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return jsonResponse(
      { success: false, error: 'Rate limit exceeded. Please try again shortly.' },
      429,
      { 'Retry-After': '60' }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: 'Invalid JSON request body', fields: [] },
      400
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse(
      { success: false, error: 'Request payload must be a JSON object', fields: [] },
      400
    );
  }

  // Silent anti-spam honeypot trap: return 200 OK without touching D1
  if (body.website !== undefined && body.website !== null && String(body.website).trim().length > 0) {
    const decoyTicket = generateTicketId();
    return jsonResponse(
      { success: true, ticket: decoyTicket, status: 'received' },
      200
    );
  }

  const validation = validateContactPayload(body);
  if (!validation.valid) {
    return jsonResponse(
      {
        success: false,
        error: `Invalid or missing inquiry fields: ${validation.fields.join(', ')}`,
        fields: validation.fields
      },
      400
    );
  }

  if (!env || !env.DB || typeof env.DB.prepare !== 'function') {
    return jsonResponse(
      { success: false, error: 'Inquiry datastore unavailable' },
      503
    );
  }

  const ticket = generateTicketId();
  const createdAt = new Date().toISOString();
  const ipHash = await hashClientIp(clientIp);
  const rawUa = request.headers && typeof request.headers.get === 'function'
    ? (request.headers.get('User-Agent') || '')
    : '';
  const userAgent = rawUa.slice(0, 256);

  try {
    const stmt = env.DB.prepare(
      `INSERT INTO contact_inquiries (
        ticket_number,
        client_name,
        client_email,
        organization,
        inquiry_type,
        message,
        ip_hash,
        user_agent,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    await stmt
      .bind(
        ticket,
        validation.sanitized.name,
        validation.sanitized.email,
        validation.sanitized.organization,
        validation.sanitized.inquiry_type,
        validation.sanitized.message,
        ipHash,
        userAgent,
        'new',
        createdAt
      )
      .run();
  } catch {
    return jsonResponse(
      { success: false, error: 'Inquiry datastore unavailable' },
      503
    );
  }

  return jsonResponse(
    {
      success: true,
      ticket,
      status: 'received'
    },
    201
  );
}

export default {
  fetch: handleContactRequest
};
