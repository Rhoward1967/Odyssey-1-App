import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './components/AuthProvider'
import { ArchitectProvider } from './components/ArchitectRecognitionSystem'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ArchitectProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ArchitectProvider>
    </ErrorBoundary>
  </StrictMode>,
)