import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Eye, Flag, Shield } from 'lucide-react';

interface ModerationItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  confidence: number;
  flags: string[];
  timestamp: Date;
  user: string;
}

export const ContentModerationSystem: React.FC = () => {
  const [items, setItems] = useState<ModerationItem[]>([
    {
      id: '1',
      content: 'This is a sample user comment that needs moderation review.',
      type: 'text',
      status: 'pending',
      confidence: 0.85,
      flags: ['potential spam'],
      timestamp: new Date(),
      user: 'user123'
    },
    {
      id: '2',
      content: 'Another piece of content for review.',
      type: 'text',
      status: 'flagged',
      confidence: 0.92,
      flags: ['inappropriate language', 'harassment'],
      timestamp: new Date(),
      user: 'user456'
    }
  ]);

  const [stats, setStats] = useState({
    totalReviewed: 1247,
    autoApproved: 1089,
    flagged: 158,
    accuracy: 94.2
  });

  const handleModerate = (id: string, action: 'approve' | 'reject') => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Content Moderation System</h1>
          <p className="text-muted-foreground">AI-powered content filtering and review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.autoApproved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.accuracy}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerate(item.id, 'approve')}
                      disabled={item.status !== 'pending' && item.status !== 'flagged'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModerate(item.id, 'reject')}
                      disabled={item.status !== 'pending' && item.status !== 'flagged'}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{item.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>User: {item.user}</span>
                    <span>•</span>
                    <span>{item.timestamp.toLocaleString()}</span>
                  </div>
                  {item.flags.length > 0 && (
                    <div className="flex gap-1">
                      {item.flags.map((flag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>Configure AI moderation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sensitivity Level</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Auto-approve Threshold</label>
                  <input type="range" min="0" max="100" defaultValue="85" className="w-full mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Content moderation activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span>Content approved by AI</span>
                  <span className="text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Manual review completed</span>
                  <span className="text-muted-foreground">5 minutes ago</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Content flagged for review</span>
                  <span className="text-muted-foreground">12 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};