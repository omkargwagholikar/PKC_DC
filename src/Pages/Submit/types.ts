export interface SolutionFile {
    file: File;
    preview?: string;
    type: 'code' | 'documentation' | 'additional';
  }
  
  export interface SolutionFormData {
    language: string;
    description: string;
    files: SolutionFile[];
  }
  
  export const ACCEPTED_FILE_TYPES = {
    code: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs'],
    documentation: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    additional: ['.zip', '.rar', '.pdf', '.doc', '.docx', '.txt', '.md', '.jpg', '.png']
  };
  
  export const PROGRAMMING_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
  ];