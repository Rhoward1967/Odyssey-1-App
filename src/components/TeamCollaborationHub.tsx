import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, MessageCircle, Video, Share2, Calendar, Bell, Settings, Plus } from 'lucide-react';

export default function TeamCollaborationHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');

  const teamMembers = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      role: 'Lead Researcher',
      avatar: '👩‍🔬',
      status: 'online',
      lastActive: 'now',
      projects: 3,
      contributions: 45
    },
    {
      id: '2',
      name: 'Prof. Marcus Webb',
      role: 'Data Scientist',
      avatar: '👨‍💼',
      status: 'away',
      lastActive: '5 min ago',
      projects: 2,
      contributions: 32
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      role: 'Research Analyst',
      avatar: '👩‍💻',
      status: 'online',
      lastActive: 'now',
      projects: 4,
      contributions: 28
    }
  ];

  const activeProjects = [
    {
      id: '1',
      title: 'Quantum AI Research Initiative',
      participants: ['Dr. Sarah Chen', 'Prof. Marcus Webb'],
      progress: 75,
      lastUpdate: '2 hours ago',
      status: 'active',
      messages: 23
    },
    {
      id: '2',
      title: 'Machine Learning Ethics Study',
      participants: ['Dr. Emily Rodriguez', 'Dr. Sarah Chen'],
      progress: 45,
      lastUpdate: '1 day ago',
      status: 'active',
      messages: 12
    },
    {
      id: '3',
      title: 'Neural Network Optimization',
      participants: ['Prof. Marcus Webb'],
      progress: 90,
      lastUpdate: '3 hours ago',
      status: 'review',
      messages: 8
    }
  ];

  const recentActivity = [
    {
      user: 'Dr. Sarah Chen',
      action: 'shared research findings',
      project: 'Quantum AI Research',
      time: '10 min ago',
      type: 'share'
    },
    {
      user: 'Prof. Marcus Webb',
      action: 'commented on document',
      project: 'ML Ethics Study',
      time: '1 hour ago',
      type: 'comment'
    },
    {
      user: 'Dr. Emily Rodriguez',
      action: 'uploaded new dataset',
      project: 'Neural Network Optimization',
      time: '2 hours ago',
      type: 'upload'
    }
  ];

  const handleInviteTeamMember = () => {
    if (inviteEmail.trim()) {
      console.log('Inviting:', inviteEmail);
      setInviteEmail('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Collaboration Hub
          </CardTitle>
          <p className="text-purple-100">
            Coordinate research projects, share findings, and collaborate in real-time
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{activeProjects.length}</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">43</div>
                <div className="text-sm text-gray-600">Shared Documents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">156</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span> {activity.action} in{' '}
                        <span className="text-blue-600">{activity.project}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Invite New Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleInviteTeamMember}>
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{member.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Projects: </span>
                      <span className="font-semibold">{member.projects}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Contributions: </span>
                      <span className="font-semibold">{member.contributions}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">Last active: {member.lastActive}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Video className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Projects</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-gray-600">
                        {project.participants.length} participant{project.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Updated {project.lastUpdate}</span>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{project.messages} messages</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Team Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-center text-gray-500">
                  Real-time chat functionality will be available here
                </p>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Weekly Research Review</p>
                    <p className="text-sm text-gray-600">Today at 2:00 PM</p>
                  </div>
                  <Button size="sm">Join</Button>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Project Planning Session</p>
                    <p className="text-sm text-gray-600">Tomorrow at 10:00 AM</p>
                  </div>
                  <Button size="sm" variant="outline">Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}