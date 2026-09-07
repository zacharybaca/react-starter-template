import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

describe('app', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'API is running' });
  });
});
