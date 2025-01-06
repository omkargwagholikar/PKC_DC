import React from 'react';
import { SolutionForm } from './SolutionForm';
import { SolutionFormData } from './types';
import { useAuth } from "@/context/AuthContext";

export const SolutionSubmissionPage: React.FC<{ problemId: string }> = ({ problemId }) => {
  
  const { tokens, setTokens } = useAuth();

  const handleSubmit = async (data: SolutionFormData) => {
    if (!tokens) {
      throw new Error('User is not authenticated');
    }
  
    const formData = new FormData();
    formData.append('problemId', problemId);
    formData.append('language', data.language);
    formData.append('description', data.description);
    
    data.files.forEach((file, index) => {
      formData.append(`file_${file.type}_${index}`, file.file);
    });
  
    const makeRequest = async (accessToken: string) => {
      return fetch('http://localhost:8000/player/solutions/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use the provided access token
        },
        body: formData,
      });
    };
  
    let response = await makeRequest(tokens.access);
    console.log(response.json());
    // Handle token expiration
    if (response.status === 401) {
      console.warn("Access token expired. Attempting to refresh...");
  
      // Refresh the access token
      const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
  
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
  
        // Update tokens in context
        setTokens({
          access: refreshData.access,
          refresh: tokens.refresh, // Keep the existing refresh token
        });
  
        // Retry the original request with the new access token
        response = await makeRequest(refreshData.access);
        console.log(response.json());
      } else {
        console.error("Refresh token expired or invalid. Redirecting to login...");
        setTokens(null); // Clear tokens
        window.location.href = '/login'; // Redirect to login page
        return;
      }
    }
  
    if (!response.ok) {
      throw new Error('Failed to submit solution');
    }
      
    console.log('Solution submitted successfully');
  };
  

  return (
    <div className="container mx-auto py-8">
      <SolutionForm problemId={problemId} onSubmit={handleSubmit} />
    </div>
  );
};