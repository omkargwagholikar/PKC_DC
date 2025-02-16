import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Check, X, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';

interface SubmittedFile {
  id: number;
  file: string;
  uploaded_at: string;
  file_name: string;
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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, FileContent>>({});
  const { tokens, setTokens } = useAuth();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    if (!tokens?.access) {
      setError('User is not authenticated');
      return;
    }
  
    try {
      setIsLoading(true);
  
      let response = await fetch('http://localhost:8000/api/submissions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`, // Include the token
        },
      });
  
      // Handle token expiration and retry with refreshed token
      if (response.status === 401) {
        console.log("Outdated tokens, refreshing");

        const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
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
  
          // Retry fetching submissions with the new token
          response = await fetch('http://localhost:8000/api/submissions', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${refreshData.access}`, // Use the refreshed token
            },
          });
        } else {
          setTokens(null);
          window.location.href = '/login';
          return;
        }
      }
  
      if (!response.ok) throw new Error('Failed to fetch submissions');
  
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching submissions');
    } finally {
      setIsLoading(false);
    }
  };

  
  const makeRequest = async (accessToken: string, status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
  
    const response = await fetch(`http://localhost:8000/api/submissions/${selectedSubmission.id}/judge/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Include the token
      },
      body: JSON.stringify({
        status,
        score: score ? parseFloat(score) : null, // Parse score as a float if provided
        feedback,
      }),
    });
  
    return response;
  };

  const handleJudgeSubmission = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
    if (!tokens) {
      throw new Error('User is not authenticated');
    }
  
    try {
      console.log("Submitting");
      let response = await makeRequest(tokens.access, status);
  
      // Handle token expiration and retry with refreshed token
      if (response?.status === 401) {
        const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
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
  
          // Retry the request with the new access token
          response = await makeRequest(refreshData.access, status);
        } else {
          setTokens(null);
          window.location.href = '/login';
          return;
        }
      }
  
      if (!response?.ok) {
        throw new Error('Failed to judge submission');
      }
  
      // Refresh submissions list after successful submission
      await fetchSubmissions();
      setSelectedSubmission(null);
      setScore(''); // Reset score input
      setFeedback(''); // Reset feedback input
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
      const response = await fetch(`http://localhost:8000/api/download${filePath}`);
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

  const downloadFileContent = async (filePath: string, fileName: string) => {
    console.log("Download file content");
      try {
        setFileContents(prev => ({
          ...prev,
          [filePath]: { content: '', loading: true, error: null }
        }));
    
        // Fetch the file
        const response = await fetch(`http://localhost:8000/api/download${filePath}`);
        
        if (!response.ok) throw new Error('Failed to download file');
        
        // Create a blob from the response data
        const blob = await response.blob();
        
        // Create an object URL for the file
        const url = URL.createObjectURL(blob);
    
        // Create an anchor element for downloading the file
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;  // Set the downloaded file's name
        document.body.appendChild(anchor);
        anchor.click();
    
        // Clean up by revoking the object URL
        URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
        
        // Update state after successful download (optional)
        setFileContents(prev => ({
          ...prev,
          [filePath]: { content: '', loading: false, error: null }
        }));
        
      } catch (err) {
        setFileContents(prev => ({
          ...prev,
          [filePath]: { 
            content: '', 
            loading: false, 
            error: err instanceof Error ? err.message : 'Failed to download file'
          }
        }));
      }
    };
  
  const renderFileContent = (file: any) => {
    if (!selectedSubmission) return null;
    if(!file) return null;

    console.log("Clicked here");
    console.log(file);
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Submitted Files:</h3>
        <Tabs defaultValue={file?.file} className="w-full">
          <TabsList className="mb-4">
            {/* {selectedSubmission.files.map((file) => ( */}
              <TabsTrigger
                key={file.id}
                value={file.file}
                onClick={() => fetchFileContent(file.file)}
              >
                {file.file_name.split('/').pop()}
              </TabsTrigger>
            {/* ))} */}
          </TabsList>
          
          {/* {selectedSubmission.files.map((file) => ( */}
            <TabsContent key={file.id} value={file.file}>
              {fileContents[file.file]?.loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading file...
                </div>
              ) : fileContents[file.file]?.error ? (
                <div className="text-red-500 p-4">
                  {fileContents[file.file].error}
                </div>
              ) : (
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <code>
                    {fileContents[file.file]?.content}
                  </code>
                </pre>
              )}
            </TabsContent>
          {/* ))} */}
        </Tabs>
      </div>
    );
  };

  // console.log("Here be tokens");
  // console.log(tokens?.access);
  // console.log(tokens?.refresh);

  // console.log(submissions);
  
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
    <div className="flex h-screen">
      {/* Left Panel - Questions List */}
      <div className="w-1/4 border-r p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Problems</h2>
        <div className="space-y-2">
          {uniqueQuestions.map(question => question && (
            // console.log(question)
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
      <div className="flex-1 p-6 overflow-y-auto">
        {
        selectedSubmission ? (
          <Card>
            <CardHeader>
              <CardTitle>Judge Submission - {selectedSubmission.player_name}</CardTitle>
              <CardDescription>
                Submitted at: {new Date(selectedSubmission.submitted_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Submitted Files:</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Uploaded At</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSubmission.files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>{file.file_name.split('/').pop()}</TableCell>
                          <TableCell>{new Date(file.uploaded_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild 
                              onClick={() => downloadFileContent(file.file, file.file.split('/').pop() || 'file')}
                              // onClick={() => {console.log(file.file);}}
                              >
                            
                              <a href={file.file} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </TableCell>
                          <TableCell>
                          <CardContent>
                            <div className="space-y-4">
                              {renderFileContent(file)}                              
                            </div>
                          </CardContent>
                          </TableCell>
                        </TableRow>                        
                      ))}
                    </TableBody>
                  </Table>
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
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select a problem from the left panel
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionJudgingPage;