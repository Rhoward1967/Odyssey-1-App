import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Settings, Share, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isHost: boolean;
}

export default function VideoConferenceRoom() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'You', isVideoOn: true, isAudioOn: true, isHost: true },
    { id: '2', name: 'Sarah Johnson', isVideoOn: true, isAudioOn: true, isHost: false },
    { id: '3', name: 'Mike Chen', isVideoOn: false, isAudioOn: true, isHost: false },
    { id: '4', name: 'Emily Davis', isVideoOn: true, isAudioOn: false, isHost: false },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize camera with error handling
    if (isVideoOn && videoRef.current) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(error => {
          console.warn('Camera access denied or not available:', error);
          setIsVideoOn(false); // Gracefully disable video if permission denied
        });
    }
  }, [isVideoOn]);

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const endCall = () => {
    // Handle ending the call
    console.log('Ending call...');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Media Room Conference</h3>
          <Badge variant="secondary" className="bg-green-600">
            <Users className="w-3 h-3 mr-1" />
            {participants.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Main Video */}
          <div className="h-full bg-gray-800 relative">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarFallback className="text-2xl bg-gray-600">
                      {participants[0].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-lg">{participants[0].name}</p>
                  <p className="text-sm text-gray-400">Camera is off</p>
                </div>
              </div>
            )}

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-sm">
                Sharing Screen
              </div>
            )}

            {/* Participant Grid Overlay */}
            <div className="absolute bottom-4 right-4 grid grid-cols-2 gap-2 max-w-xs">
              {participants.slice(1).map((participant) => (
                <div key={participant.id} className="relative">
                  <div className="w-32 h-24 bg-gray-700 rounded-lg overflow-hidden">
                    {participant.isVideoOn ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-gray-600">
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 left-1 text-xs bg-black/50 px-1 rounded">
                    {participant.name.split(' ')[0]}
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1">
                    {!participant.isAudioOn && (
                      <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                        <MicOff className="w-2 h-2" />
                      </div>
                    )}
                    {participant.isHost && (
                      <div className="w-4 h-4 bg-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-xs">H</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                size="sm"
                variant={isAudioOn ? "secondary" : "destructive"}
                onClick={toggleAudio}
                className="rounded-full w-12 h-12"
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              
              <Button
                size="sm"
                variant={isVideoOn ? "secondary" : "destructive"}
                onClick={toggleVideo}
                className="rounded-full w-12 h-12"
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                size="sm"
                variant={isScreenSharing ? "default" : "secondary"}
                onClick={toggleScreenShare}
                className="rounded-full w-12 h-12"
              >
                <Share className="w-5 h-5" />
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={endCall}
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h4 className="font-medium">Meeting Chat</h4>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-blue-400">Sarah:</span>
                  <span className="ml-2">Great presentation!</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-green-400">Mike:</span>
                  <span className="ml-2">Can you share the slides?</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <Button size="sm">Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}