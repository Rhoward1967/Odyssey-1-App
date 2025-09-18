import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, BluetoothConnected, Headphones, Speaker, Loader2, AlertCircle } from 'lucide-react';

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  type: 'speaker' | 'headphones' | 'unknown';
}

interface BluetoothAudioManagerProps {
  onDeviceConnect?: (device: BluetoothDevice) => void;
  onDeviceDisconnect?: (device: BluetoothDevice) => void;
}

export default function BluetoothAudioManager({ 
  onDeviceConnect, 
  onDeviceDisconnect 
}: BluetoothAudioManagerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Web Bluetooth API is supported
    if ('bluetooth' in navigator) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const scanForDevices = async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth not supported in this browser');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Request Bluetooth device with audio services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['battery_service'] },
          { services: [0x180F] }, // Battery Service
          { namePrefix: 'AirPods' },
          { namePrefix: 'Sony' },
          { namePrefix: 'Bose' },
          { namePrefix: 'JBL' },
          { namePrefix: 'Beats' }
        ],
        optionalServices: [
          'battery_service',
          'device_information'
        ],
        acceptAllDevices: false
      });

      if (device) {
        const bluetoothDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          connected: false,
          type: getDeviceType(device.name || '')
        };

        setAvailableDevices(prev => [...prev, bluetoothDevice]);
      }
    } catch (error: any) {
      console.error('Bluetooth scan error:', error);
      setError(error.message || 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      // In a real implementation, you would connect to the device here
      // For now, we'll simulate the connection
      const updatedDevice = { ...device, connected: true };
      
      setConnectedDevices(prev => [...prev, updatedDevice]);
      setAvailableDevices(prev => prev.filter(d => d.id !== device.id));
      
      if (onDeviceConnect) {
        onDeviceConnect(updatedDevice);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(`Failed to connect to ${device.name}`);
    }
  };

  const disconnectDevice = (device: BluetoothDevice) => {
    const updatedDevice = { ...device, connected: false };
    
    setConnectedDevices(prev => prev.filter(d => d.id !== device.id));
    setAvailableDevices(prev => [...prev, updatedDevice]);
    
    if (onDeviceDisconnect) {
      onDeviceDisconnect(updatedDevice);
    }
  };

  const getDeviceType = (name: string): 'speaker' | 'headphones' | 'unknown' => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('airpods') || lowerName.includes('headphones') || 
        lowerName.includes('buds') || lowerName.includes('beats')) {
      return 'headphones';
    } else if (lowerName.includes('speaker') || lowerName.includes('soundbar') || 
               lowerName.includes('boom') || lowerName.includes('jbl')) {
      return 'speaker';
    }
    return 'unknown';
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'headphones':
        return <Headphones className="w-4 h-4" />;
      case 'speaker':
        return <Speaker className="w-4 h-4" />;
      default:
        return <Bluetooth className="w-4 h-4" />;
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-yellow-700">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Bluetooth not supported</p>
              <p className="text-sm">Your browser doesn't support Web Bluetooth API.</p>
              <p className="text-xs mt-1">Try Chrome or Edge for Bluetooth support.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BluetoothConnected className="w-5 h-5 text-blue-600" />
            <span>Bluetooth Audio</span>
          </div>
          <Button
            onClick={scanForDevices}
            disabled={isScanning}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Bluetooth className="w-4 h-4 mr-2" />
            )}
            {isScanning ? 'Scanning...' : 'Scan'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <div>
            <h4 className="font-medium text-green-800 mb-2">Connected Devices</h4>
            <div className="space-y-2">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <p className="font-medium text-green-800">{device.name}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        Connected
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => disconnectDevice(device)}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Devices */}
        {availableDevices.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Available Devices</h4>
            <div className="space-y-2">
              {availableDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <p className="font-medium text-gray-800">{device.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {device.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => connectToDevice(device)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-100 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">How to use Bluetooth Audio:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Make sure your Bluetooth device is in pairing mode</li>
            <li>2. Click "Scan" to search for nearby audio devices</li>
            <li>3. Select your device from the list and click "Connect"</li>
            <li>4. Audio from Odyssey-1 will now play through your device</li>
          </ul>
        </div>

        {/* Browser Compatibility */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Bluetooth audio requires Chrome or Edge browser and HTTPS connection.
            Some devices may not be compatible with Web Bluetooth API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}