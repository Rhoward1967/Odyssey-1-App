import React, { useState, useContext, createContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Languages, Check, Settings } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  progress: number;
}

interface Translation {
  [key: string]: {
    [lang: string]: string;
  };
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', progress: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', progress: 95 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', progress: 88 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', progress: 92 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', progress: 78 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', progress: 65 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', progress: 70 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', progress: 45 }
];

const translations: Translation = {
  'welcome': {
    'en': 'Welcome to ODYSSEY-1',
    'es': 'Bienvenido a ODYSSEY-1',
    'fr': 'Bienvenue à ODYSSEY-1',
    'de': 'Willkommen bei ODYSSEY-1',
    'zh': '欢迎来到ODYSSEY-1',
    'ja': 'ODYSSEY-1へようこそ',
    'ko': 'ODYSSEY-1에 오신 것을 환영합니다',
    'ar': 'مرحبا بك في ODYSSEY-1'
  },
  'dashboard': {
    'en': 'Dashboard',
    'es': 'Tablero',
    'fr': 'Tableau de bord',
    'de': 'Dashboard',
    'zh': '仪表板',
    'ja': 'ダッシュボード',
    'ko': '대시보드',
    'ar': 'لوحة القيادة'
  },
  'settings': {
    'en': 'Settings',
    'es': 'Configuración',
    'fr': 'Paramètres',
    'de': 'Einstellungen',
    'zh': '设置',
    'ja': '設定',
    'ko': '설정',
    'ar': 'الإعدادات'
  }
};

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const MultiLanguageSupport: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useTranslation();
  const [isConfiguring, setIsConfiguring] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Multi-Language Support</h1>
            <p className="text-muted-foreground">Internationalization and localization system</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {currentLang.flag} {currentLang.nativeName}
          </Badge>
          <Button variant="outline" onClick={() => setIsConfiguring(!isConfiguring)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLang.flag}</span>
              <div>
                <div className="font-semibold">{currentLang.nativeName}</div>
                <div className="text-sm text-muted-foreground">{currentLang.name}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentLang.progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${currentLang.progress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages.length}</div>
            <p className="text-sm text-muted-foreground">Total languages available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language Selector</CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={currentLanguage} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-muted-foreground">({lang.name})</span>
                    {lang.progress === 100 && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation Preview</CardTitle>
          <CardDescription>See how text appears in different languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{t('welcome')}</h3>
                <p className="text-sm text-muted-foreground">Welcome message</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{t('dashboard')}</h3>
                <p className="text-sm text-muted-foreground">Navigation item</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{t('settings')}</h3>
                <p className="text-sm text-muted-foreground">Settings page</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Languages</CardTitle>
          <CardDescription>Translation status for all supported languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {languages.map((lang) => (
              <div 
                key={lang.code} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  currentLanguage === lang.code ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setLanguage(lang.code)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{lang.flag}</span>
                  {currentLanguage === lang.code && <Check className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="font-semibold">{lang.nativeName}</div>
                <div className="text-sm text-muted-foreground">{lang.name}</div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{lang.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${lang.progress}%` }}
                    ></div>
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