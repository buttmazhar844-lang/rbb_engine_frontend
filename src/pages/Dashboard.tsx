import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Spinner } from '../components/ui/Spinner';
import { useDashboard } from '../hooks/useDashboard';

const templateTypeLabels: Record<string, string> = {
  BUNDLE_OVERVIEW: 'Bundle Overview',
  VOCABULARY_PACK: 'Vocabulary Pack',
  ANCHOR_READING_PASSAGE: 'Reading Passage',
  READING_COMPREHENSION_QUESTIONS: 'Comprehension',
  SHORT_QUIZ: 'Short Quiz',
  EXIT_TICKETS: 'Exit Tickets',
  WRITING_PROMPTS: 'Writing Prompts',
};

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useDashboard();

  return (
    <PageContainer>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-1">Welcome to RBB Engine</h1>
        <p className="text-primary-100 text-base mb-6">Generate standards-aligned ELA content in seconds.</p>
        <Link
          to="/quick-generate"
          className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-50 transition-colors text-sm"
        >
          ⚡ Generate a Template
        </Link>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="md" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Templates', value: stats?.total_products ?? 0, color: 'text-primary-600' },
              { label: 'Ready', value: stats?.products_by_status?.GENERATED ?? 0, color: 'text-green-600' },
              { label: 'Christian', value: stats?.content_by_worldview?.CHRISTIAN ?? 0, color: 'text-blue-600' },
              { label: 'Neutral', value: stats?.content_by_worldview?.NEUTRAL ?? 0, color: 'text-neutral-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-neutral-200 rounded-xl p-5">
                <p className="text-sm text-neutral-500 mb-1">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Template Breakdown */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-neutral-800 mb-4">Templates by Type</h2>
              {stats?.templates_by_type && Object.keys(stats.templates_by_type).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.templates_by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm text-neutral-700">{templateTypeLabels[type] ?? type}</span>
                      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 py-4 text-center">No templates yet</p>
              )}
            </div>

            {/* Grade Breakdown */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-neutral-800 mb-4">Templates by Grade</h2>
              {stats?.content_by_grade && Object.keys(stats.content_by_grade).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.content_by_grade).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm text-neutral-700">Grade {grade}</span>
                      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 py-4 text-center">No grade data yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/quick-generate', icon: '⚡', label: 'Generate Template', desc: 'Create new ELA content' },
          { to: '/products', icon: '📝', label: 'View Templates', desc: 'Browse all generated content' },
          { to: '/jobs', icon: '🔄', label: 'Generation Jobs', desc: 'Track job progress' },
        ].map(({ to, icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4 hover:border-primary-400 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">{label}</p>
              <p className="text-xs text-neutral-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
};
