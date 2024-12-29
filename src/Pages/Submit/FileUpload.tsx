import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, File } from 'lucide-react';
import { SolutionFile } from './types';

interface FileUploadProps {
  label: string;
  acceptedTypes: string[];
  files: SolutionFile[];
  onChange: (files: SolutionFile[]) => void;
  maxFiles?: number;
  type: 'code' | 'documentation' | 'additional';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  acceptedTypes,
  files,
  onChange,
  maxFiles = 1,
  type
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []).map(file => ({
      file,
      type,
    }));

    if (maxFiles === 1) {
      onChange(newFiles);
    } else {
      onChange([...files, ...newFiles].slice(0, maxFiles));
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const id = `file-upload-${type}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {files.length}/{maxFiles} files
        </span>
      </div>
      
      <div className="flex gap-4 items-center">
        <input
          id={id}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          multiple={maxFiles > 1}
          disabled={files.length >= maxFiles}
        />
        <Label
          htmlFor={id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer
            ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/90'}
            bg-secondary text-secondary-foreground
          `}
        >
          <Upload className="h-4 w-4" />
          Upload {label}
        </Label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-secondary/10 p-2 rounded group"
            >
              <File className="h-4 w-4 shrink-0" />
              <span className="truncate">{file.file.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(file.file.size / 1024).toFixed(1)} KB)
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto opacity-0 group-hover:opacity-100"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};