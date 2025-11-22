/**
 * Study Group Modal Component
 * Browse, create, and join educational study groups
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    createStudyGroup,
    getGroupMembers,
    getGroupMessages,
    getMyStudyGroups,
    joinStudyGroup,
    leaveStudyGroup,
    listStudyGroups,
    sendGroupMessage,
    StudyGroup,
    StudyGroupMember,
    StudyGroupMessage,
    subscribeToGroupMessages
} from '@/services/studyGroupService';
import { BookOpen, Calendar, LogOut, MessageCircle, Send, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StudyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: 'k12' | 'legal' | 'medical' | 'college';
}

export default function StudyGroupModal({ isOpen, onClose, portalType }: StudyGroupModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-groups' | 'create'>('browse');
  const [availableGroups, setAvailableGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [groupMessages, setGroupMessages] = useState<StudyGroupMessage[]>([]);
  const [groupMembers, setGroupMembers] = useState<StudyGroupMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Create group form state
  const [groupName, setGroupName] = useState('');
  const [groupSubject, setGroupSubject] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [meetingSchedule, setMeetingSchedule] = useState('');

  const loadAvailableGroups = async () => {
    setLoading(true);
    const groups = await listStudyGroups(portalType);
    setAvailableGroups(groups);
    setLoading(false);
  };

  const loadMyGroups = async () => {
    setLoading(true);
    const groups = await getMyStudyGroups();
    setMyGroups(groups.filter(g => g.portal_type === portalType));
    setLoading(false);
  };

  const loadGroupDetails = async (groupId: string) => {
    const [messages, members] = await Promise.all([
      getGroupMessages(groupId, 50),
      getGroupMembers(groupId)
    ]);
    setGroupMessages(messages.reverse()); // Show oldest first
    setGroupMembers(members);
  };

  // Load available groups
  useEffect(() => {
    if (isOpen && activeTab === 'browse') {
      loadAvailableGroups();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, portalType]);

  // Load my groups
  useEffect(() => {
    if (isOpen && activeTab === 'my-groups') {
      loadMyGroups();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab]);

  // Load group details when selected
  useEffect(() => {
    if (selectedGroup) {
      loadGroupDetails(selectedGroup.id);
    }
  }, [selectedGroup]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (selectedGroup) {
      const unsubscribe = subscribeToGroupMessages(selectedGroup.id, (message) => {
        setGroupMessages((prev) => [message, ...prev]);
      });
      return () => unsubscribe();
    }
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (!groupName || !groupSubject) {
      toast.error('Please fill in group name and subject');
      return;
    }

    setLoading(true);
    const newGroup = await createStudyGroup(
      groupName,
      groupSubject,
      portalType,
      groupDescription,
      maxMembers,
      meetingSchedule
    );

    if (newGroup) {
      toast.success(`🎉 Study group "${groupName}" created!`);
      setGroupName('');
      setGroupSubject('');
      setGroupDescription('');
      setMaxMembers(10);
      setMeetingSchedule('');
      setActiveTab('my-groups');
      loadMyGroups();
    } else {
      toast.error('Failed to create study group');
    }
    setLoading(false);
  };

  const handleJoinGroup = async (group: StudyGroup) => {
    setLoading(true);
    const success = await joinStudyGroup(group.id);
    if (success) {
      toast.success(`✅ Joined "${group.name}"!`);
      loadAvailableGroups();
      loadMyGroups();
    } else {
      toast.error('Failed to join group (may be full)');
    }
    setLoading(false);
  };

  const handleLeaveGroup = async (group: StudyGroup) => {
    setLoading(true);
    const success = await leaveStudyGroup(group.id);
    if (success) {
      toast.success(`👋 Left "${group.name}"`);
      setSelectedGroup(null);
      loadMyGroups();
    } else {
      toast.error('Failed to leave group');
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!selectedGroup || !newMessage.trim()) return;

    const message = await sendGroupMessage(selectedGroup.id, newMessage);
    if (message) {
      setNewMessage('');
    } else {
      toast.error('Failed to send message');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>📚 Study Groups</DialogTitle>
          <DialogDescription>
            Join collaborative learning communities for {portalType === 'k12' ? 'K-12' : portalType.toUpperCase()} students
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">
              <Users className="w-4 h-4 mr-2" />
              Browse Groups
            </TabsTrigger>
            <TabsTrigger value="my-groups">
              <BookOpen className="w-4 h-4 mr-2" />
              My Groups
            </TabsTrigger>
            <TabsTrigger value="create">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Group
            </TabsTrigger>
          </TabsList>

          {/* Browse Groups Tab */}
          <TabsContent value="browse" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading groups...</div>
              ) : availableGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No study groups available. Be the first to create one!
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableGroups.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {group.description || 'No description provided'}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">{group.subject}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{group.member_count || 0}/{group.max_members}</span>
                            </div>
                            {group.meeting_schedule && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{group.meeting_schedule}</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            onClick={() => handleJoinGroup(group)}
                            disabled={loading || (group.member_count || 0) >= group.max_members}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join Group
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* My Groups Tab */}
          <TabsContent value="my-groups" className="space-y-4">
            {selectedGroup ? (
              <div className="space-y-4">
                {/* Group Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{selectedGroup.name}</CardTitle>
                        <CardDescription>{selectedGroup.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedGroup(null)}>
                          Back to Groups
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleLeaveGroup(selectedGroup)}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Leave Group
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  {/* Messages */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Group Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] mb-4">
                        {groupMessages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {groupMessages.map((msg) => (
                              <div key={msg.id} className="flex gap-2">
                                <div className="flex-1 bg-muted rounded-lg p-3">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {new Date(msg.created_at).toLocaleString()}
                                  </div>
                                  <div className="text-sm">{msg.message}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Members ({groupMembers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {groupMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                              <span className="text-sm">User {member.user_id.slice(0, 8)}</span>
                              {member.role !== 'member' && (
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading your groups...</div>
                ) : myGroups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You haven't joined any groups yet. Browse available groups to get started!
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myGroups.map((group) => (
                      <Card 
                        key={group.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{group.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {group.description || 'No description provided'}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">{group.subject}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{group.member_count || 0}/{group.max_members}</span>
                            </div>
                            {group.meeting_schedule && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{group.meeting_schedule}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>

          {/* Create Group Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Study Group</CardTitle>
                <CardDescription>
                  Start a collaborative learning community for your subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Advanced Calculus Study Group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, Biology, Law"
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your group will study and goals..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Max Members</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min={2}
                      max={50}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(parseInt(e.target.value) || 10)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule">Meeting Schedule (optional)</Label>
                    <Input
                      id="schedule"
                      placeholder="e.g., Mon/Wed 7pm EST"
                      value={meetingSchedule}
                      onChange={(e) => setMeetingSchedule(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateGroup} 
                  disabled={loading || !groupName || !groupSubject}
                  className="w-full"
                >
                  Create Study Group
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
