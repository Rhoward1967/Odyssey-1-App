/**
 * ============================================================================
 * R.O.M.A.N AI INTELLIGENCE DASHBOARD
 * ============================================================================
 * Visualize AI advancements, ROMAN's evolution, research papers, benchmarks
 * Vision: "The AI that learns about AI"
 * ============================================================================
 */

import {
    Activity,
    AlertCircle,
    BookOpen,
    Brain,
    CheckCircle2,
    Clock,
    Rocket,
    Search,
    Sparkles,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { romanAIIntelligence } from '../services/romanAIIntelligence';
import { supabase } from '../services/supabase';

// ============================================================================
// TYPES
// ============================================================================

interface AIAdvancement {
  id: string;
  advancement_type: string;
  title: string;
  description: string;
  source_organization: string;
  published_date: string;
  model_name?: string;
  impact_level: string;
  should_upgrade: boolean;
  upgrade_priority?: string;
  status: string;
  roman_analysis?: string;
  confidence_score?: number;
}

interface CapabilityEvolution {
  id: string;
  capability_name: string;
  previous_model: string;
  new_model: string;
  improvement_percentage: number;
  upgraded_at: string;
  customer_facing_improvements: string;
}

interface ResearchPaper {
  id: string;
  arxiv_id: string;
  title: string;
  abstract: string;
  authors: string[];
  published_date: string;
  relevance_score: number;
  roman_summary?: string;
  status: string;
}

interface ModelBenchmark {
  id: string;
  model_name: string;
  provider: string;
  mmlu_score?: number;
  humaneval_score?: number;
  context_length?: number;
  cost_per_1k_input_tokens?: number;
  roman_rating?: number;
  best_use_cases?: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AIIntelligenceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'advancements' | 'evolution' | 'papers' | 'benchmarks' | 'predictions'>('advancements');
  const [advancements, setAdvancements] = useState<AIAdvancement[]>([]);
  const [evolution, setEvolution] = useState<CapabilityEvolution[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [benchmarks, setBenchmarks] = useState<ModelBenchmark[]>([]);
  const [evolutionScore, setEvolutionScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load advancements
      const { data: advData } = await supabase
        .from('ai_technology_tracking')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(20);
      if (advData) setAdvancements(advData);

      // Load evolution timeline
      const { data: evolData } = await supabase
        .from('roman_capability_evolution')
        .select('*')
        .order('upgraded_at', { ascending: false })
        .limit(15);
      if (evolData) setEvolution(evolData);

      // Load research papers
      const { data: papersData } = await supabase
        .from('ai_research_papers')
        .select('*')
        .order('relevance_score', { ascending: false })
        .limit(20);
      if (papersData) setPapers(papersData);

      // Load model benchmarks
      const { data: benchData } = await supabase
        .from('ai_model_benchmarks')
        .select('*')
        .order('roman_rating', { ascending: false });
      if (benchData) setBenchmarks(benchData);

      // Get evolution score
      const { data: score } = await supabase.rpc('calculate_roman_evolution_score');
      if (score !== null) setEvolutionScore(score);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysisNow = async () => {
    setLoading(true);
    try {
      await romanAIIntelligence.runDailyCycle();
      await loadDashboardData();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STATS SUMMARY
  // ============================================================================

  const stats = {
    total_advancements: advancements.length,
    pending_upgrades: advancements.filter(a => a.should_upgrade && a.status === 'detected').length,
    papers_analyzed: papers.length,
    roman_evolution_score: evolutionScore,
    upgrades_completed: evolution.length
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Brain className="w-12 h-12 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold">R.O.M.A.N AI Intelligence</h1>
              <p className="text-gray-300">The AI that learns about AI</p>
            </div>
          </div>
          <button
            onClick={runAnalysisNow}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>{loading ? 'Running Analysis...' : 'Run Analysis Now'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            title="AI Advancements"
            value={stats.total_advancements}
            subtitle="Tracked"
            color="purple"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Pending Upgrades"
            value={stats.pending_upgrades}
            subtitle="Need Review"
            color="yellow"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Research Papers"
            value={stats.papers_analyzed}
            subtitle="Analyzed"
            color="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Upgrades Done"
            value={stats.upgrades_completed}
            subtitle="Completed"
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Evolution Score"
            value={stats.roman_evolution_score.toFixed(1)}
            subtitle="/100"
            color="pink"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 border-b border-gray-700">
        <TabButton
          active={activeTab === 'advancements'}
          onClick={() => setActiveTab('advancements')}
          icon={<Rocket />}
          label="AI Advancements"
        />
        <TabButton
          active={activeTab === 'evolution'}
          onClick={() => setActiveTab('evolution')}
          icon={<TrendingUp />}
          label="ROMAN Evolution"
        />
        <TabButton
          active={activeTab === 'papers'}
          onClick={() => setActiveTab('papers')}
          icon={<BookOpen />}
          label="Research Papers"
        />
        <TabButton
          active={activeTab === 'benchmarks'}
          onClick={() => setActiveTab('benchmarks')}
          icon={<Target />}
          label="Model Benchmarks"
        />
        <TabButton
          active={activeTab === 'predictions'}
          onClick={() => setActiveTab('predictions')}
          icon={<Brain />}
          label="AGI Timeline"
        />
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-lg">
        {activeTab === 'advancements' && <AdvancementsTab advancements={advancements} />}
        {activeTab === 'evolution' && <EvolutionTab evolution={evolution} score={evolutionScore} />}
        {activeTab === 'papers' && <PapersTab papers={papers} />}
        {activeTab === 'benchmarks' && <BenchmarksTab benchmarks={benchmarks} />}
        {activeTab === 'predictions' && <PredictionsTab />}
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
}> = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    purple: 'bg-purple-600/20 border-purple-500',
    yellow: 'bg-yellow-600/20 border-yellow-500',
    blue: 'bg-blue-600/20 border-blue-500',
    green: 'bg-green-600/20 border-green-500',
    pink: 'bg-pink-600/20 border-pink-500'
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-4`}>
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <span className="text-sm text-gray-300">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 transition ${
      active
        ? 'text-purple-400 border-b-2 border-purple-400'
        : 'text-gray-400 hover:text-white'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    <span>{label}</span>
  </button>
);

// ============================================================================
// ADVANCEMENTS TAB
// ============================================================================

const AdvancementsTab: React.FC<{ advancements: AIAdvancement[] }> = ({ advancements }) => {
  const getImpactColor = (level: string) => {
    switch (level) {
      case 'revolutionary': return 'text-red-400 bg-red-900/30';
      case 'major': return 'text-yellow-400 bg-yellow-900/30';
      case 'incremental': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'integrated': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'detected': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Tracked AI Advancements</h2>
      {advancements.map((adv) => (
        <div key={adv.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(adv.status)}
                <h3 className="text-lg font-semibold">{adv.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${getImpactColor(adv.impact_level)}`}>
                  {adv.impact_level}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{adv.description}</p>
              {adv.roman_analysis && (
                <div className="bg-purple-900/30 border border-purple-700 rounded p-3 mb-2">
                  <p className="text-sm text-purple-200">
                    <strong>ROMAN Analysis:</strong> {adv.roman_analysis}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>📅 {adv.published_date}</span>
                <span>🏢 {adv.source_organization}</span>
                {adv.model_name && <span>🤖 {adv.model_name}</span>}
                {adv.confidence_score && <span>✅ {adv.confidence_score}% confidence</span>}
              </div>
            </div>
            {adv.should_upgrade && adv.status === 'detected' && (
              <button className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition">
                Review Upgrade
              </button>
            )}
          </div>
        </div>
      ))}
      {advancements.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No AI advancements tracked yet</p>
          <p className="text-sm">Run analysis to detect new models and research</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EVOLUTION TAB
// ============================================================================

const EvolutionTab: React.FC<{ evolution: CapabilityEvolution[]; score: number }> = ({ evolution, score }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">ROMAN's Evolution Over Time</h2>
        <div className="text-right">
          <div className="text-4xl font-bold text-purple-400">{score.toFixed(1)}/100</div>
          <div className="text-sm text-gray-400">Intelligence Score</div>
        </div>
      </div>

      {/* Evolution Timeline */}
      <div className="space-y-4">
        {evolution.map((evol, index) => (
          <div key={evol.id} className="relative">
            {index !== evolution.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-purple-600"></div>
            )}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center z-10">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{evol.capability_name}</h3>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    evol.improvement_percentage >= 40 ? 'bg-green-600' :
                    evol.improvement_percentage >= 20 ? 'bg-yellow-600' :
                    'bg-blue-600'
                  }`}>
                    +{evol.improvement_percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{evol.customer_facing_improvements}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span>🔄 {evol.previous_model} → {evol.new_model}</span>
                  <span>📅 {new Date(evol.upgraded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {evolution.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No capability upgrades yet</p>
          <p className="text-sm">ROMAN will evolve as new AI models are integrated</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PAPERS TAB
// ============================================================================

const PapersTab: React.FC<{ papers: ResearchPaper[] }> = ({ papers }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">AI Research Papers Analyzed</h2>
      {papers.map((paper) => (
        <div key={paper.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold">{paper.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  paper.relevance_score >= 80 ? 'bg-green-600' :
                  paper.relevance_score >= 60 ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}>
                  {paper.relevance_score}/100 relevance
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{paper.abstract.substring(0, 200)}...</p>
              {paper.roman_summary && (
                <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mb-2">
                  <p className="text-sm text-blue-200">
                    <strong>ROMAN's Take:</strong> {paper.roman_summary}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>📝 {paper.arxiv_id}</span>
                <span>👥 {paper.authors.slice(0, 3).join(', ')}</span>
                <span>📅 {paper.published_date}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {papers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No research papers analyzed yet</p>
          <p className="text-sm">Run analysis to scan arXiv for relevant papers</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BENCHMARKS TAB
// ============================================================================

const BenchmarksTab: React.FC<{ benchmarks: ModelBenchmark[] }> = ({ benchmarks }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">AI Model Benchmarks</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-3 px-4">Model</th>
              <th className="text-left py-3 px-4">Provider</th>
              <th className="text-right py-3 px-4">MMLU</th>
              <th className="text-right py-3 px-4">HumanEval</th>
              <th className="text-right py-3 px-4">Context</th>
              <th className="text-right py-3 px-4">Cost (Input)</th>
              <th className="text-right py-3 px-4">ROMAN Rating</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((bench) => (
              <tr key={bench.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="py-3 px-4 font-semibold">{bench.model_name}</td>
                <td className="py-3 px-4 text-gray-400">{bench.provider}</td>
                <td className="py-3 px-4 text-right">{bench.mmlu_score?.toFixed(1)}%</td>
                <td className="py-3 px-4 text-right">{bench.humaneval_score?.toFixed(1)}%</td>
                <td className="py-3 px-4 text-right">{(bench.context_length / 1000).toFixed(0)}K</td>
                <td className="py-3 px-4 text-right">${bench.cost_per_1k_input_tokens?.toFixed(4)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`px-2 py-1 rounded text-sm font-bold ${
                    bench.roman_rating >= 90 ? 'bg-green-600' :
                    bench.roman_rating >= 80 ? 'bg-yellow-600' :
                    'bg-gray-600'
                  }`}>
                    {bench.roman_rating}/100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {benchmarks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No model benchmarks yet</p>
          <p className="text-sm">Run analysis to benchmark AI models</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PREDICTIONS TAB
// ============================================================================

const PredictionsTab: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    const { data } = await supabase
      .from('agi_timeline_predictions')
      .select('*')
      .order('predicted_year', { ascending: true });
    if (data) setPredictions(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">AGI Timeline Predictions</h2>
      {predictions.map((pred) => (
        <div key={pred.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-semibold">{pred.milestone_description}</h3>
                <span className="px-2 py-1 rounded text-xs bg-pink-600">
                  {pred.predicted_year}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{pred.impact_if_true}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>👤 {pred.predicted_by}</span>
                <span>📊 {pred.confidence_percentage}% confidence</span>
                <span>🔖 {pred.source_type}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {predictions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No AGI predictions loaded yet</p>
        </div>
      )}
    </div>
  );
};

export default AIIntelligenceDashboard;