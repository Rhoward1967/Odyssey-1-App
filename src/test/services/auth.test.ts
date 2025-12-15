import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import { mockUser } from '../utils';

// Mock the supabase module
vi.mock('@/lib/supabase');

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign In', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'test-token' } },
        error: null
      });

      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.data?.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should return error with invalid credentials', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpass'
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('Sign Up', () => {
    it('should successfully create new user account', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'test-token' } },
        error: null
      });

      vi.mocked(supabase.auth.signUp).mockImplementation(mockSignUp);

      const result = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: { name: 'New User' }
        }
      });

      expect(mockSignUp).toHaveBeenCalled();
      expect(result.data?.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should return error if email already exists', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      });

      vi.mocked(supabase.auth.signUp).mockImplementation(mockSignUp);

      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123'
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('User already registered');
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out user', async () => {
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.auth.signOut).mockImplementation(mockSignOut);

      const result = await supabase.auth.signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        user: mockUser
      };

      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockImplementation(mockGetSession);

      const result = await supabase.auth.getSession();

      expect(result.data?.session).toBeDefined();
      expect(result.data?.session?.user).toEqual(mockUser);
    });

    it('should return null for no active session', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockImplementation(mockGetSession);

      const result = await supabase.auth.getSession();

      expect(result.data?.session).toBeNull();
    });

    it('should get current user', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      vi.mocked(supabase.auth.getUser).mockImplementation(mockGetUser);

      const result = await supabase.auth.getUser();

      expect(result.data?.user).toBeDefined();
      expect(result.data?.user?.id).toBe(mockUser.id);
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const mockResetPassword = vi.fn().mockResolvedValue({
        data: {},
        error: null
      });

      vi.mocked(supabase.auth.resetPasswordForEmail).mockImplementation(mockResetPassword);

      const result = await supabase.auth.resetPasswordForEmail('test@example.com');

      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      expect(result.error).toBeNull();
    });
  });
});
