import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Calculator } from 'lucide-react';

export interface SelectedSpec {
  id: string;
  name: string;
  description: string;
  frequency: string;
  squareFootage: number;
  customNotes: string;
  estimatedHours: number;
  pricePerSqft: number;
}

interface SpecificationDetailsProps {
  selectedSpecs: SelectedSpec[];
  onSpecUpdate: (id: string, updates: Partial<SelectedSpec>) => void;
  onSpecRemove: (id: string) => void;
  onRecalculate: () => void;
}

const SpecificationDetails: React.FC<SpecificationDetailsProps> = ({
  selectedSpecs,
  onSpecUpdate,
  onSpecRemove,
  onRecalculate
}) => {
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice-weekly', label: 'Twice Weekly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'as-needed', label: 'As Needed' }
  ];

  const calculateSpecTotal = (spec: SelectedSpec) => {
    return spec.squareFootage * spec.pricePerSqft;
  };

  const getTotalEstimate = () => {
    return selectedSpecs.reduce((total, spec) => total + calculateSpecTotal(spec), 0);
  };

  if (selectedSpecs.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">No specifications selected. Choose from the dropdown above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold">Selected Specifications</h3>
        <Button 
          onClick={onRecalculate}
          className="bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Recalculate
        </Button>
      </div>

      {selectedSpecs.map((spec) => (
        <Card key={spec.id} className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-white text-base">{spec.name}</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSpecRemove(spec.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={spec.description}
                onChange={(e) => onSpecUpdate(spec.id, { description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Frequency</Label>
                <Select 
                  value={spec.frequency} 
                  onValueChange={(value) => onSpecUpdate(spec.id, { frequency: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Square Footage</Label>
                <Input
                  type="number"
                  value={spec.squareFootage}
                  onChange={(e) => onSpecUpdate(spec.id, { squareFootage: Number(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={spec.estimatedHours}
                  onChange={(e) => onSpecUpdate(spec.id, { estimatedHours: Number(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <Label className="text-slate-300">Price per Sq Ft</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={spec.pricePerSqft}
                  onChange={(e) => onSpecUpdate(spec.id, { pricePerSqft: Number(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Custom Notes</Label>
              <Textarea
                value={spec.customNotes}
                onChange={(e) => onSpecUpdate(spec.id, { customNotes: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-[60px]"
                placeholder="Additional requirements or notes..."
              />
            </div>

            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Specification Total:</span>
                <span className="text-green-400 font-semibold text-lg">
      ${((typeof calculateSpecTotal(spec) === 'number' && !isNaN(calculateSpecTotal(spec))) ? calculateSpecTotal(spec) : 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold">Total Estimate:</span>
            <span className="text-green-400 font-bold text-2xl">
              ${((typeof getTotalEstimate() === 'number' && !isNaN(getTotalEstimate())) ? getTotalEstimate() : 0).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecificationDetails;