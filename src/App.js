import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "./App.css";

const App = () => {
  const editorRef = useRef();
  const [output, setOutput] = useState("Output will appear here...");
  const [hint, setHint] = useState("");

  const runCode = async () => {
    const code = editorRef.current.getValue();
    setOutput("⏳ Compiling...");
    setHint("");

    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: 54, // C++
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY", // Replace this
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const { compile_output, stderr, stdout } = response.data;

      if (stderr || compile_output) {
        const errMsg = stderr || compile_output;
        setOutput(errMsg);
        setHint(generateHint(errMsg));
      } else {
        setOutput(stdout);
      }
    } catch (err) {
      setOutput("❌ Compilation failed: " + err.message);
    }
  };

  const generateHint = (error) => {
    const patterns = [
      {
        pattern: /‘std:cout’ was not declared/,
        fix: "You used `std:cout` with a single colon. Use `std::cout` instead.",
      },
      {
        pattern: /expected ‘;’/,
        fix: "Missing semicolon. Add `;` at the end of the line.",
      },
    ];

    for (const { pattern, fix } of patterns) {
      if (pattern.test(error)) return `💡 Hint: ${fix}`;
    }
    return "No specific hint available.";
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>LANGUAGES</h2>
        <button>C++</button>
      </div>

      {/* Main Content */}
      <div className="main">
        <div className="header">EDU - COMPILER</div>
        <div className="editor-area">
          <div className="editor-pane">
            <div className="label">CODE:</div>
            <Editor
              height="60%"
              defaultLanguage="cpp"
              defaultValue={`#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 10;\n  cout << x << endl;\n  return 0;\n}`}
              onMount={(editor) => (editorRef.current = editor)}
            />
            <div className="output-block">
              <div className="label">OUTPUT:</div>
              <pre>{output}</pre>
              <button onClick={runCode}>Run Code</button>
            </div>
          </div>

          <div className="hint-pane">
            <div className="hint-header">HINTS</div>
            <div className="hint-body">{hint || "No hints yet."}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
