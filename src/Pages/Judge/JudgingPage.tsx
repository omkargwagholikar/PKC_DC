import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Check, X, Loader2, FileText, Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';

interface SubmittedFile {
  id: number;
  file: string;
  uploaded_at: string;
}

interface Question {
  question_id: number;
  domain: string;
  problem_title: string;
  difficulty_level: string;
}

interface Submission {
  id: number;
  player_name: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  score: number | null;
  feedback: string | null;
  files: SubmittedFile[];
  question: Question;
  special_notes: string;
}

interface FileContent {
  content: string;
  loading: boolean;
  error: string | null;
}

const SubmissionJudgingPage = () => {
  const { tokens } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, FileContent>>({});
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/submissions', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJudgeSubmission = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
    try {
      const response = await fetch(`http://localhost:8000/api/submissions/${selectedSubmission.id}/judge/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          status,
          score: score ? parseFloat(score) : null,
          feedback,
        }),
      });
      if (!response.ok) throw new Error('Failed to judge submission');
      await fetchSubmissions();
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to judge submission');
    }
  };

  const fetchFileContent = async (filePath: string) => {
    if (fileContents[filePath]?.content) return;

    setFileContents(prev => ({
      ...prev,
      [filePath]: { content: '', loading: true, error: null }
    }));

    try {
      const response = await fetch(`http://localhost:8000/api/download${filePath}`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch file content');
      const content = await response.text();
      
      setFileContents(prev => ({
        ...prev,
        [filePath]: { content, loading: false, error: null }
      }));
    } catch (err) {
      setFileContents(prev => ({
        ...prev,
        [filePath]: { 
          content: '', 
          loading: false, 
          error: err instanceof Error ? err.message : 'Failed to load file'
        }
      }));
    }
  };


  const downloadAllFiles = async (submission: Submission) => {
    try {
      const response = await fetch(`http://localhost:8000/api/submissions/${submission.id}/download-all`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download files');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission_${submission.id}_files.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading files:', err);
    }
  };

  const downloadSingleFile = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/download${filePath}`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const FileViewerDialog = ({ submission, isOpen, onClose, onDownloadAll, onDownloadFile }: {
    submission: Submission;
    isOpen: boolean;
    onClose: () => void;
    onDownloadAll: (submission: Submission) => void;
    onDownloadFile: (filePath: string, fileName: string) => void;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col w-11/12 h-[85vh] max-w-6xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Submitted Files - {submission.player_name}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Submission ID: {submission.id} | Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onDownloadAll(submission)}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Download All Files
            </Button>
          </div>
        </DialogHeader>
  
        <Tabs defaultValue={submission.files[0]?.file} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b">
            <TabsList>
              {submission.files.map((file) => (
                <TabsTrigger
                  key={file.id}
                  value={file.file}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {file.file.split('/').pop()}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {submission.files.map((file) => (
              <TabsContent 
                key={file.id} 
                value={file.file} 
                className="h-full m-0 data-[state=active]:flex flex-col"
              >
                <div className="flex justify-between items-center px-6 py-2 bg-gray-50 border-b">
                  <span className="text-sm text-gray-600">
                    File: {file.file.split('/').pop()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadFile(file.file, file.file.split('/').pop() || 'file')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {fileContents[file.file]?.loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading file...</span>
                    </div>
                  ) : fileContents[file.file]?.error ? (
                    <div className="text-red-500 p-4">
                      {fileContents[file.file].error}
                    </div>
                  ) : (
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono text-sm">
                      <code>{fileContents[file.file]?.content}</code>
                    </pre>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
  
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchSubmissions} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const uniqueQuestions = Array.from(
    new Set(submissions.map(s => s.question.question_id))
  ).map(id => submissions.find(s => s.question.question_id === id)?.question);

  const filteredSubmissions = selectedQuestion
    ? submissions.filter(s => s.question.question_id === selectedQuestion)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Questions List */}
        <div className="col-span-3 bg-gray-50 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Problems</h2>
          <div className="space-y-2">
            {uniqueQuestions.map(question => question && (
              <Button
                key={question.question_id}
                variant={selectedQuestion === question.question_id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedQuestion(question.question_id);
                  setSelectedSubmission(null);
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Problem #{question.question_id}</div>
                  <div className="text-sm text-gray-500">{question.problem_title}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Right Panel - Submissions List and Judging Form */}
        <div className="col-span-9">
          {selectedSubmission ? (
            <Card>
              <CardHeader>
                <CardTitle>Judge Submission - {selectedSubmission.player_name}</CardTitle>
                <CardDescription>
                  Submitted at: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Submitted Files:</h3>
                    <Button
                      variant="outline"
                      onClick={() => setIsFileDialogOpen(true)}
                      className="w-full justify-center py-8"
                    >
                      <FileText className="h-6 w-6 mr-2" />
                      View Files ({selectedSubmission.files.length})
                    </Button>
                  </div>

                  {selectedSubmission.special_notes && (
                    <div>
                      <Label>Special Notes</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedSubmission.special_notes}</p>
                    </div>
                  )}

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="score">Score (0-100)</Label>
                    <Input
                      id="score"
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      min="0"
                      max="100"
                      className="w-32"
                    />
                  </div>

                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleJudgeSubmission('approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleJudgeSubmission('rejected')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedQuestion ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                {filteredSubmissions[0]?.question.problem_title}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>{submission.player_name}</TableCell>
                          <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {submission.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{submission.files.length} files</TableCell>
                          <TableCell>
                            <Button 
                              onClick={() => setSelectedSubmission(submission)}
                              disabled={submission.status !== 'pending'}
                            >
                              {submission.status === 'pending' ? 'Judge' : 'View'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Select a problem from the left panel
            </div>
          )}
        </div>
      </div>
      {selectedSubmission && <FileViewerDialog 
          submission={selectedSubmission}
          isOpen={isFileDialogOpen}
          onClose={() => setIsFileDialogOpen(false)}
          onDownloadAll={downloadAllFiles}
          onDownloadFile={downloadSingleFile}
        />}
    </div>
  );
};

export default SubmissionJudgingPage;





// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Download, Check, X, Loader2 } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from '@/context/AuthContext';

// interface SubmittedFile {
//   id: number;
//   file: string;
//   uploaded_at: string;
// }

// interface Question {
//   question_id: number;
//   domain: string;
//   problem_title: string;
//   difficulty_level: string;
// }

// interface Submission {
//   id: number;
//   player_name: string;
//   submitted_at: string;
//   status: 'pending' | 'approved' | 'rejected';
//   score: number | null;
//   feedback: string | null;
//   files: SubmittedFile[];
//   question: Question;
//   special_notes: string;
// }

// interface FileContent {
//   content: string;
//   loading: boolean;
//   error: string | null;
// }

// const SubmissionJudgingPage = () => {
//   const { tokens } = useAuth();

//   const [submissions, setSubmissions] = useState<Submission[]>([]);
//   const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
//   const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
//   const [score, setScore] = useState<string>('');
//   const [feedback, setFeedback] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [fileContents, setFileContents] = useState<Record<string, FileContent>>({});

//   useEffect(() => {
//     fetchSubmissions();
//   }, []);

//   const fetchSubmissions = async () => {
//     try {
//       setIsLoading(true);
//       // const response = await fetch('http://localhost:8000/api/submissions');

//       const response = await fetch('http://localhost:8000/api/submissions', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${tokens?.access}`, // Include the token
//         },
//       });

//       if (!response.ok) throw new Error('Failed to fetch submissions');
//       const data = await response.json();
//       setSubmissions(data.submissions);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleJudgeSubmission = async (status: 'approved' | 'rejected') => {
//     if (!selectedSubmission) return;
//     try {
//       // const response = await fetch(`http://localhost:8000/api/submissions/${selectedSubmission.id}/judge/`, {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ status, score: score ? parseFloat(score) : null, feedback }),
//       // });
      
//       const response = await fetch(`http://localhost:8000/api/submissions/${selectedSubmission.id}/judge/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${tokens?.access}`, // Include the token
//         },
//         body: JSON.stringify({
//           status,
//           score: score ? parseFloat(score) : null, // Parse score as a float if provided
//           feedback,
//         }),
//       });
//       if (!response.ok) throw new Error('Failed to judge submission');
//       await fetchSubmissions();
//       setSelectedSubmission(null);
//       setScore('');
//       setFeedback('');
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to judge submission');
//     }
//   };

//   const fetchFileContent = async (filePath: string) => {
//     if (fileContents[filePath]?.content) return;

//     setFileContents(prev => ({
//       ...prev,
//       [filePath]: { content: '', loading: true, error: null }
//     }));

//     try {
//       const response = await fetch(`http://localhost:8000/api/download${filePath}`);
//       if (!response.ok) throw new Error('Failed to fetch file content');
//       const content = await response.text();
      
//       setFileContents(prev => ({
//         ...prev,
//         [filePath]: { content, loading: false, error: null }
//       }));
//     } catch (err) {
//       setFileContents(prev => ({
//         ...prev,
//         [filePath]: { 
//           content: '', 
//           loading: false, 
//           error: err instanceof Error ? err.message : 'Failed to load file'
//         }
//       }));
//     }
//   };

//   const renderFileContent = () => {
//     if (!selectedSubmission) return null;

//     return (
//       <div className="space-y-4">
//         <h3 className="font-semibold">Submitted Files:</h3>
//         <Tabs defaultValue={selectedSubmission.files[0]?.file} className="w-full">
//           <TabsList className="mb-4">
//             {selectedSubmission.files.map((file) => (
//               <TabsTrigger
//                 key={file.id}
//                 value={file.file}
//                 onClick={() => fetchFileContent(file.file)}
//               >
//                 {file.file.split('/').pop()}
//               </TabsTrigger>
//             ))}
//           </TabsList>
          
//           {selectedSubmission.files.map((file) => (
//             <TabsContent key={file.id} value={file.file}>
//               {fileContents[file.file]?.loading ? (
//                 <div className="flex items-center justify-center p-4">
//                   <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                   Loading file...
//                 </div>
//               ) : fileContents[file.file]?.error ? (
//                 <div className="text-red-500 p-4">
//                   {fileContents[file.file].error}
//                 </div>
//               ) : (
//                 <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
//                   <code>{fileContents[file.file]?.content}</code>
//                 </pre>
//               )}
//             </TabsContent>
//           ))}
//         </Tabs>
//       </div>
//     );
//   };

//   console.log("Here be tokens");
//   console.log(tokens?.access);
//   console.log(tokens?.refresh);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Loader2 className="h-6 w-6 animate-spin mr-2" />
//         <span>Loading submissions...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Card className="w-96">
//           <CardHeader>
//             <CardTitle className="text-red-600">Error</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p>{error}</p>
//             <Button onClick={fetchSubmissions} className="mt-4">Try Again</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const uniqueQuestions = Array.from(
//     new Set(submissions.map(s => s.question.question_id))
//   ).map(id => submissions.find(s => s.question.question_id === id)?.question);

//   const filteredSubmissions = selectedQuestion
//     ? submissions.filter(s => s.question.question_id === selectedQuestion)
//     : [];

//   return (
//     <div className="flex h-screen">
//       {/* Left Panel - Questions List */}
//       <div className="w-1/4 border-r p-4 bg-gray-50">
//         <h2 className="text-xl font-bold mb-4">Problems</h2>
//         <div className="space-y-2">
//           {uniqueQuestions.map(question => question && (
//             <Button
//               key={question.question_id}
//               variant={selectedQuestion === question.question_id ? "default" : "ghost"}
//               className="w-full justify-start"
//               onClick={() => {
//                 setSelectedQuestion(question.question_id);
//                 setSelectedSubmission(null);
//               }}
//             >
//               <div className="text-left">
//                 <div className="font-medium">Problem #{question.question_id}</div>
//                 <div className="text-sm text-gray-500">{question.problem_title}</div>
//               </div>
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* Right Panel - Submissions List and Judging Form */}
//       <div className="flex-1 p-6 overflow-y-auto">
//         {selectedSubmission ? (
//           <Card>
//             <CardHeader>
//               <CardTitle>Judge Submission - {selectedSubmission.player_name}</CardTitle>
//               <CardDescription>
//                 Submitted at: {new Date(selectedSubmission.submitted_at).toLocaleString()}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="font-semibold mb-2">Submitted Files:</h3>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>File</TableHead>
//                         <TableHead>Uploaded At</TableHead>
//                         <TableHead>Action</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {selectedSubmission.files.map((file) => (
//                         <TableRow key={file.id}>
//                           <TableCell>{file.file.split('/').pop()}</TableCell>
//                           <TableCell>{new Date(file.uploaded_at).toLocaleString()}</TableCell>
//                           <TableCell>
//                             <Button variant="ghost" size="sm" asChild>
//                               <a href={file.file} target="_blank" rel="noopener noreferrer">
//                                 <Download className="h-4 w-4 mr-2" />
//                                 Download
//                               </a>
//                             </Button>
//                           </TableCell>
//                           <TableCell>
//                           <CardContent>
//                             <div className="space-y-4">
//                               {renderFileContent()}                              
//                             </div>
//                           </CardContent>
//                           </TableCell>
//                         </TableRow>                        
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {selectedSubmission.special_notes && (
//                   <div>
//                     <Label>Special Notes</Label>
//                     <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedSubmission.special_notes}</p>
//                   </div>
//                 )}

//                 <div className="grid w-full items-center gap-1.5">
//                   <Label htmlFor="score">Score (0-100)</Label>
//                   <Input
//                     id="score"
//                     type="number"
//                     value={score}
//                     onChange={(e) => setScore(e.target.value)}
//                     min="0"
//                     max="100"
//                     className="w-32"
//                   />
//                 </div>

//                 <div className="grid w-full gap-1.5">
//                   <Label htmlFor="feedback">Feedback</Label>
//                   <Textarea
//                     id="feedback"
//                     value={feedback}
//                     onChange={(e) => setFeedback(e.target.value)}
//                     className="min-h-[100px]"
//                   />
//                 </div>

//                 <div className="flex gap-4">
//                   <Button
//                     onClick={() => handleJudgeSubmission('approved')}
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     <Check className="mr-2 h-4 w-4" />
//                     Approve
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     onClick={() => handleJudgeSubmission('rejected')}
//                   >
//                     <X className="mr-2 h-4 w-4" />
//                     Reject
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => setSelectedSubmission(null)}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ) : selectedQuestion ? (
//           <>
//             <h2 className="text-2xl font-bold mb-4">
//               {filteredSubmissions[0]?.question.problem_title}
//             </h2>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Player</TableHead>
//                   <TableHead>Submitted At</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Files</TableHead>
//                   <TableHead>Action</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredSubmissions.map((submission) => (
//                   <TableRow key={submission.id}>
//                     <TableCell>{submission.player_name}</TableCell>
//                     <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
//                     <TableCell>
//                       <Badge variant="default">
//                         {submission.status.toUpperCase()}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{submission.files.length} files</TableCell>
//                     <TableCell>
//                       <Button 
//                         onClick={() => setSelectedSubmission(submission)}
//                         disabled={submission.status !== 'pending'}
//                       >
//                         {submission.status === 'pending' ? 'Judge' : 'View'}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </>
//         ) : (
//           <div className="flex justify-center items-center h-full text-gray-500">
//             Select a problem from the left panel
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SubmissionJudgingPage;