import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TrainingData {
  id: string;
  name: string;
  description: string;
  training_content: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface CustomAITrainingProps {
  onTrainingDataUpdate: (data: TrainingData[]) => void;
}

export default function CustomAITraining({ onTrainingDataUpdate }: CustomAITrainingProps) {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    training_content: ''
  });

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const activeData = data || [];
      setTrainingData(activeData);
      onTrainingDataUpdate(activeData);
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  };

  const saveTrainingData = async () => {
    if (!formData.name.trim() || !formData.training_content.trim()) return;

    try {
      const dataToSave = {
        ...formData,
        status: 'active' as const,
        ...(editingId ? { id: editingId } : {})
      };

      const { data, error } = await supabase
        .from('custom_training_data')
        .upsert(dataToSave)
        .select()
        .single();

      if (error) throw error;

      setFormData({ name: '', description: '', training_content: '' });
      setIsCreating(false);
      setEditingId(null);
      loadTrainingData();
    } catch (error) {
      console.error('Error saving training data:', error);
    }
  };

  const deleteTrainingData = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_training_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTrainingData();
    } catch (error) {
      console.error('Error deleting training data:', error);
    }
  };

  const startEditing = (item: TrainingData) => {
    setFormData({
      name: item.name,
      description: item.description,
      training_content: item.training_content
    });
    setEditingId(item.id);
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setFormData({ name: '', description: '', training_content: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('custom_training_data')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadTrainingData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Custom AI Training
          </div>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Training Data
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 space-y-3">
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Training data name..."
                className="border-purple-200"
              />
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)..."
                className="border-purple-200"
              />
              <Textarea
                value={formData.training_content}
                onChange={(e) => setFormData(prev => ({ ...prev, training_content: e.target.value }))}
                placeholder="Enter your training content here. This can include facts, instructions, examples, or any information you want the AI to learn..."
                rows={6}
                className="border-purple-200"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveTrainingData}
                  disabled={!formData.name.trim() || !formData.training_content.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {editingId ? 'Update' : 'Save'}
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  className="border-purple-200"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Data List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {trainingData.map((item) => (
              <Card key={item.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={item.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(item.id, item.status)}
                      >
                        {item.status}
                      </Badge>
                      <Button
                        onClick={() => startEditing(item)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => deleteTrainingData(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <p className="truncate">{item.training_content}</p>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {trainingData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No custom training data yet</p>
            <p className="text-xs mt-1">Add training data to customize AI responses</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}