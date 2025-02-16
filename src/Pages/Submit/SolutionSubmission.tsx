import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SolutionForm } from './SolutionForm';
import { SolutionFormData } from './types';
import { useAuth } from "@/context/AuthContext";

export const SolutionSubmissionPage: React.FC<{ problemId: string }> = () => {
  const location = useLocation();
  const { problem } = location.state || {}; // Access problem data
  const { tokens, setTokens } = useAuth();
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const handleSubmit = async (data: SolutionFormData) => {
    if (!tokens) {
      throw new Error('User is not authenticated');
    }

    const formData = new FormData();
    formData.append('problemId', problem.id); // Use problem.id from state
    formData.append('language', data.language);
    formData.append('description', data.description);

    data.files.forEach((file, index) => {
      formData.append(`file_${file.type}_${index}`, file.file);
    });

    const makeRequest = async (accessToken: string) => {
      return fetch(`${API_BASE_URL}/player/solutions/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
    };

    let response = await makeRequest(tokens.access);
    if (response.status === 401) {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setTokens({
          access: refreshData.access,
          refresh: tokens.refresh,
        });
        response = await makeRequest(refreshData.access);
      } else {
        setTokens(null);
        window.location.href = '/login';
        return;
      }
    }

    if (!response.ok) {
      throw new Error('Failed to submit solution');
    }
    
    setSubmissionSuccess('Solution submitted successfully! 🎉');
    console.log('Solution submitted successfully');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{problem?.title}</h1>
      <p className="text-gray-700 mb-6">{problem?.definition}</p>
      {submissionSuccess && <p className="text-green-500">{submissionSuccess}</p>}

      <SolutionForm problemId={problem?.id || ''} onSubmit={handleSubmit} />
    </div>
  );
};
