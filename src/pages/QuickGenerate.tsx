import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { TemplatePreviewCard } from '../components/ui/TemplatePreviewCard';
import { generationApi } from '../api/generation';
import { useStandards } from '../hooks/useStandards';
import { TemplateType, ELAStandardType, GradeLevel, WorldviewFlag, GenerateTemplateRequest } from '../types/api';

interface FormData {
  grade_level: GradeLevel;
  ela_standard_type: ELAStandardType;
  ela_standard_code: string;
  template_type: TemplateType;
  worldview_flag: WorldviewFlag;
  standard_id: number | null;
}

const TEMPLATE_OPTIONS: { value: TemplateType; label: string; description: string }[] = [
  { value: 'BUNDLE_OVERVIEW',                  label: 'Bundle Overview',             description: 'Complete curriculum package overview' },
  { value: 'VOCABULARY_PACK',                  label: 'Vocabulary Pack',              description: 'Key terms and definitions with quiz' },
  { value: 'ANCHOR_READING_PASSAGE',           label: 'Anchor Reading Passage',       description: 'Core reading text with analysis' },
  { value: 'READING_COMPREHENSION_QUESTIONS',  label: 'Reading Comprehension',        description: '10 questions across 3 types' },
  { value: 'SHORT_QUIZ',                       label: 'Short Quiz',                   description: '7-question assessment with answer key' },
  { value: 'EXIT_TICKETS',                     label: 'Exit Tickets',                 description: '5 end-of-lesson check prompts' },
  { value: 'WRITING_PROMPTS',                  label: 'Writing Prompts',              description: '3 guided prompts with exemplar' },
];

const DEFAULT_FORM: FormData = {
  grade_level: '6',
  ela_standard_type: 'RI',
  ela_standard_code: '',
  template_type: 'ANCHOR_READING_PASSAGE',
  worldview_flag: 'NEUTRAL',
  standard_id: null,
};

export const QuickGenerate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: standards } = useStandards({ grade_level: formData.grade_level });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.standard_id) return;

    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const request: GenerateTemplateRequest = {
        standard_id: formData.standard_id,
        template_type: formData.template_type,
        grade_level: formData.grade_level,
        ela_standard_type: formData.ela_standard_type,
        ela_standard_code: formData.ela_standard_code,
        worldview_flag: formData.worldview_flag,
      };
      const result = await generationApi.generateTemplate(request);
      const templateLabel = TEMPLATE_OPTIONS.find(t => t.value === formData.template_type)?.label;
      setSuccessMsg(`${templateLabel} generated successfully for ${formData.ela_standard_code} (Grade ${formData.grade_level}). Job #${result.job_id}`);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || error.message || 'Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Generate ELA Template"
        description="Create standards-aligned ELA content using AI"
      />

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="text-green-500 text-lg mt-0.5">✓</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">{successMsg}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
              View Templates
            </Button>
            <button onClick={() => setSuccessMsg(null)} className="text-green-500 hover:text-green-700 text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500 text-lg mt-0.5">✕</span>
          <p className="text-sm text-red-700 flex-1">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Grade & Standard */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-4 pb-2 border-b border-neutral-100">
                  Grade & Standard
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Grade Level"
                    value={formData.grade_level}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      grade_level: e.target.value as GradeLevel,
                      standard_id: null,
                      ela_standard_code: '',
                    }))}
                    required
                  >
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                  </Select>

                  <Select
                    label="ELA Standard"
                    value={formData.standard_id?.toString() || ''}
                    onChange={(e) => {
                      const selected = standards?.data?.find((s: any) => s.id === parseInt(e.target.value));
                      if (selected) {
                        setFormData(prev => ({
                          ...prev,
                          standard_id: selected.id,
                          ela_standard_code: selected.code,
                          ela_standard_type: selected.ela_standard_type,
                        }));
                      }
                    }}
                    required
                  >
                    <option value="">Select a standard...</option>
                    {standards?.data?.map((standard: any) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.code} — {standard.description}
                      </option>
                    ))}
                  </Select>
                </div>

                {formData.ela_standard_code && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2">
                    <span className="font-mono font-semibold text-primary-600">{formData.ela_standard_code}</span>
                    <span>·</span>
                    <span>Grade {formData.grade_level}</span>
                    <span>·</span>
                    <span>{formData.ela_standard_type === 'RI' ? 'Reading Informational' : 'Reading Literature'}</span>
                  </div>
                )}
              </div>

              {/* Template Type */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-4 pb-2 border-b border-neutral-100">
                  Template Type
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEMPLATE_OPTIONS.map((template) => (
                    <label
                      key={template.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.template_type === template.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template_type"
                        value={template.value}
                        checked={formData.template_type === template.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value as TemplateType }))}
                        className="mt-0.5 w-4 h-4 text-primary-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${formData.template_type === template.value ? 'text-primary-700' : 'text-neutral-800'}`}>
                          {template.label}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{template.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Worldview */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-4 pb-2 border-b border-neutral-100">
                  Content Worldview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.worldview_flag === 'NEUTRAL'
                      ? 'border-neutral-400 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}>
                    <input
                      type="radio"
                      name="worldview"
                      value="NEUTRAL"
                      checked={formData.worldview_flag === 'NEUTRAL'}
                      onChange={(e) => setFormData(prev => ({ ...prev, worldview_flag: e.target.value as WorldviewFlag }))}
                      className="mt-0.5 w-4 h-4 text-neutral-600 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">📚 Neutral</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Standard academic content</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.worldview_flag === 'CHRISTIAN'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-neutral-200 hover:border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="worldview"
                      value="CHRISTIAN"
                      checked={formData.worldview_flag === 'CHRISTIAN'}
                      onChange={(e) => setFormData(prev => ({ ...prev, worldview_flag: e.target.value as WorldviewFlag }))}
                      className="mt-0.5 w-4 h-4 text-blue-600 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">✝️ Christian</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Values-aligned academic content</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-neutral-100">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={!formData.standard_id}
                  size="md"
                >
                  {isLoading ? 'Generating...' : '⚡ Generate Template'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                  size="md"
                >
                  Reset
                </Button>
              </div>

              {!formData.standard_id && (
                <p className="text-xs text-neutral-400 -mt-2">Select a grade and standard to enable generation.</p>
              )}
            </form>
          </Card>
        </div>

        {/* Sticky Preview Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Template Preview</p>
            <TemplatePreviewCard
              templateType={formData.template_type}
              worldviewFlag={formData.worldview_flag}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
