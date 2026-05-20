import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock Supabase client globally for all tests.
// NOTE: vitest config has mockReset: true which wipes vi.fn() implementations
// between tests. The beforeEach below re-applies the default behaviors so
// components like DisclaimerGate that await supabase.auth.getUser() always
// receive { data: { user: null } } unless a specific test overrides it.
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

beforeEach(() => {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      order:  vi.fn().mockResolvedValue({ data: [], error: null }),
      limit:  vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq:     vi.fn().mockReturnThis(),
      gte:    vi.fn().mockReturnThis(),
      lte:    vi.fn().mockReturnThis(),
    })),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: [], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [], error: null }),
  } as any);
  vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any);
  vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null } as any);
  vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as any);
  vi.mocked(supabase.auth.signIn).mockResolvedValue({ data: null, error: null } as any);
  vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any);
  vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: null, error: null } as any);
});

// Mock IntersectionObserver for testing components that use it
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();