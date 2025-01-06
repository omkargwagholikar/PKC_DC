import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Check, X, Clock, Loader2 } from 'lucide-react';


interface SubmittedFile {
  id: number;
  filename: string;
  file_url: string;
}

interface Submission {
  id: number;
  player_name: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  files: SubmittedFile[];
  score?: number;
  feedback?: string;
}

const getStatusBadge = (status: Submission['status']) => {
  const statusConfig = {
    pending: { label: 'Pending Review', class: 'bg-yellow-500 hover:bg-yellow-600', icon: Clock },
    approved: { label: 'Approved', class: 'bg-green-500 hover:bg-green-600', icon: Check },
    rejected: { label: 'Rejected', class: 'bg-red-500 hover:bg-red-600', icon: X }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.class} gap-1`}>
      <Icon size={14} />
      {config.label}
    </Badge>
  );
};

const SubmissionJudgingPage = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [currentScore, setCurrentScore] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch submissions when component mounts
    useEffect(() => {
      fetchSubmissions();
    }, []);
  
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/judge/submissions/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
  
        const data = await response.json();
        setSubmissions(data.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

  const handleJudgeSubmission = async (submissionId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/judge/submissions/${submissionId}/judge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          score: parseFloat(currentScore),
          feedback,
        }),
      });

      if (response.ok) {
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status, score: parseFloat(currentScore), feedback } 
            : sub
        ));
        setCurrentScore('');
        setFeedback('');
      }
    } catch (error) {
      console.error('Error judging submission:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading submissions...</span>
        </div>
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
            <Button 
              onClick={fetchSubmissions} 
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Submission Judging</h1>
          <p className="text-gray-500 mt-1">Review and evaluate participant submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock size={14} />
            {submissions.filter(s => s.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Check size={14} />
            {submissions.filter(s => s.status === 'approved').length} Approved
          </Badge>
          <Badge variant="outline" className="gap-1">
            <X size={14} />
            {submissions.filter(s => s.status === 'rejected').length} Rejected
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[800px] rounded-lg border">
        <div className="p-4 space-y-6">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{submission.player_name}'s Submission</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(submission.submitted_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Files Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Submitted Files</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submission.files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="flex items-center gap-2">
                              <FileText size={16} />
                              {file.filename}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(file.file_url, '_blank')}
                              >
                                <Download size={16} className="mr-2" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  {/* Judging Form */}
                  {submission.status === 'pending' && (
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="score">Score (0-100)</Label>
                        <Input
                          id="score"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={currentScore}
                          onChange={(e) => setCurrentScore(e.target.value)}
                          className="w-32"
                        />
                      </div>
                      
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide detailed feedback for the submission..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleJudgeSubmission(submission.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve Submission
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleJudgeSubmission(submission.id, 'rejected')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject Submission
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Judged Results */}
                  {submission.status !== 'pending' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">Final Score</Label>
                          <p className="text-2xl font-bold">{submission.score}/100</p>
                        </div>
                      </div>
                      {submission.feedback && (
                        <div>
                          <Label className="text-sm text-gray-500">Feedback Provided</Label>
                          <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SubmissionJudgingPage;