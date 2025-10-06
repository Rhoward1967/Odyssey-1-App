
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './components/AuthProvider';
import { ArchitectProvider } from './components/ArchitectRecognitionSystem';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from './config/stripe';

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
  </StrictMode>,
)