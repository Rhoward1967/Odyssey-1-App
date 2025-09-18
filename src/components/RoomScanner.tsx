import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, Scan, Square, Ruler, Upload, X } from 'lucide-react';

interface MeasurementData {
  id: string;
  roomName: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  squareFootage: number;
  imageUrl: string;
  timestamp: Date;
}

interface RoomScannerProps {
  onMeasurementComplete: (measurements: MeasurementData[]) => void;
}

const RoomScanner: React.FC<RoomScannerProps> = ({ onMeasurementComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [currentRoom, setCurrentRoom] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access required for room scanning');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const captureAndMeasure = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !currentRoom) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Simulate AI measurement processing
    const mockMeasurement: MeasurementData = {
      id: Date.now().toString(),
      roomName: currentRoom,
      dimensions: {
        length: Math.round((Math.random() * 20 + 10) * 100) / 100,
        width: Math.round((Math.random() * 15 + 8) * 100) / 100,
        height: Math.round((Math.random() * 3 + 8) * 100) / 100,
      },
      squareFootage: 0,
      imageUrl: canvas.toDataURL('image/jpeg', 0.8),
      timestamp: new Date()
    };

    mockMeasurement.squareFootage = Math.round(
      mockMeasurement.dimensions.length * mockMeasurement.dimensions.width
    );

    setMeasurements(prev => [...prev, mockMeasurement]);
    setCurrentRoom('');
  }, [currentRoom]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentRoom) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const mockMeasurement: MeasurementData = {
        id: Date.now().toString(),
        roomName: currentRoom,
        dimensions: {
          length: Math.round((Math.random() * 20 + 10) * 100) / 100,
          width: Math.round((Math.random() * 15 + 8) * 100) / 100,
          height: Math.round((Math.random() * 3 + 8) * 100) / 100,
        },
        squareFootage: 0,
        imageUrl: e.target?.result as string,
        timestamp: new Date()
      };

      mockMeasurement.squareFootage = Math.round(
        mockMeasurement.dimensions.length * mockMeasurement.dimensions.width
      );

      setMeasurements(prev => [...prev, mockMeasurement]);
      setCurrentRoom('');
    };
    reader.readAsDataURL(file);
  }, [currentRoom]);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const finalizeMeasurements = useCallback(() => {
    onMeasurementComplete(measurements);
    stopCamera();
  }, [measurements, onMeasurementComplete, stopCamera]);

  const totalSquareFootage = measurements.reduce((sum, m) => sum + m.squareFootage, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          Room Scanner & Measurement Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter room name (e.g., Main Office, Lobby)"
            value={currentRoom}
            onChange={(e) => setCurrentRoom(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={startCamera} disabled={isScanning || !currentRoom} className="bg-blue-600 hover:bg-blue-700">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
          
          <Button onClick={() => fileInputRef.current?.click()} disabled={!currentRoom} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
          
          {isScanning && (
            <Button onClick={captureAndMeasure} className="bg-green-600 hover:bg-green-700">
              <Scan className="w-4 h-4 mr-2" />
              Scan & Measure
            </Button>
          )}
          
          {isScanning && (
            <Button onClick={stopCamera} variant="destructive">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {isScanning && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 border-2 border-blue-500 border-dashed opacity-50"></div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              Position device to capture room corners
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {measurements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Measured Rooms</h3>
              <Badge variant="outline" className="text-slate-300">
                Total: {totalSquareFootage} sq ft
              </Badge>
            </div>
            
            {measurements.map((measurement) => (
              <div key={measurement.id} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-200">{measurement.roomName}</h4>
                  <Button
                    onClick={() => removeMeasurement(measurement.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Ruler className="w-3 h-3" />
                      Dimensions
                    </div>
                    <div className="text-slate-300">
                      {measurement.dimensions.length}' × {measurement.dimensions.width}' × {measurement.dimensions.height}'
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Square className="w-3 h-3" />
                      Square Footage
                    </div>
                    <div className="text-slate-300 font-medium">
                      {measurement.squareFootage} sq ft
                    </div>
                  </div>
                </div>
                
                <img
                  src={measurement.imageUrl}
                  alt={measurement.roomName}
                  className="w-full h-24 object-cover rounded mt-2"
                />
              </div>
            ))}
            
            <Button
              onClick={finalizeMeasurements}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Use These Measurements ({totalSquareFootage} sq ft total)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomScanner;