import { apiClient } from './client';
import { TemplateType } from '../types/api';

export interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  max_length?: number;
  constraints: string[];
}

export interface TemplateStructure {
  template_type: TemplateType;
  fields: TemplateField[];
  christian_guidelines: Record<string, string>;
  grade_constraints: Record<string, any>;
}

export interface TemplatePreview {
  template_type: TemplateType;
  preview: Record<string, any>;
  structure: TemplateStructure;
}

export const templatesApi = {
  // Get available templates
  getAvailableTemplates: async (): Promise<{ templates: string[] }> => {
    const response = await apiClient.get('/v1/templates');
    return response.data;
  },

  // Get template structure
  getTemplateStructure: async (templateType: TemplateType): Promise<{ data: TemplateStructure }> => {
    const response = await apiClient.get(`/v1/templates/${templateType}`);
    return response.data;
  },

  // Get template preview
  getTemplatePreview: async (templateType: TemplateType): Promise<TemplatePreview> => {
    const response = await apiClient.get(`/v1/templates/${templateType}/preview`);
    return response.data;
  },
};