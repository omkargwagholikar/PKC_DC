import { useState } from "react";
// import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ProblemStatementViewer = () => {
  // Sample problem statements with their definitions
  const problemStatements = [
    {
      id: 1,
      title: "Sorting Algorithm Optimization",
      definition:
        "Design an efficient sorting algorithm that minimizes time complexity for large datasets while maintaining stability and minimal memory usage.",
      difficulty: "Easy",
      tags: ["Algorithms", "Performance"],
    },
    {
      id: 2,
      title: "Network Traffic Analyzer",
      definition:
        "Create a system that can monitor and analyze network traffic in real-time, identifying potential bottlenecks and security threats.",
      difficulty: "Medium",
      tags: ["Networking", "Security"],
    },
    {
      id: 3,
      title: "Machine Learning Model Interpretability",
      definition:
        "Develop a method to make complex machine learning models more interpretable, explaining their decision-making process in human-readable terms.",
      difficulty: "Hard",
      tags: ["AI", "Machine Learning"],
    },
    {
      id: 4,
      title: "Distributed Cache System",
      definition:
        "Design a distributed caching system that ensures high availability, consistency, and low latency across multiple servers.",
      difficulty: "Hard",
      tags: ["Distributed Systems", "Performance"],
    },
  ];

  // State to track the selected problem
  const [selectedProblem, setSelectedProblem] = useState(problemStatements[0]);

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem List */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Problem Statements</h2>
        {problemStatements.map((problem) => (
          <div
            key={problem.id}
            onClick={() => setSelectedProblem(problem)}
            className={`
              p-3 mb-2 cursor-pointer rounded-lg transition-colors duration-200
              ${
                selectedProblem.id === problem.id
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
                    className="text-xs bg-gray-200 text-gray-700 px-1 rounded"
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
            <p className="text-gray-700">{selectedProblem.definition}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProblemStatementViewer;
