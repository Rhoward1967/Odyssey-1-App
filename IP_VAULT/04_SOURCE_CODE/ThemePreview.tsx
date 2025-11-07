import { Eye, Lock } from 'lucide-react';

interface ThemePreviewProps {
  industryId: string;
  industryName: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isPremium: boolean;
  userHasAccess: boolean;
  onSelect?: () => void;
}

export default function ThemePreview({
  industryId,
  industryName,
  colorScheme,
  isPremium,
  userHasAccess,
  onSelect
}: ThemePreviewProps) {
  const canSelect = !isPremium || userHasAccess;

  return (
    <div className="relative group">
      {/* Theme Preview Card */}
      <div 
        className={`
          relative rounded-xl overflow-hidden border-2 transition-all
          ${canSelect ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-75'}
          ${canSelect ? 'border-slate-200 hover:border-purple-400' : 'border-slate-300'}
        `}
        onClick={canSelect ? onSelect : undefined}
      >
        {/* Preview Image/Mock */}
        <div 
          className="aspect-video relative"
          style={{ backgroundColor: colorScheme.secondary }}
        >
          {/* Simulated Website Preview */}
          <div className="absolute inset-0 p-4 flex flex-col">
            {/* Header */}
            <div 
              className="h-12 rounded-t-lg flex items-center px-4"
              style={{ backgroundColor: colorScheme.primary }}
            >
              <div className="w-20 h-6 bg-white/20 rounded"></div>
              <div className="ml-auto flex gap-2">
                <div className="w-16 h-4 bg-white/30 rounded"></div>
                <div className="w-16 h-4 bg-white/30 rounded"></div>
                <div className="w-16 h-4 bg-white/30 rounded"></div>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="flex-1 bg-white/90 p-4 mt-2 rounded">
              <div className="w-2/3 h-6 mb-2" style={{ backgroundColor: colorScheme.primary, opacity: 0.2 }}></div>
              <div className="w-1/2 h-4" style={{ backgroundColor: colorScheme.primary, opacity: 0.1 }}></div>
              <div 
                className="w-24 h-8 mt-4 rounded"
                style={{ backgroundColor: colorScheme.accent }}
              ></div>
            </div>
          </div>

          {/* Lock Overlay */}
          {!canSelect && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white dark:bg-slate-800 rounded-full p-4">
                <Lock className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          )}

          {/* Preview Button (on hover) */}
          {canSelect && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview Theme
              </button>
            </div>
          )}
        </div>

        {/* Theme Info */}
        <div className="p-4 bg-white dark:bg-slate-800">
          <h3 className="font-semibold mb-1">{industryName} Theme</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorScheme.primary }}></div>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorScheme.secondary }}></div>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorScheme.accent }}></div>
            </div>
            {isPremium && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Prompt (for locked themes) */}
      {!canSelect && (
        <div className="mt-2 text-center">
          <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
            Upgrade to unlock →
          </button>
        </div>
      )}
    </div>
  );
}
