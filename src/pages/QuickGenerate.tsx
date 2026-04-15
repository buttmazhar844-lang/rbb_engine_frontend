import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { FormSection } from '../components/ui/FormSection';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { TemplatePreviewCard } from '../components/ui/TemplatePreviewCard';
import { generationApi } from '../api/generation';
import { useStandards } from '../hooks/useStandards';
import { TemplateType, ELAStandardType, WorldviewFlag, GenerateTemplateRequest } from '../types/api';

interface FormData {
  grade_level: GradeLevel;
  ela_standard_type: ELAStandardType;
  ela_standard_code: string;
  template_type: TemplateType;
  worldview_flag: WorldviewFlag;
  standard_id: number | null;
}

const templateOptions: { value: TemplateType; label: string; description: string }[] = [
  { value: 'BUNDLE_OVERVIEW', label: 'Bundle Overview', description: 'Complete curriculum package overview' },
  { value: 'VOCABULARY_PACK', label: 'Vocabulary Pack', description: 'Key terms and definitions' },
  { value: 'ANCHOR_READING_PASSAGE', label: 'Anchor Reading Passage', description: 'Core reading text with analysis' },
  { value: 'READING_COMPREHENSION_QUESTIONS', label: 'Reading Comprehension', description: 'Questions to test understanding' },
  { value: 'SHORT_QUIZ', label: 'Short Quiz', description: 'Quick assessment tool' },
  { value: 'EXIT_TICKETS', label: 'Exit Tickets', description: 'End-of-lesson check for understanding' },
  { value: 'WRITING_PROMPTS', label: 'Writing Prompts', description: 'Guided writing prompts with exemplar' },
];

export const QuickGenerate: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    grade_level: '6',
    ela_standard_type: 'RI',
    ela_standard_code: '',
    template_type: 'ANCHOR_READING_PASSAGE',
    worldview_flag: 'NEUTRAL',
    standard_id: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: standards } = useStandards({
    grade_level: formData.grade_level,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.standard_id) return;
    
    setIsLoading(true);
    
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
      alert(`Template generation started! Job ID: ${result.job_id}`);
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert(`Generation failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      grade_level: '6',
      ela_standard_type: 'RI',
      ela_standard_code: '',
      template_type: 'ANCHOR_READING_PASSAGE',
      worldview_flag: 'NEUTRAL',
      standard_id: null,
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Generate ELA Template"
        description="Create Christian-facing ELA content using structured templates"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Grade & Standard Section */}
              <FormSection
                title="Grade & ELA Standard"
                description="Select grade level and ELA standard type"
              >
                <Select
                  label="Grade Level"
                  value={formData.grade_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade_level: e.target.value as GradeLevel, standard_id: null, ela_standard_code: '' }))}
                  required
                >
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                </Select>
              </FormSection>

              {/* Standard Selection */}
              <FormSection
                title="Specific Standard"
                description="Standards filtered by selected grade level"
              >
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
                  <option value="">Select a standard</option>
                  {standards?.data?.map((standard: any) => (
                    <option key={standard.id} value={standard.id}>
                      {standard.code} — {standard.description}
                    </option>
                  ))}
                </Select>
              </FormSection>

              {/* Template Selection */}
              <FormSection
                title="Template Type"
                description="Choose the type of content to generate"
              >
                <Select
                  label="Template"
                  value={formData.template_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value as TemplateType }))}
                  required
                >
                  {templateOptions.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-neutral-600 mt-2">
                  {templateOptions.find(t => t.value === formData.template_type)?.description}
                </p>
              </FormSection>

              {/* Worldview Selection */}
              <FormSection
                title="Content Worldview"
                description="Choose content perspective"
              >
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="worldview"
                      value="NEUTRAL"
                      checked={formData.worldview_flag === 'NEUTRAL'}
                      onChange={(e) => setFormData(prev => ({ ...prev, worldview_flag: e.target.value as WorldviewFlag }))}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <span className="font-medium text-neutral-900">Neutral Content</span>
                      <p className="text-sm text-neutral-600">Standard academic content without religious perspective</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="worldview"
                      value="CHRISTIAN"
                      checked={formData.worldview_flag === 'CHRISTIAN'}
                      onChange={(e) => setFormData(prev => ({ ...prev, worldview_flag: e.target.value as WorldviewFlag }))}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <span className="font-medium text-neutral-900">Christian-Facing Content</span>
                      <p className="text-sm text-neutral-600">Values-aligned academic content (not preachy)</p>
                    </div>
                  </label>
                </div>
              </FormSection>

              {/* Submit Section */}
              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={!formData.standard_id}
                >
                  Generate Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Template Preview Sidebar */}
        <div>
          <TemplatePreviewCard 
            templateType={formData.template_type}
            worldviewFlag={formData.worldview_flag}
          />
        </div>
      </div>
    </PageContainer>
  );
};