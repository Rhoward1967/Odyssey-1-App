import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface CameraPermissionHelperProps {
  onPermissionGranted: (stream: MediaStream) => void;
  onPermissionDenied: (error: string) => void;
}

export const CameraPermissionHelper: React.FC<CameraPermissionHelperProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const requestPermission = async () => {
    setPermissionStatus('requesting');
    setErrorMessage('');

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      setPermissionStatus('granted');
      onPermissionGranted(stream);
    } catch (error: any) {
      setPermissionStatus('denied');
      let message = 'Camera access failed: ';
      
      switch (error.name) {
        case 'NotAllowedError':
          message += 'Permission denied. Please allow camera access and try again.';
          break;
        case 'NotFoundError':
          message += 'No camera found. Please connect a camera.';
          break;
        case 'NotReadableError':
          message += 'Camera is being used by another application.';
          break;
        case 'OverconstrainedError':
          message += 'Camera constraints not supported.';
          break;
        case 'SecurityError':
          message += 'Security error. Please use HTTPS.';
          break;
        default:
          message += error.message || 'Unknown error occurred.';
      }
      
      setErrorMessage(message);
      onPermissionDenied(message);
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'requesting':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Camera className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (permissionStatus) {
      case 'requesting':
        return 'Requesting camera permission...';
      case 'granted':
        return 'Camera access granted!';
      case 'denied':
        return 'Camera access denied';
      default:
        return 'Camera permission required';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Camera Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </p>

        {permissionStatus === 'denied' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {permissionStatus === 'idle' && (
          <div className="space-y-2">
            <p className="text-sm">
              Click below to enable camera and microphone access for video calls.
            </p>
            <Button onClick={requestPermission} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="space-y-2">
            <p className="text-sm">
              To fix this:
            </p>
            <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Click the camera icon in your browser's address bar</li>
              <li>• Select "Allow" for camera and microphone</li>
              <li>• Refresh the page if needed</li>
            </ul>
            <Button onClick={requestPermission} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};