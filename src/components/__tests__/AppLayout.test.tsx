import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../AppLayout';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AppLayout', () => {
  test('renders without crashing', () => {
    renderWithRouter(<AppLayout />);
  });

  test('renders navigation', () => {
    renderWithRouter(<AppLayout />);
    // Add specific navigation tests based on your AppLayout component
  });
});