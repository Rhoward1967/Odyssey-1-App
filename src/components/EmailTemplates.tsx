import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Briefcase, Heart, Gift } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  icon: React.ReactNode;
}

interface EmailTemplatesProps {
  onSelectTemplate: (template: EmailTemplate) => void;
}

export default function EmailTemplates({ onSelectTemplate }: EmailTemplatesProps) {
  const templates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to Our Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; text-align: center;">Welcome!</h1>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Getting Started:</h3>
            <ul>
              <li>Complete your profile</li>
              <li>Explore our features</li>
              <li>Connect with other users</li>
            </ul>
          </div>
          <p>Best regards,<br>The Team</p>
        </div>
      `,
      icon: <Heart className="h-4 w-4" />
    },
    {
      id: 'business',
      name: 'Business Proposal',
      subject: 'Business Partnership Opportunity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Partnership Proposal</h1>
          <p>Dear [Name],</p>
          <p>We would like to discuss a potential business partnership that could benefit both our organizations.</p>
          <div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0;">
            <h3>Key Benefits:</h3>
            <p>• Increased market reach<br>• Shared resources<br>• Enhanced capabilities</p>
          </div>
          <p>Please let us know if you're interested in scheduling a meeting.</p>
          <p>Best regards,<br>[Your Name]</p>
        </div>
      `,
      icon: <Briefcase className="h-4 w-4" />
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      subject: 'Monthly Newsletter - Latest Updates',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Monthly Newsletter</h1>
          </header>
          <div style="padding: 20px;">
            <h2>What's New This Month</h2>
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
              <h3>Feature Update</h3>
              <p>We've added new functionality to improve your experience.</p>
            </div>
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
              <h3>Community Highlights</h3>
              <p>See what our community has been up to this month.</p>
            </div>
            <p>Thank you for being part of our community!</p>
          </div>
        </div>
      `,
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'promotion',
      name: 'Promotional Offer',
      subject: 'Special Offer - Limited Time!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Special Offer!</h1>
            <p style="font-size: 18px; margin: 10px 0;">Limited Time Only</p>
          </div>
          <div style="padding: 20px;">
            <h2>Get 50% Off Your Next Purchase</h2>
            <p>Don't miss out on this incredible deal! Use code <strong>SAVE50</strong> at checkout.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
            </div>
            <p><em>Offer expires in 48 hours. Terms and conditions apply.</em></p>
          </div>
        </div>
      `,
      icon: <Gift className="h-4 w-4" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {template.icon}
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                <Button 
                  size="sm" 
                  onClick={() => onSelectTemplate(template)}
                  className="w-full"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}