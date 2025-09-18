import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Scan, Ruler, CheckCircle, AlertCircle } from 'lucide-react';

interface MeasurementData {
  roomName: string;
  width: number;
  length: number;
  height: number;
  area: number;
  volume: number;
  confidence: number;
  obstacles: string[];
  cleaningDifficulty: 'Low' | 'Medium' | 'High';
}

interface CameraMeasurementAIProps {
  onMeasurementComplete?: (measurements: MeasurementData[]) => void;
}

export default function CameraMeasurementAI({ onMeasurementComplete }: CameraMeasurementAIProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [currentRoom, setCurrentRoom] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  const scanRoom = async () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    
    // Simulate AI measurement processing
    setTimeout(() => {
      const mockMeasurement: MeasurementData = {
        roomName: currentRoom || `Room ${measurements.length + 1}`,
        width: Math.round((Math.random() * 20 + 8) * 100) / 100,
        length: Math.round((Math.random() * 25 + 10) * 100) / 100,
        height: Math.round((Math.random() * 4 + 8) * 100) / 100,
        area: 0,
        volume: 0,
        confidence: Math.round((Math.random() * 20 + 80) * 100) / 100,
        obstacles: [
          'Furniture',
          'Equipment',
          'Cables',
          'Storage units'
        ].filter(() => Math.random() > 0.5),
        cleaningDifficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High'
      };

      mockMeasurement.area = Math.round(mockMeasurement.width * mockMeasurement.length * 100) / 100;
      mockMeasurement.volume = Math.round(mockMeasurement.area * mockMeasurement.height * 100) / 100;

      const newMeasurements = [...measurements, mockMeasurement];
      setMeasurements(newMeasurements);
      setIsScanning(false);
      setCurrentRoom('');
      
      onMeasurementComplete?.(newMeasurements);
    }, 3000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalArea = measurements.reduce((sum, m) => sum + m.area, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Measurement AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ display: cameraActive ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ display: 'none' }}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Camera not active</p>
                </div>
              </div>
            )}
            {isScanning && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <div className="text-white text-center">
                  <Scan className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                  <p>Scanning room...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room name (optional)"
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            {!cameraActive ? (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button 
                  onClick={scanRoom} 
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Scan className="h-4 w-4" />
                  {isScanning ? 'Scanning...' : 'Scan Room'}
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Stop Camera
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {measurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Measurement Results
              <Badge variant="secondary">{measurements.length} rooms</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {measurements.map((measurement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{measurement.roomName}</h4>
                    <div className="space-y-2 text-sm">
                      <div>Dimensions: {measurement.width}' × {measurement.length}' × {measurement.height}'</div>
                      <div>Area: {measurement.area} sq ft</div>
                      <div>Volume: {measurement.volume} cu ft</div>
                      <div className="flex items-center gap-2">
                        <span>Confidence:</span>
                        {measurement.confidence > 90 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>{measurement.confidence}%</span>
                      </div>
                      <div>
                        <Badge className={getDifficultyColor(measurement.cleaningDifficulty)}>
                          {measurement.cleaningDifficulty} Difficulty
                        </Badge>
                      </div>
                      {measurement.obstacles.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Obstacles:</div>
                          <div className="flex flex-wrap gap-1">
                            {measurement.obstacles.map((obstacle, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {obstacle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Area:</span>
                  <span className="text-lg font-bold">{Math.round(totalArea)} sq ft</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}