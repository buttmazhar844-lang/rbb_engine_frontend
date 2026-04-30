import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useGenerationJobsQuery } from '../hooks/useGeneration';
import { GenerationJob } from '../types/api';

const statusMeta: Record<GenerationJob['status'], { variant: 'success' | 'pending' | 'error'; icon: string; label: string }> = {
  COMPLETED: { variant: 'success', icon: '✅', label: 'Completed' },
  PENDING:   { variant: 'pending', icon: '⏳', label: 'Pending'   },
  FAILED:    { variant: 'error',   icon: '❌', label: 'Failed'    },
};

const statusFilters = ['All', 'COMPLETED', 'PENDING', 'FAILED'] as const;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { data, isLoading, error, refetch } = useGenerationJobsQuery({ limit: 50, offset: 0 });

  const jobs: GenerationJob[] = data?.data ?? [];
  const filtered = statusFilter === 'All' ? jobs : jobs.filter(j => j.status === statusFilter);

  const counts = {
    All: jobs.length,
    COMPLETED: jobs.filter(j => j.status === 'COMPLETED').length,
    PENDING:   jobs.filter(j => j.status === 'PENDING').length,
    FAILED:    jobs.filter(j => j.status === 'FAILED').length,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Generation Jobs"
        description="Track the status of your content generation requests"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : '↻ Refresh'}
            </Button>
            <Button variant="primary" onClick={() => navigate('/quick-generate')}>
              + New Job
            </Button>
          </div>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-400'
            }`}
          >
            {s === 'All' ? 'All' : statusMeta[s as GenerationJob['status']].label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === s ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500'
            }`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
          <span className="ml-3 text-neutral-500">Loading jobs...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Failed to load generation jobs</p>
          <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          title={statusFilter === 'All' ? 'No jobs yet' : `No ${statusMeta[statusFilter as GenerationJob['status']]?.label} jobs`}
          description="Generate your first template to see jobs here."
          action={<Button variant="primary" onClick={() => navigate('/quick-generate')}>Generate Template</Button>}
        />
      )}

      {/* Job Cards */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => {
            const meta = statusMeta[job.status];
            const progress = job.total_products > 0
              ? Math.round((job.completed_products / job.total_products) * 100)
              : 0;

            return (
              <div key={job.id} className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-2xl mt-0.5">{meta.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-neutral-800">
                          {job.ela_standard_code
                            ? `${job.ela_standard_code} — Grade ${job.grade_level}`
                            : `Job #${job.id}`}
                        </span>
                        <StatusBadge status={meta.variant}>{meta.label}</StatusBadge>
                        <span className="text-xs text-neutral-400">{timeAgo(job.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                        <span>Job <span className="font-mono text-neutral-600">#{job.id}</span></span>
                        <span className={job.worldview_flag === 'CHRISTIAN' ? 'text-blue-600' : ''}>
                          {job.worldview_flag === 'CHRISTIAN' ? '✝️ Christian' : '📚 Neutral'}
                        </span>
                      </div>

                      {/* Progress bar — only show if has products */}
                      {job.total_products > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-neutral-400 mb-1">
                            <span>{job.completed_products} of {job.total_products} products</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                job.status === 'FAILED' ? 'bg-red-400' :
                                job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          {job.failed_products > 0 && (
                            <p className="text-xs text-red-500 mt-1">{job.failed_products} product(s) failed</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: action */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/products?generation_job_id=${job.id}`)}
                    className="shrink-0"
                  >
                    View Products
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
