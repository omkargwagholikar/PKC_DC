import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ProblemStatementViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedQuestionId = location.state?.question_id || 1;

  // Sample problem statements with their definitions  
  const allProblemStatements = [
    {
      question_id: 1,
      id: 1,
      title: "Sorting Algorithm Optimization",
      definition:
        "Design an efficient sorting algorithm that minimizes time complexity for large datasets while maintaining stability and minimal memory usage.",
      difficulty: "Easy",
      tags: ["Algorithms", "Performance"],
    },
    {
      question_id: 1,
      id: 2,
      title: "Network Traffic Analyzer",
      definition:
        "Create a system that can monitor and analyze network traffic in real-time, identifying potential bottlenecks and security threats.",
      difficulty: "Medium",
      tags: ["Networking", "Security"],
    },
    {
      question_id: 2,
      id: 3,
      title: "Machine Learning Model Interpretability",
      definition:
        "Develop a method to make complex machine learning models more interpretable, explaining their decision-making process in human-readable terms.",
      difficulty: "Hard",
      tags: ["AI", "Machine Learning"],
    },
    {
      question_id: 3,
      id: 4,
      title: "Distributed Cache System",
      definition:
        "Design a distributed caching system that ensures high availability, consistency, and low latency across multiple servers.",
      difficulty: "Hard",
      tags: ["Distributed Systems", "Performance"],
    },
  ];

  // Filter problem statements based on the selected question_id
  const filteredProblems = allProblemStatements.filter(
    problem => problem.question_id === selectedQuestionId
  );
  
  // State to track the selected problem
  const [selectedProblem, setSelectedProblem] = useState(
    filteredProblems.length > 0 ? filteredProblems[0] : null
  );

  // Update selected problem when filtered problems change
  useEffect(() => {
    if (filteredProblems.length > 0 && !selectedProblem) {
      setSelectedProblem(filteredProblems[0]);
    }
  }, [filteredProblems, selectedProblem]);

  if (filteredProblems.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-xl">No Problems Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              No problems found for the selected domain. Please go back and select a different domain.
            </p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => navigate('/')}
            >
              Back to Domains
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem List */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Problem Statements</h2>
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            onClick={() => setSelectedProblem(problem)}
            className={`
              p-3 mb-2 cursor-pointer rounded-lg transition-colors duration-200
              ${
                selectedProblem?.id === problem.id
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-blue-100 text-gray-800"
              }
            `}
          >
            <h3 className="font-semibold">{problem.title}</h3>
            <div className="flex justify-between mt-1">
              <span className="text-sm">
                {problem.difficulty === "Hard"
                  ? "🔴 Hard"
                  : problem.difficulty === "Medium"
                    ? "🟠 Medium"
                    : "🟢 Easy"}
              </span>
              <div className="flex gap-1">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs ${
                      selectedProblem?.id === problem.id 
                        ? "bg-blue-400 text-white" 
                        : "bg-gray-200 text-gray-700"
                    } px-1 rounded`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel - Problem Definition */}
      {selectedProblem && (
        <div className="w-2/3 p-6 bg-white overflow-y-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedProblem.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="font-semibold">Difficulty: </span>
                <span
                  className={`
                    px-2 py-1 rounded text-sm
                    ${
                      selectedProblem.difficulty === "Hard"
                        ? "bg-red-100 text-red-800"
                        : selectedProblem.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }
                  `}
                >
                  {selectedProblem.difficulty}
                </span>
              </div>
              <div className="flex gap-2 mb-4">
                {selectedProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6">{selectedProblem.definition}</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={() =>
                  navigate(`/submission`, {
                    state: { problem: selectedProblem },
                  })
                }
              >
                Submit Solution
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProblemStatementViewer;