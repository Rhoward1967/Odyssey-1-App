import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import RoomScanner from './RoomScanner';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users,
  Settings,
  Share,
  MessageSquare,
  Scan,
  Ruler
} from 'lucide-react';

interface VideoConferenceProps {
  isActive: boolean;
  onClose: () => void;
}

const VideoConference: React.FC<VideoConferenceProps> = ({ isActive, onClose }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [participants, setParticipants] = useState(['You']);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, sender: string, message: string}>>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showRoomScanner, setShowRoomScanner] = useState(false);
  const [measurementData, setMeasurementData] = useState<any>(null);
  
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleMeasurementComplete = (data: any) => {
    setMeasurementData(data);
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'Odyssey-1',
      message: `📐 Room measurements captured: ${data.roomData?.area || 'N/A'} sq ft. Data sent to AI for analysis.`
    }]);
  };

  const requestCameraPermission = async () => {
    try {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        message: '🔄 Requesting camera and microphone permissions...'
      }]);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'System',
          message: '✅ Camera and microphone access granted successfully'
        }]);
      }
    } catch (err: any) {
      console.error('Media access error:', err);
      let errorMessage = '❌ Camera access failed: ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please click the camera icon in your browser address bar and allow access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        message: errorMessage
      }]);
    }
  };

  useEffect(() => {
    if (isActive && isVideoOn) {
      requestCameraPermission();
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, isVideoOn]);

  const sendSMSNotification = async (message: string) => {
    if (!phoneNumber) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('twilio-communications', {
        body: {
          action: 'send_sms',
          to: phoneNumber,
          message: message,
          from: '+1234567890' // Your Twilio number
        }
      });

      if (error) throw error;
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        message: `SMS sent to ${phoneNumber}: ${message}`
      }]);
    } catch (error) {
      console.error('SMS failed:', error);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        message: 'SMS sending failed - check Twilio configuration'
      }]);
    }
  };

  const joinMeeting = () => {
    setIsConnected(true);
    setParticipants(['You', 'Client Representative', 'Project Manager']);
    
    // Send SMS notification if phone number provided
    if (phoneNumber) {
      sendSMSNotification(`Meeting ${meetingId} started. Join at: https://yourapp.com/meeting/${meetingId}`);
    }
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'You',
        message: chatMessage
      }]);
      setChatMessage('');
    }
  };

  const connectToZoom = () => {
    window.open('https://zoom.us/join', '_blank');
  };

  const connectToTeams = () => {
    window.open('https://teams.microsoft.com/join', '_blank');
  };

  if (!isActive) return null;

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Video Conference (Twilio Powered)
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="border-red-600 text-red-400 hover:bg-red-600/20"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SMS Notification Setup */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <h4 className="text-white font-medium mb-2">SMS Notifications</h4>
          <div className="flex space-x-2">
            <Input
              placeholder="Phone number (+1234567890)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button
              onClick={() => sendSMSNotification('Test message from video conference')}
              disabled={!phoneNumber}
              size="sm"
            >
              Test SMS
            </Button>
          </div>
        </div>

        {/* External Service Integration */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={connectToZoom}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Join Zoom Meeting
          </Button>
          <Button
            onClick={connectToTeams}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Join Teams Meeting
          </Button>
        </div>

        {/* Meeting ID Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Enter Meeting ID..."
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <Button
            onClick={joinMeeting}
            disabled={!meetingId}
            className="bg-green-600 hover:bg-green-700"
          >
            Join & Notify
          </Button>
        </div>

        {/* Video Display */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700 rounded-lg h-32 flex items-center justify-center">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <VideoOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Camera Off</p>
                </div>
              )}
            </div>
            <div className="bg-slate-700 rounded-lg h-32 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Participant View</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              size="sm"
              variant={isVideoOn ? "default" : "outline"}
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={isVideoOn ? "bg-slate-600" : "border-slate-600"}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={isAudioOn ? "default" : "outline"}
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={isAudioOn ? "bg-slate-600" : "border-slate-600"}
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm" 
              variant="outline" 
              className="border-slate-600"
              onClick={() => setShowRoomScanner(!showRoomScanner)}
            >
              <Scan className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600">
              <Share className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Scanner Integration */}
        {showRoomScanner && (
          <RoomScanner
            isActive={showRoomScanner}
            onClose={() => setShowRoomScanner(false)}
            onMeasurementComplete={handleMeasurementComplete}
          />
        )}
        {/* Participants */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Participants ({participants.length})
          </h4>
          <div className="space-y-1">
            {participants.map((participant, index) => (
              <div key={index} className="text-slate-300 text-sm flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {participant}
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat & SMS Log
          </h4>
          <div className="h-24 overflow-y-auto mb-2 space-y-1">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="text-purple-400 font-medium">{msg.sender}:</span>
                <span className="text-slate-300 ml-2">{msg.message}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              className="bg-slate-700 border-slate-600 text-white text-sm"
            />
            <Button size="sm" onClick={sendChatMessage}>
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoConference;