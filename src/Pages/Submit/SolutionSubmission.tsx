import React from 'react';
import { SolutionForm } from './SolutionForm';
import { SolutionFormData } from './types';

export const SolutionSubmissionPage: React.FC<{ problemId: string }> = ({ problemId }) => {
  const handleSubmit = async (data: SolutionFormData) => {
    const formData = new FormData();
    formData.append('problemId', problemId);
    formData.append('language', data.language);
    formData.append('description', data.description);
    
    data.files.forEach((file, index) => {
      formData.append(`file_${file.type}_${index}`, file.file);
    });

    const response = await fetch('http://localhost:8000/player/solutions/', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to submit solution');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <SolutionForm problemId={problemId} onSubmit={handleSubmit} />
    </div>
  );
};