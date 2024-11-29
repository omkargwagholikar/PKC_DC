import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
import ProblemStatementViewer from "./Pages/ProblemStatementViewer/ProblemStatementViewer";
import { Navbar } from "./Pages/NavBar/NavBar";
import Login from "./Pages/Login/Login";
import DomainsList from "./Pages/Domains/domain-list";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="App">
          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <Routes>
            <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/domains" element={<DomainsList />} />
            <Route path="/problem-page" element={<ProblemStatementViewer />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
