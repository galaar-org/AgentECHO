import { describe, it, expect } from 'vitest';
import { createSigner } from '../src/signer';

describe('Signer', () => {
  const keyId = 'test-key-1';
  const secret = 'test-secret-123';
  const signer = createSigner(keyId, secret);

  it('should generate signature with correct headers', async () => {
    const body = '{"test":"data"}';
    const timestamp = 1703001234567;

    const result = await signer.sign(body, timestamp);

    expect(result.body).toBe(body);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    expect(result.headers).toHaveProperty('X-API-Key', secret);
    expect(result.headers).toHaveProperty('x-agentecho-key-id', keyId);
    expect(result.headers).toHaveProperty('x-agentecho-ts', timestamp.toString());
    expect(result.headers).toHaveProperty('x-agentecho-signature');
    expect(typeof result.headers['x-agentecho-signature']).toBe('string');
    expect(result.headers['x-agentecho-signature'].length).toBeGreaterThan(0);
  });

  it('should generate consistent signatures for same input', async () => {
    const body = '{"test":"data"}';
    const timestamp = 1703001234567;

    const result1 = await signer.sign(body, timestamp);
    const result2 = await signer.sign(body, timestamp);

    expect(result1.headers['x-agentecho-signature']).toBe(
      result2.headers['x-agentecho-signature']
    );
  });

  it('should generate different signatures for different timestamps', async () => {
    const body = '{"test":"data"}';

    const result1 = await signer.sign(body, 1703001234567);
    const result2 = await signer.sign(body, 1703001234568);

    expect(result1.headers['x-agentecho-signature']).not.toBe(
      result2.headers['x-agentecho-signature']
    );
  });

  it('should generate different signatures for different bodies', async () => {
    const timestamp = 1703001234567;

    const result1 = await signer.sign('{"test":"data1"}', timestamp);
    const result2 = await signer.sign('{"test":"data2"}', timestamp);

    expect(result1.headers['x-agentecho-signature']).not.toBe(
      result2.headers['x-agentecho-signature']
    );
  });

  it('should use base64url encoding (no +/= characters)', async () => {
    const body = '{"test":"data"}';
    const timestamp = 1703001234567;

    const result = await signer.sign(body, timestamp);
    const signature = result.headers['x-agentecho-signature'];

    expect(signature).not.toMatch(/[+/=]/);
  });
});
