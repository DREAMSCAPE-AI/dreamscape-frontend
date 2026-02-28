/**
 * VR Sessions Routes
 * DR-574: Accès VR par Code PIN (casques sans scanner QR)
 *
 * Gère la création et validation de sessions VR via code PIN à 6 chiffres.
 * Stockage in-memory avec TTL automatique (10 minutes).
 */

import { Router, Request, Response } from 'express';

const router = Router();

// --- In-memory session store ---

interface VRSession {
  pin: string;
  destination: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

const sessions = new Map<string, VRSession>();

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PIN_LENGTH = 6;

/**
 * Generate a unique 6-digit PIN
 */
function generatePin(): string {
  let pin: string;
  let attempts = 0;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;
    if (attempts > 100) {
      // Purge expired sessions if we can't find a unique PIN
      purgeExpired();
      attempts = 0;
    }
  } while (sessions.has(pin));
  return pin;
}

/**
 * Purge expired sessions
 */
function purgeExpired(): void {
  const now = Date.now();
  for (const [pin, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(pin);
    }
  }
}

// Purge expired sessions every 2 minutes
setInterval(purgeExpired, 2 * 60 * 1000);

/**
 * POST /api/v1/vr/sessions
 * Create a new VR session with a 6-digit PIN
 *
 * Body: { destination: string }
 * Response: { success: true, data: { pin, destination, expiresAt } }
 */
router.post('/sessions', (req: Request, res: Response) => {
  const { destination } = req.body;

  if (!destination || typeof destination !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid "destination" field'
    });
  }

  // Purge expired sessions before creating new one
  purgeExpired();

  const pin = generatePin();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  const session: VRSession = {
    pin,
    destination: destination.toLowerCase().trim(),
    createdAt: now,
    expiresAt,
    used: false
  };

  sessions.set(pin, session);

  console.log(`🔑 VR Session created: PIN ${pin} → ${session.destination} (expires in 10min)`);

  return res.status(201).json({
    success: true,
    data: {
      pin,
      destination: session.destination,
      expiresAt
    }
  });
});

/**
 * GET /api/v1/vr/sessions/:pin
 * Validate a PIN and return the destination
 *
 * Response: { success: true, data: { destination, autoVR: true } }
 */
router.get('/sessions/:pin', (req: Request, res: Response) => {
  const { pin } = req.params;

  // Validate PIN format
  if (!pin || !/^\d{6}$/.test(pin)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid PIN format. Must be 6 digits.'
    });
  }

  const session = sessions.get(pin);

  // PIN not found
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'PIN not found or expired'
    });
  }

  // Check expiration
  if (Date.now() > session.expiresAt) {
    sessions.delete(pin);
    return res.status(410).json({
      success: false,
      error: 'PIN has expired'
    });
  }

  // Check if already used
  if (session.used) {
    return res.status(409).json({
      success: false,
      error: 'PIN has already been used'
    });
  }

  // Mark as used
  session.used = true;

  console.log(`✅ VR Session validated: PIN ${pin} → ${session.destination}`);

  return res.status(200).json({
    success: true,
    data: {
      destination: session.destination,
      autoVR: true
    }
  });
});

export default router;

// Export for testing
export { sessions, generatePin, purgeExpired, SESSION_TTL_MS };
