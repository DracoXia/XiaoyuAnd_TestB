import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './userService';
import type { User } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-1234'),
  },
});

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    userService = new UserService();
  });

  describe('getOrCreateUser', () => {
    it('should create a new user when no existing user found', async () => {
      const user = await userService.getOrCreateUser();

      expect(user).toBeDefined();
      expect(user.deviceId).toBe('test-uuid-1234');
      expect(user.id).toBe('test-uuid-1234');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return existing user when one exists', async () => {
      // First call creates user
      const firstUser = await userService.getOrCreateUser();

      // Reset mocks but keep localStorage state
      vi.clearAllMocks();

      // Second call should return existing user
      const secondUser = await userService.getOrCreateUser();

      expect(secondUser.deviceId).toBe(firstUser.deviceId);
      expect(secondUser.id).toBe(firstUser.id);
      // Should not create new user
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should persist user across service instances', async () => {
      const firstService = new UserService();
      const firstUser = await firstService.getOrCreateUser();

      // Create new service instance
      const secondService = new UserService();
      const secondUser = await secondService.getOrCreateUser();

      expect(secondUser.deviceId).toBe(firstUser.deviceId);
      expect(secondUser.id).toBe(firstUser.id);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user exists', () => {
      const user = userService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return user after getOrCreateUser is called', async () => {
      await userService.getOrCreateUser();
      const user = userService.getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.deviceId).toBe('test-uuid-1234');
    });
  });

  describe('updateLastActiveAt', () => {
    it('should update lastActiveAt timestamp', async () => {
      const user = await userService.getOrCreateUser();
      const originalTime = user.lastActiveAt;

      // Wait a tiny bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await userService.updateLastActiveAt();

      const updatedUser = userService.getCurrentUser();
      expect(updatedUser?.lastActiveAt.getTime()).toBeGreaterThan(originalTime.getTime());
    });

    it('should do nothing if no user exists', async () => {
      // Should not throw
      await expect(userService.updateLastActiveAt()).resolves.not.toThrow();
    });
  });

  describe('generateDeviceId', () => {
    it('should call crypto.randomUUID', () => {
      userService.generateDeviceId();
      expect(crypto.randomUUID).toHaveBeenCalled();
    });

    it('should generate unique IDs', () => {
      let callCount = 0;
      vi.mocked(crypto.randomUUID).mockImplementation(() => `uuid-${++callCount}`);

      const id1 = userService.generateDeviceId();
      const id2 = userService.generateDeviceId();

      expect(id1).not.toBe(id2);
    });
  });
});
