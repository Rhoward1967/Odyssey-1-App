import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    role: 'admin'
  }
};

// Mock customer data
export const mockCustomer = {
  id: 1,
  user_id: 'test-user-id',
  company_name: 'Test Company',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@test.com',
  phone: '555-0100',
  address: '123 Test St',
  billing_city: 'Test City',
  billing_state: 'TS',
  billing_zip: '12345',
  created_at: '2025-01-01T00:00:00Z'
};

// Mock bid data
export const mockBid = {
  id: 'bid-123',
  user_id: 'test-user-id',
  customer_id: 1,
  bid_number: 'BID-20250101-0001',
  title: 'Test Cleaning Service',
  description: 'Test description',
  line_items: [
    {
      name: 'Floor Cleaning',
      description: 'Deep clean all floors',
      quantity: 1,
      unit_price: 10000, // $100.00 in cents
      total: 10000
    }
  ],
  subtotal: 10000,
  tax: 800,
  total: 10800,
  status: 'draft',
  valid_until: '2025-12-31',
  created_at: '2025-01-01T00:00:00Z'
};

// Mock invoice data
export const mockInvoice = {
  id: 'invoice-123',
  user_id: 'test-user-id',
  customer_id: 1,
  invoice_number: 'INV-20250101-0001',
  title: 'Test Invoice',
  line_items: [
    {
      name: 'Service',
      quantity: 1,
      unit_price: 10000,
      total: 10000
    }
  ],
  subtotal: 10000,
  tax: 800,
  total: 10800,
  status: 'pending',
  due_date: '2025-01-31',
  created_at: '2025-01-01T00:00:00Z'
};

// Wrapper for rendering with Router
interface AllTheProvidersProps {
  children: ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Custom render function
export const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

