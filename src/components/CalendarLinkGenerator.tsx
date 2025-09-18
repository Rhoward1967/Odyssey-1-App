import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ExternalLink, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CalendarLinkGeneratorProps {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
}

export default function CalendarLinkGenerator({
  title,
  description,
  startDate,
  endDate,
  location
}: CalendarLinkGeneratorProps) {
  const [links, setLinks] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-integration', {
        body: { title, description, startDate, endDate, location }
      });

      if (error) throw error;
      setLinks(data.links);
    } catch (error) {
      console.error('Error generating calendar links:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = () => {
    if (links?.ics) {
      const element = document.createElement('a');
      element.setAttribute('href', links.ics);
      element.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Add to Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!links ? (
          <Button 
            onClick={generateLinks} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Calendar Links'}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(links.google, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Add to Google Calendar
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(links.outlook, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Add to Outlook
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={downloadICS}
            >
              <Download className="h-4 w-4 mr-2" />
              Download ICS File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}