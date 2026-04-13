import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Authentication Logic', () => {

  test('should hash a password correctly', async () => {
    const password = 'TestPass123!';
    const hashed = await bcrypt.hash(password, 10);
    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(20);
  });

  test('should verify correct password against hash', async () => {
    const password = 'TestPass123!';
    const hashed = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hashed);
    expect(match).toBe(true);
  });

  test('should reject wrong password against hash', async () => {
    const password = 'TestPass123!';
    const hashed = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare('WrongPassword!', hashed);
    expect(match).toBe(false);
  });

  test('should generate a valid JWT token', () => {
    const payload = { _id: '123', userType: 'creator' };
    const secret = 'test_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('should verify a valid JWT token', () => {
    const payload = { _id: '123', userType: 'investor' };
    const secret = 'test_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    const decoded = jwt.verify(token, secret);
    expect(decoded._id).toBe('123');
    expect(decoded.userType).toBe('investor');
  });

  test('should reject an invalid JWT token', () => {
    expect(() => {
      jwt.verify('invalid.token.here', 'test_secret');
    }).toThrow();
  });

  test('should reject an expired JWT token', () => {
    const payload = { _id: '123' };
    const token = jwt.sign(payload, 'test_secret', { expiresIn: '-1s' });
    expect(() => {
      jwt.verify(token, 'test_secret');
    }).toThrow();
  });

});