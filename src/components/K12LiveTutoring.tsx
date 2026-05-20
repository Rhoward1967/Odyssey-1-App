import { useState } from 'react';
import { Video } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Geography', 'Test Prep', 'Other'];
const GRADE_BANDS = ['K – 2nd Grade', '3rd – 5th Grade', '6th – 8th Grade', '9th – 12th Grade'];
const TIMES = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–8pm)', 'Weekend'];

interface Props { onBack: () => void; }

export default function K12LiveTutoring({ onBack }: Props) {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = grade && subject && time;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="col-span-3 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </button>
        <span className="text-white font-semibold text-sm">Live Tutoring — Request a Session</span>
      </div>

      {submitted ? (
        <div className="bg-green-900/40 border border-green-500 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">&#10003;</div>
          <h3 className="text-green-300 font-semibold text-lg mb-2">Session Request Submitted!</h3>
          <p className="text-green-200 text-sm mb-1">
            Subject: <strong>{subject}</strong> | Grade: <strong>{grade}</strong>
          </p>
          <p className="text-green-200 text-sm mb-4">Preferred time: <strong>{time}</strong></p>
          <p className="text-gray-400 text-xs">A tutor will be matched to your request. You can use the Live Collaboration video below to connect once matched.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 text-white border-green-600 hover:bg-green-800"
            onClick={() => { setSubmitted(false); setGrade(''); setSubject(''); setTime(''); setNotes(''); }}
          >
            Submit Another Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Grade Level *</Label>
              <Select onValueChange={setGrade}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select grade..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {GRADE_BANDS.map(g => (
                    <SelectItem key={g} value={g} className="text-white hover:bg-slate-700">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Subject *</Label>
              <Select onValueChange={setSubject}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {SUBJECTS.map(s => (
                    <SelectItem key={s} value={s} className="text-white hover:bg-slate-700">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Preferred Time *</Label>
              <Select onValueChange={setTime}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select time..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {TIMES.map(t => (
                    <SelectItem key={t} value={t} className="text-white hover:bg-slate-700">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">What do you need help with? (optional)</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe the specific topic, chapter, or problem you're working on..."
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 resize-none transition-colors"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Request a Tutor'}
          </Button>

          <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3 mt-2">
            <Video className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">
              Once matched with a tutor, use the <strong className="text-gray-300">Live Collaboration</strong> video section below to start your session. Make sure to allow camera and microphone access in your browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
