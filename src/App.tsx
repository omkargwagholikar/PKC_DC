import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import ProblemStatementViewer from "./Pages/ProblemStatementViewer/ProblemStatementViewer";
import { Navbar } from "./Pages/NavBar/NavBar";
import Login from "./Pages/Login/Login";
import DomainsList from "./Pages/Domains/domain-list";
import { ThemeProvider } from "@/components/theme-provider";
import {AuthProvider} from "./context/AuthContext"
import { SolutionSubmissionPage } from "./Pages/Submit/SolutionSubmission";
import SubmissionJudgingPage from "./Pages/Judge/JudgingPage";

function App() {

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <div className="App">
            <Navbar  />
            <Routes>
              <Route path="/" element={<DomainsList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/domains" element={<DomainsList />} />
              <Route path="/problem-page" element={<ProblemStatementViewer />} />
              <Route path="/submission" element={<SolutionSubmissionPage problemId="-1" />} />
              <Route path="/judge" element={<SubmissionJudgingPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
