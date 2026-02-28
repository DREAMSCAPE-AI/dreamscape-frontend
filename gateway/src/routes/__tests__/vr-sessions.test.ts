/**
 * VR Sessions Routes Tests
 * DR-574: Accès VR par Code PIN
 */

import express from 'express';
import vrSessionRoutes, { sessions, purgeExpired, SESSION_TTL_MS } from '../vr-sessions';

// Minimal Express app for testing
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/vr', vrSessionRoutes);
  return app;
}

// Simple test helper (no supertest dependency)
function makeRequest(app: express.Express, method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const url = `http://localhost:${port}${path}`;

      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      fetch(url, options)
        .then(async (res) => {
          const json = await res.json();
          server.close();
          resolve({ status: res.status, body: json });
        })
        .catch((err) => {
          server.close();
          resolve({ status: 500, body: { error: err.message } });
        });
    });
  });
}

describe('VR Sessions Routes (DR-574)', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    // Clear sessions between tests
    sessions.clear();
  });

  describe('POST /api/v1/vr/sessions', () => {
    it('should create a session with a 6-digit PIN', async () => {
      const { status, body } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {
        destination: 'barcelona'
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.pin).toMatch(/^\d{6}$/);
      expect(body.data.destination).toBe('barcelona');
      expect(body.data.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should normalize destination to lowercase', async () => {
      const { body } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {
        destination: '  Barcelona  '
      });

      expect(body.data.destination).toBe('barcelona');
    });

    it('should return 400 if destination is missing', async () => {
      const { status, body } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {});

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should return 400 if destination is not a string', async () => {
      const { status, body } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {
        destination: 123
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should generate unique PINs', async () => {
      const pins = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const { body } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {
          destination: 'paris'
        });
        pins.add(body.data.pin);
      }

      expect(pins.size).toBe(10);
    });
  });

  describe('GET /api/v1/vr/sessions/:pin', () => {
    it('should validate a correct PIN and return destination', async () => {
      // Create a session
      const { body: createBody } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {
        destination: 'barcelona'
      });
      const pin = createBody.data.pin;

      // Validate the PIN
      const { status, body } = await makeRequest(app, 'GET', `/api/v1/vr/sessions/${pin}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.destination).toBe('barcelona');
      expect(body.data.autoVR).toBe(true);
    });

    it('should return 404 for non-existent PIN', async () => {
      const { status, body } = await makeRequest(app, 'GET', '/api/v1/vr/sessions/999999');

      expect(status).toBe(404);
      expect(body.success).toBe(false);
    });

    it('should return 400 for invalid PIN format', async () => {
      const { status, body } = await makeRequest(app, 'GET', '/api/v1/vr/sessions/abc');

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should return 409 for already used PIN', async () => {
      // Create a session
      const { body: createBody } = await makeRequest(app, 'POST', '/api/v1/vr/sessions', {
        destination: 'paris'
      });
      const pin = createBody.data.pin;

      // Use it once
      await makeRequest(app, 'GET', `/api/v1/vr/sessions/${pin}`);

      // Try to use again
      const { status, body } = await makeRequest(app, 'GET', `/api/v1/vr/sessions/${pin}`);

      expect(status).toBe(409);
      expect(body.success).toBe(false);
    });

    it('should return 410 for expired PIN', async () => {
      // Manually add an expired session
      const pin = '123456';
      sessions.set(pin, {
        pin,
        destination: 'paris',
        createdAt: Date.now() - SESSION_TTL_MS - 1000,
        expiresAt: Date.now() - 1000, // Already expired
        used: false
      });

      const { status, body } = await makeRequest(app, 'GET', `/api/v1/vr/sessions/${pin}`);

      expect(status).toBe(410);
      expect(body.success).toBe(false);
    });
  });

  describe('purgeExpired', () => {
    it('should remove expired sessions', () => {
      // Add expired session
      sessions.set('111111', {
        pin: '111111',
        destination: 'paris',
        createdAt: Date.now() - SESSION_TTL_MS - 1000,
        expiresAt: Date.now() - 1000,
        used: false
      });

      // Add valid session
      sessions.set('222222', {
        pin: '222222',
        destination: 'barcelona',
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
        used: false
      });

      expect(sessions.size).toBe(2);

      purgeExpired();

      expect(sessions.size).toBe(1);
      expect(sessions.has('222222')).toBe(true);
      expect(sessions.has('111111')).toBe(false);
    });
  });
});
