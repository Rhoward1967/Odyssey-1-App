import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Users, MessageCircle, Share2, Eye, Zap } from 'lucide-react';

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'typing' | 'idle';
  lastSeen: string;
}

interface SharedConversation {
  id: string;
  title: string;
  participants: string[];
  messages: any[];
  createdAt: string;
  isActive: boolean;
}

interface RealtimeCollaborationProps {
  onJoinSession?: (sessionId: string) => void;
  onCreateSession?: () => void;
}

const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  onJoinSession,
  onCreateSession
}) => {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      avatar: '👩‍🔬',
      status: 'online',
      lastSeen: 'now'
    },
    {
      id: '2', 
      name: 'Prof. Marcus Webb',
      avatar: '👨‍💼',
      status: 'typing',
      lastSeen: '2 min ago'
    }
  ]);

  const [sharedSessions, setSharedSessions] = useState<SharedConversation[]>([
    {
      id: 'session_1',
      title: 'Quantum AI Research Project',
      participants: ['Dr. Sarah Chen', 'Prof. Marcus Webb', 'You'],
      messages: [],
      createdAt: '2024-01-15',
      isActive: true
    }
  ]);

  const [sessionCode, setSessionCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        status: Math.random() > 0.7 ? 'typing' : 'online'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateSession = () => {
    const newSession: SharedConversation = {
      id: `session_${Date.now()}`,
      title: `Research Session ${sharedSessions.length + 1}`,
      participants: ['You'],
      messages: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true
    };
    
    setSharedSessions(prev => [...prev, newSession]);
    onCreateSession?.();
  };

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      onJoinSession?.(sessionCode);
      setIsConnected(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Collaboration Status */}
      <Card className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 border-blue-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Real-time Collaboration Hub
            <Badge variant="outline" className="text-green-400 border-green-400">
              {activeUsers.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Users */}
            <div className="space-y-3">
              <h4 className="text-blue-300 font-semibold">Online Collaborators</h4>
              <div className="space-y-2">
                {activeUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-slate-400 text-sm">{user.lastSeen}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.status === 'typing' && (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                      )}
                      <Badge variant={user.status === 'online' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Controls */}
            <div className="space-y-4">
              <h4 className="text-purple-300 font-semibold">Session Management</h4>
              
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter session code"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                  <Button onClick={handleJoinSession} size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                </div>
                
                <Button onClick={handleCreateSession} className="w-full bg-purple-600 hover:bg-purple-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Create New Session
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Sessions */}
      <Card className="bg-gradient-to-r from-green-800/30 to-emerald-800/30 border-green-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Shared Research Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sharedSessions.map(session => (
              <div key={session.id} className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{session.title}</h4>
                  <Badge variant={session.isActive ? 'default' : 'secondary'}>
                    {session.isActive ? 'Active' : 'Archived'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-300">
                    <span className="mr-4">👥 {session.participants.length} participants</span>
                    <span>📅 {session.createdAt}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-green-500 text-green-300">
                      <Zap className="w-3 h-3 mr-1" />
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeCollaboration;