import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { templatesApi, TemplatePreview } from '../../api/templates';
import { TemplateType, WorldviewFlag } from '../../types/api';

interface TemplatePreviewCardProps {
  templateType: TemplateType;
  worldviewFlag: WorldviewFlag;
  onPreviewLoad?: (preview: TemplatePreview) => void;
}

export const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  templateType,
  worldviewFlag,
  onPreviewLoad
}) => {
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreview();
  }, [templateType]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const previewData = await templatesApi.getTemplatePreview(templateType);
      setPreview(previewData);
      onPreviewLoad?.(previewData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateLabel = (type: TemplateType) => {
    const labels: Record<TemplateType, string> = {
      'BUNDLE_OVERVIEW': 'Bundle Overview',
      'VOCABULARY_PACK': 'Vocabulary Pack',
      'ANCHOR_READING_PASSAGE': 'Anchor Reading Passage',
      'READING_COMPREHENSION_QUESTIONS': 'Reading Comprehension',
      'SHORT_QUIZ': 'Short Quiz',
      'EXIT_TICKETS': 'Exit Tickets',
      'WRITING_PROMPTS': 'Writing Prompts',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
          <span className="ml-2 text-neutral-600">Loading template preview...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadPreview}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!preview) return null;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {getTemplateLabel(templateType)} Preview
          </h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            worldviewFlag === 'CHRISTIAN' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {worldviewFlag === 'CHRISTIAN' ? '✝️ Christian' : '📚 Neutral'}
          </span>
        </div>

        {/* Template Structure */}
        <div className="bg-neutral-50 p-4 rounded-lg">
          <h4 className="font-medium text-neutral-900 mb-2">Template Structure:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {preview.structure.fields.map((field) => (
              <div key={field.name} className="flex items-center space-x-2">
                <span className="font-mono text-primary-600">{field.name}</span>
                <span className="text-neutral-500">({field.type})</span>
                {field.required && <span className="text-red-500">*</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Preview Content */}
        <div className="space-y-3">
          <h4 className="font-medium text-neutral-900">Example Output:</h4>
          
          {templateType === 'ANCHOR_READING_PASSAGE' && (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-neutral-700">Title:</span>
                <p className="text-neutral-900">{preview.preview.title}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-neutral-700">Passage Preview:</span>
                <p className="text-neutral-600 text-sm italic">
                  {preview.preview.passage_text?.substring(0, 100)}...
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-700">Reading Level:</span>
                  <p>{preview.preview.reading_level}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Word Count:</span>
                  <p>{preview.preview.word_count}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-neutral-700">Key Vocabulary:</span>
                <ul className="text-sm text-neutral-600 mt-1">
                  {preview.preview.key_vocabulary?.slice(0, 2).map((vocab: string, idx: number) => (
                    <li key={idx}>• {vocab}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Christian Guidelines */}
        {worldviewFlag === 'CHRISTIAN' && preview.structure.christian_guidelines && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Christian Content Guidelines:</h4>
            <div className="space-y-1 text-sm text-blue-800">
              {Object.entries(preview.structure.christian_guidelines).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};