// SPDX-License-Identifier: MIT OR GPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell

/**
 * AIBDP + HTTP 430 Middleware for Express
 *
 * Implements AI Boundary Declaration Protocol (AIBDP) enforcement
 * with HTTP 430 (Consent Required) responses.
 *
 * @module aibdp-http430-middleware
 * @license MIT
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * AI User-Agent patterns for detection
 */
const AI_USER_AGENTS = [
  /GPTBot/i,
  /ChatGPT-User/i,
  /Claude-Web/i,
  /anthropic-ai/i,
  /Google-Extended/i,
  /CCBot/i,
  /Googlebot/i,
  /Bingbot/i,
  /Slurp/i,
  /DuckDuckBot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /Sogou/i,
  /Exabot/i,
  /facebookexternalhit/i,
  /ia_archiver/i,
  /PerplexityBot/i,
  /Omgilibot/i,
  /Diffbot/i,
];

/**
 * Load and parse AIBDP manifest
 * @param {string} manifestPath - Path to aibdp.json file
 * @returns {Promise<Object>} Parsed manifest
 */
export async function loadManifest(manifestPath = '.well-known/aibdp.json') {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to load AIBDP manifest: ${error.message}`);
    return null;
  }
}

/**
 * Check if User-Agent matches known AI systems
 * @param {string} userAgent - Request User-Agent header
 * @returns {boolean} True if AI system detected
 */
export function isAIUserAgent(userAgent) {
  if (!userAgent) return false;
  return AI_USER_AGENTS.some(pattern => pattern.test(userAgent));
}

/**
 * Extract AI purpose from request headers
 * @param {Object} headers - Request headers
 * @returns {string|null} Detected AI purpose (training, indexing, etc.)
 */
export function extractAIPurpose(headers) {
  // Check custom AI-Purpose header
  if (headers['ai-purpose']) {
    return headers['ai-purpose'].toLowerCase();
  }

  // Infer from User-Agent
  const ua = headers['user-agent'] || '';
  if (/GPTBot/i.test(ua)) return 'training';
  if (/Claude-Web/i.test(ua)) return 'indexing';
  if (/Google-Extended/i.test(ua)) return 'training';
  if (/Googlebot/i.test(ua)) return 'indexing';

  return 'unknown';
}

/**
 * Check if path matches pattern (glob-style)
 * @param {string} requestPath - Request path
 * @param {string} pattern - Pattern from manifest (e.g., "/docs/**", "*.pdf")
 * @returns {boolean} True if path matches pattern
 */
export function pathMatches(requestPath, pattern) {
  if (pattern === 'all') return true;

  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(requestPath);
}

/**
 * Get applicable policy for request path and purpose
 * @param {Object} manifest - AIBDP manifest
 * @param {string} purpose - AI purpose (training, indexing, etc.)
 * @param {string} requestPath - Request path
 * @returns {Object|null} Applicable policy or null
 */
export function getApplicablePolicy(manifest, purpose, requestPath) {
  if (!manifest || !manifest.policies) return null;

  const policy = manifest.policies[purpose];
  if (!policy) return null;

  // Check scope
  if (policy.scope) {
    if (Array.isArray(policy.scope)) {
      const matches = policy.scope.some(pattern =>
        pathMatches(requestPath, pattern)
      );
      if (!matches) return null;
    }
    // scope: "all" always matches
  }

  // Check exceptions
  if (policy.exceptions && Array.isArray(policy.exceptions)) {
    for (const exception of policy.exceptions) {
      if (pathMatches(requestPath, exception.path)) {
        return exception; // Exception takes precedence
      }
    }
  }

  return policy;
}

/**
 * Check if request satisfies policy conditions
 * @param {Object} policy - Policy from manifest
 * @param {Object} req - Express request object
 * @returns {Object} { satisfied: boolean, missing: string[] }
 */
export function checkPolicyConditions(policy, req) {
  if (!policy.conditions || policy.status !== 'conditional') {
    return { satisfied: true, missing: [] };
  }

  const missing = [];
  const headers = req.headers;

  // Check for consent headers
  const consentReviewed = headers['ai-consent-reviewed'];
  const consentConditions = headers['ai-consent-conditions'];

  if (!consentReviewed) {
    missing.push('AI-Consent-Reviewed header required');
  }

  if (!consentConditions) {
    missing.push('AI-Consent-Conditions header required');
  }

  // TODO: More sophisticated condition checking based on policy.conditions

  return {
    satisfied: missing.length === 0,
    missing
  };
}

/**
 * Create HTTP 430 response
 * @param {Object} manifest - AIBDP manifest
 * @param {Object} policy - Violated policy
 * @param {string} purpose - AI purpose
 * @returns {Object} Response object
 */
export function create430Response(manifest, policy, purpose) {
  const manifestUri = manifest.canonical_uri || '/.well-known/aibdp.json';

  return {
    statusCode: 430,
    headers: {
      'Content-Type': 'application/json',
      'Link': `<${manifestUri}>; rel="blocked-by-consent"`,
      'Retry-After': '86400' // 24 hours
    },
    body: {
      error: 'AI usage boundaries declared in AIBDP manifest not satisfied',
      manifest: manifestUri,
      violated_policy: purpose,
      policy_status: policy.status,
      required_conditions: policy.conditions || [],
      rationale: policy.rationale || 'No additional information provided',
      contact: manifest.contact
    }
  };
}

/**
 * Express middleware factory for AIBDP enforcement
 * @param {Object} options - Middleware options
 * @param {string} options.manifestPath - Path to aibdp.json
 * @param {boolean} options.enforceForAll - Enforce for all requests (default: false)
 * @param {Function} options.onViolation - Callback when violation detected
 * @returns {Function} Express middleware
 */
export function aibdpMiddleware(options = {}) {
  const {
    manifestPath = '.well-known/aibdp.json',
    enforceForAll = false,
    onViolation = null
  } = options;

  let manifest = null;
  let manifestLoadTime = 0;
  const CACHE_DURATION = 3600000; // 1 hour in milliseconds

  return async function(req, res, next) {
    try {
      // Reload manifest if cache expired
      const now = Date.now();
      if (!manifest || (now - manifestLoadTime > CACHE_DURATION)) {
        manifest = await loadManifest(manifestPath);
        manifestLoadTime = now;
      }

      if (!manifest) {
        return next(); // No manifest, no enforcement
      }

      // Detect AI systems
      const userAgent = req.headers['user-agent'] || '';
      const isAI = enforceForAll || isAIUserAgent(userAgent);

      if (!isAI) {
        return next(); // Not an AI system, allow through
      }

      // Extract purpose
      const purpose = extractAIPurpose(req.headers);

      // Get applicable policy
      const policy = getApplicablePolicy(manifest, purpose, req.path);

      if (!policy) {
        return next(); // No policy for this purpose/path, allow through
      }

      // Check policy status
      if (policy.status === 'refused') {
        const response = create430Response(manifest, policy, purpose);

        if (onViolation) {
          onViolation(req, policy, purpose);
        }

        res.status(response.statusCode);
        Object.entries(response.headers).forEach(([key, value]) => {
          res.header(key, value);
        });
        return res.json(response.body);
      }

      if (policy.status === 'conditional') {
        const check = checkPolicyConditions(policy, req);
        if (!check.satisfied) {
          const response = create430Response(manifest, policy, purpose);
          response.body.missing_conditions = check.missing;

          if (onViolation) {
            onViolation(req, policy, purpose);
          }

          res.status(response.statusCode);
          Object.entries(response.headers).forEach(([key, value]) => {
            res.header(key, value);
          });
          return res.json(response.body);
        }
      }

      // Policy satisfied or allowed
      next();

    } catch (error) {
      console.error('AIBDP middleware error:', error);
      next(); // Fail open - don't break the site on errors
    }
  };
}

/**
 * Serve AIBDP manifest at /.well-known/aibdp.json
 * @param {string} manifestPath - Path to manifest file
 * @returns {Function} Express middleware
 */
export function serveManifest(manifestPath = '.well-known/aibdp.json') {
  return async function(req, res, next) {
    if (req.path !== '/.well-known/aibdp.json') {
      return next();
    }

    try {
      const manifest = await loadManifest(manifestPath);
      if (!manifest) {
        return res.status(404).json({ error: 'Manifest not found' });
      }

      res.header('Content-Type', 'application/aibdp+json');
      res.header('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      res.header('Access-Control-Allow-Origin', '*'); // Allow CORS for manifest
      res.json(manifest);
    } catch (error) {
      console.error('Error serving manifest:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export default {
  aibdpMiddleware,
  serveManifest,
  loadManifest,
  isAIUserAgent,
  extractAIPurpose,
  pathMatches,
  getApplicablePolicy,
  checkPolicyConditions,
  create430Response
};
