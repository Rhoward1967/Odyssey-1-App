import { MessageSquare, PlusCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChatSession } from '@/hooks/useRomanSessions';

interface Props {
  sessions:         ChatSession[];
  currentSessionId: string | null;
  searchQuery:      string;
  onSearchChange:   (q: string) => void;
  onNewChat:        () => void;
  onSelectSession:  (id: string) => void;
  open:             boolean;
  onToggle:         () => void;
}

function relativeDate(dateStr: string): string {
  const d       = new Date(dateStr);
  const diffMs  = Date.now() - d.getTime();
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffDay === 0) return 'Today';
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7)   return `${diffDay}d ago`;
  if (diffDay < 30)  return `${Math.floor(diffDay / 7)}w ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function SovereignSidebar({
  sessions,
  currentSessionId,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectSession,
  open,
  onToggle,
}: Props) {
  if (!open) {
    return (
      <div className="flex flex-col items-center py-3 px-1 bg-slate-900 border-r border-slate-700 shrink-0 w-10">
        <button
          onClick={onToggle}
          title="Open history"
          className="p-1.5 rounded hover:bg-slate-700 text-gray-500 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60 shrink-0 bg-slate-900 border-r border-slate-700 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-700">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">History</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            title="New conversation"
            className="p-1.5 rounded hover:bg-slate-700 text-gray-500 hover:text-blue-400 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            title="Close sidebar"
            className="p-1.5 rounded hover:bg-slate-700 text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-700/40">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-gray-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 outline-none"
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-8 px-4 leading-relaxed">
            {searchQuery ? 'No matching conversations.' : 'No conversations yet.'}
          </p>
        )}

        {sessions.map(session => {
          const active = session.id === currentSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2.5 transition-colors group ${
                active
                  ? 'bg-slate-800 border-l-2 border-blue-500'
                  : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors ${
                  active ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs truncate leading-snug ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {session.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {relativeDate(session.updated_at)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-700/40">
        <p className="text-xs text-gray-700 text-center">R.O.M.A.N. Memory</p>
      </div>
    </div>
  );
}
