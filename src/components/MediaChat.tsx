import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, PhoneCall, VideoOff, Mic, MicOff, Minus, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  user: string;
  content: string;
  time: string;
}

export default function MediaChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'Sarah Johnson', content: 'Welcome to the media room!', time: '10:30 AM' },
    { id: '2', user: 'Mike Chen', content: 'Great to be here!', time: '10:32 AM' },
    { id: '3', user: 'Emily Davis', content: 'Looking forward to collaborating', time: '10:35 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isPhoneCallActive, setIsPhoneCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (isVideoCallActive && isVideoOn && videoRef.current) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: isAudioOn })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = !isAudioOn;
          }
        })
        .catch(error => {
          console.warn('Camera/microphone access denied:', error);
          setIsVideoOn(false);
        });
    }
  }, [isVideoCallActive, isVideoOn, isAudioOn]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      user: 'You',
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
    setIsPhoneCallActive(false);
    const callMessage: Message = {
      id: Date.now().toString(),
      user: 'System',
      content: 'Video call started',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, callMessage]);
  };

  const startPhoneCall = () => {
    setIsPhoneCallActive(true);
    setIsVideoCallActive(false);
    const callMessage: Message = {
      id: Date.now().toString(),
      user: 'System',
      content: 'Voice call started',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, callMessage]);
  };

  const endCall = () => {
    setIsVideoCallActive(false);
    setIsPhoneCallActive(false);
    setIsVideoMinimized(false);
    setVideoPosition({ x: 0, y: 0 });
    const endMessage: Message = {
      id: Date.now().toString(),
      user: 'System',
      content: 'Call ended',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, endMessage]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setVideoPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  return (
    <div className="relative flex flex-col h-full bg-white rounded-lg border">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Media Room Chat</h3>
            <p className="text-sm text-gray-500">Connected users: {new Set(messages.map(m => m.user)).size}</p>
          </div>
          <div className="flex gap-2">
            {!isPhoneCallActive && !isVideoCallActive ? (
              <>
                <Button size="sm" variant="outline" onClick={startPhoneCall}>
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={startVideoCall}>
                  <Video className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="destructive" onClick={endCall}>
                <PhoneCall className="w-4 h-4" />
                End Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Draggable & Resizable Video Call Interface */}
      {isVideoCallActive && (
        <div 
          className={`fixed bg-black rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg z-50 cursor-move ${
            isVideoMinimized ? 'w-12 h-8' : 'w-48 h-36'
          }`}
          style={{
            left: videoPosition.x || (window.innerWidth - (isVideoMinimized ? 48 : 192) - 16),
            top: videoPosition.y || (window.innerHeight - (isVideoMinimized ? 32 : 144) - 16)
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Title Bar with Controls */}
          <div className="absolute top-0 left-0 right-0 bg-black/80 flex items-center justify-between p-1 z-10">
            <span className="text-white text-xs font-medium px-1">Video Call</span>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                className="w-4 h-4 p-0 hover:bg-white/20"
              >
                {isVideoMinimized ? <Square className="w-2 h-2 text-white" /> : <Minus className="w-2 h-2 text-white" />}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={endCall}
                className="w-4 h-4 p-0 hover:bg-red-500/50"
              >
                <X className="w-2 h-2 text-white" />
              </Button>
            </div>
          </div>

          {!isVideoMinimized && (
            <>
              {isVideoOn ? (
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gray-600 text-white">You</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1 bg-black/80 rounded-full px-2 py-1">
                  <Button size="sm" variant="ghost" onClick={() => setIsAudioOn(!isAudioOn)} className="w-6 h-6 p-0">
                    {isAudioOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-red-400" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsVideoOn(!isVideoOn)} className="w-6 h-6 p-0">
                    {isVideoOn ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-red-400" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Phone Call Interface */}
      {isPhoneCallActive && (
        <div className="p-4 border-b bg-green-50">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-800">Voice Call Active</p>
              <p className="text-sm text-green-600">Connected to media room</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsAudioOn(!isAudioOn)}>
              {isAudioOn ? <Mic className="w-4 h-4 text-green-600" /> : <MicOff className="w-4 h-4 text-red-500" />}
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback>
                {message.user === 'System' ? 'S' : message.user.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">{message.user}</span>
                <span className="text-xs text-gray-500">{message.time}</span>
              </div>
              <div className={`rounded-lg p-3 max-w-md break-words ${
                message.user === 'System' ? 'bg-blue-50 text-blue-800' : 'bg-gray-50'
              }`}>
                <p className={message.user === 'System' ? 'text-blue-800' : 'text-gray-800'}>
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="flex-shrink-0">
            <Smile className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()} className="flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}