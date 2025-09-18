import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Settings, Share, MessageSquare, Minimize2, Maximize2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AIResearchAssistant from './AIResearchAssistant';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isHost: boolean;
}

export default function EnhancedVideoConference() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sarah', message: 'Need help with question 3?', color: 'blue' },
    { id: 2, sender: 'Mike', message: 'I\'m working on the same assignment', color: 'green' },
    { id: 3, sender: 'You', message: 'Thanks! Let me know if you figure it out', color: 'purple' }
  ]);
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'You', isVideoOn: true, isAudioOn: true, isHost: true },
    { id: '2', name: 'Sarah Johnson', isVideoOn: true, isAudioOn: true, isHost: false },
    { id: '3', name: 'Mike Chen', isVideoOn: false, isAudioOn: true, isHost: false },
    { id: '4', name: 'Emily Davis', isVideoOn: true, isAudioOn: false, isHost: false },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideoOn && videoRef.current) {
      navigator.mediaDevices?.getUserMedia({ 
        video: true, 
        audio: isAudioOn // Enable audio based on state
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Don't mute if audio is enabled
            videoRef.current.muted = !isAudioOn;
          }
        })
        .catch(error => {
          console.warn('Camera/microphone access denied or not available:', error);
          setIsVideoOn(false);
          setIsAudioOn(false);
        });
    }
  }, [isVideoOn, isAudioOn]);

  const toggleStudyMode = () => {
    setIsStudyMode(!isStudyMode);
    if (!isStudyMode) {
      setShowChat(true); // Auto-show chat in study mode
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'You',
        message: chatMessage,
        color: 'purple'
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const saveNote = () => {
    if (chatMessage.trim()) {
      // Save as note functionality
      console.log('Note saved:', chatMessage);
      setChatMessage('');
    }
  };
  // Study Mode Layout - Mobile-First Block Stack Design
  if (isStudyMode) {
    return (
      <div className="h-full bg-gray-50">
        {/* Fixed Header */}
        <div className="bg-white border-b p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">AI Study Session</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                {participants.length}
              </Badge>
              <Button size="sm" variant="outline" onClick={toggleStudyMode}>
                <Maximize2 className="w-4 h-4 mr-1" />
                Full Video
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile-First Block Stack Layout */}
        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          <div className="p-4 space-y-4">
            
            {/* Video Section - Full Width Block */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-900 mb-3">Video Call</h4>
              <div className="w-full h-48 bg-gray-900 rounded-lg overflow-hidden relative">
                {isVideoOn ? (
                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gray-600 text-white">
                        {participants[0].name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                {/* Video Controls */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-black/70 rounded-full px-3 py-1">
                    <Button size="sm" variant="ghost" onClick={() => setIsAudioOn(!isAudioOn)} className="w-8 h-8 p-0 hover:bg-white/20">
                      {isAudioOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-red-400" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsVideoOn(!isVideoOn)} className="w-8 h-8 p-0 hover:bg-white/20">
                      {isVideoOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Bot - Full Width Block */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-900 mb-3">AI Research Assistant</h4>
              <div className="border rounded-lg bg-gray-50">
                <div className="h-64 overflow-y-auto p-4">
                  <AIResearchAssistant 
                    onInsertText={(text) => setChatMessage(prev => prev + (prev ? '\n\n' : '') + text)}
                  />
                </div>
              </div>
            </div>

            {/* Notes Section - Full Width Block */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-900 mb-3">Quick Notes</h4>
              <textarea 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Jot down notes during your study session..."
                className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Chat Messages - Full Width Block */}
            {chatMessages.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-900 mb-3">Recent Chat</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {chatMessages.slice(-5).map((msg) => (
                    <div key={msg.id} className="text-sm p-2 bg-gray-50 rounded break-words">
                      <span className={`font-medium text-${msg.color}-600`}>{msg.sender}:</span>
                      <span className="ml-2 text-gray-700">{msg.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Area - Sticky Bottom */}
        <div className="bg-white border-t p-4 sticky bottom-0 z-40">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h4 className="font-medium text-gray-900">AI-Enhanced Input</h4>
              <Badge variant="outline" className="text-xs">Real-time</Badge>
            </div>
            
            <div className="relative">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type anything - AI will analyze and assist..."
                className="w-full h-16 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                  📷 Capture
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                  📁 Upload
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 px-4 text-xs"
                  onClick={() => {
                    if (chatMessage.trim()) {
                      console.log('AI analyzing:', chatMessage);
                      setChatMessage('');
                    }
                  }}
                  disabled={!chatMessage.trim()}
                >
                  🤖 AI Analyze
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 px-4 text-xs"
                  onClick={sendMessage}
                  disabled={!chatMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular full-screen video conference mode
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
          <Button size="sm" variant="ghost" onClick={toggleStudyMode} title="Study Mode">
            <Minimize2 className="w-4 h-4 mr-1" />
            Study Mode
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area - same as original */}
        <div className="flex-1 relative">
          <div className="h-full bg-gray-800 relative">
            {isVideoOn ? (
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
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

            {/* Participant Grid - Repositioned to bottom right, smaller size */}
            <div className="absolute bottom-20 right-4 flex flex-wrap gap-1 max-w-[160px] z-10">
              {participants.slice(1).map((participant) => (
                <div key={participant.id} className="relative">
                  <div className="w-16 h-12 bg-gray-700 rounded-md overflow-hidden border border-gray-600">
                    {participant.isVideoOn ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs bg-gray-600">{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-xs bg-black/70 px-1 py-0.5 text-center text-white truncate">
                    {participant.name.split(' ')[0]}
                  </div>
                  {/* Status indicators */}
                  <div className="absolute top-0.5 right-0.5 flex gap-0.5">
                    {!participant.isAudioOn && (
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center">
                        <MicOff className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                    {!participant.isVideoOn && (
                      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full flex items-center justify-center">
                        <VideoOff className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls - Positioned with higher z-index, moved up to avoid participant overlap */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex items-center gap-3 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <Button size="sm" variant={isAudioOn ? "secondary" : "destructive"} onClick={() => setIsAudioOn(!isAudioOn)} className="rounded-full w-12 h-12">
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button size="sm" variant={isVideoOn ? "secondary" : "destructive"} onClick={() => setIsVideoOn(!isVideoOn)} className="rounded-full w-12 h-12">
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button size="sm" variant="destructive" className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700">
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
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className={`font-medium text-${msg.color}-400`}>{msg.sender}:</span>
                    <span className="ml-2">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button size="sm" onClick={sendMessage} disabled={!chatMessage.trim()}>Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}