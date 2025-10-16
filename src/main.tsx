import { Elements } from '@stripe/react-stripe-js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ArchitectProvider } from './components/ArchitectRecognitionSystem';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getStripe } from './config/stripe';
import './index.css';

const stripePromise = getStripe();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ArchitectProvider>
        <AuthProvider>
          <Elements stripe={stripePromise}>
            <App />
          </Elements>
        </AuthProvider>
      </ArchitectProvider>
    </ErrorBoundary>
  </StrictMode>
);
