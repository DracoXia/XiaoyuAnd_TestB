import { describe, it, expect, beforeEach } from 'vitest';
import { createSupabaseClient, validateConfig, resetSupabaseClient, getSupabaseClient } from './supabaseClient';
import type { AnalyticsConfig } from './types';

describe('supabaseClient', () => {
  beforeEach(() => {
    resetSupabaseClient();
  });

  describe('validateConfig', () => {
    it('should return true for valid config', () => {
      const config: AnalyticsConfig = {
        supabaseUrl: 'https://my-project.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        enableDebugLogging: false,
      };

      const isValid = validateConfig(config);

      expect(isValid).toBe(true);
    });

    it('should return false for empty URL', () => {
      const config: AnalyticsConfig = {
        supabaseUrl: '',
        supabaseAnonKey: 'some-key',
        enableDebugLogging: false,
      };

      const isValid = validateConfig(config);

      expect(isValid).toBe(false);
    });

    it('should return false for empty anon key', () => {
      const config: AnalyticsConfig = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: '',
        enableDebugLogging: false,
      };

      const isValid = validateConfig(config);

      expect(isValid).toBe(false);
    });

    it('should return false for invalid URL format', () => {
      const config: AnalyticsConfig = {
        supabaseUrl: 'not-a-valid-url',
        supabaseAnonKey: 'some-key',
        enableDebugLogging: false,
      };

      const isValid = validateConfig(config);

      expect(isValid).toBe(false);
    });

    it('should return false for URL without protocol', () => {
      const config: AnalyticsConfig = {
        supabaseUrl: 'my-project.supabase.co',
        supabaseAnonKey: 'some-key',
        enableDebugLogging: false,
      };

      const isValid = validateConfig(config);

      expect(isValid).toBe(false);
    });
  });

  describe('createSupabaseClient', () => {
    it('should create a Supabase client with valid config', () => {
      const client = createSupabaseClient(
        'https://test.supabase.co',
        'test-anon-key'
      );

      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it('should throw error for empty URL', () => {
      expect(() => createSupabaseClient('', 'test-key')).toThrow(
        'Supabase URL and Key are required'
      );
    });

    it('should throw error for empty anon key', () => {
      expect(() => createSupabaseClient('https://test.supabase.co', '')).toThrow(
        'Supabase URL and Key are required'
      );
    });
  });

  describe('resetSupabaseClient', () => {
    it('should reset the singleton client', () => {
      // This test just ensures the function doesn't throw
      expect(() => resetSupabaseClient()).not.toThrow();
    });
  });

  describe('getSupabaseClient', () => {
    it('should return a client when config is valid', () => {
      resetSupabaseClient();
      const client = getSupabaseClient();

      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
      expect(client.auth).toBeDefined();
    });
  });
});
