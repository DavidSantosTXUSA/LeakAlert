"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [results, setResults] = useState({
    uses2FA: false,
    reusesPasswords: false,
    browserHTTPS: true,
    breached: false,
    breachCount: 0,
    breachDetails: [] as { name: string; domain: string; date: string }[],
  });


  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5050/login", {
        email,
        password,
      });
      setToken(res.data.token);
      setIsLoggedIn(true);
    } catch {
      alert("Login failed");
    }
  };

  const register = async () => {
    try {
      const res = await axios.post("http://localhost:5050/register", {
        email,
        password,
      });

      if (res.status === 201) {
        alert("Registration successful! You can now log in.");
        setIsRegistering(false);
        setEmail("");
        setPassword("");
        setRegisterError("");
      }
    } catch (err) {
      setRegisterError("Registration failed. Email may already be in use.");
    }
  };

  const runAudit = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5050/audit/${email}`
      );
      const breachCount = res.data.breaches.length;
      setResults((prev) => ({
        ...prev,
        breached: breachCount > 0,
        breachCount,
        breachDetails: res.data.breaches.map((b: any) => ({
          name: b.Name,
          domain: b.Domain,
          date: b.BreachDate,
        })),
      }));


      await axios.post("http://localhost:5050/audit/submit", {
        email,
        results,
      });
    } catch {
      alert("Audit failed");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SecAudit Security Report", 20, 20);

    doc.setFontSize(12);
    let y = 40;
    doc.text(`Email: ${email}`, 20, y); y += 10;
    doc.text(`2FA Enabled: ${results.uses2FA ? "Yes" : "No"}`, 20, y); y += 10;
    doc.text(`Password Reuse: ${results.reusesPasswords ? "Yes" : "No"}`, 20, y); y += 10;
    doc.text(`Browser blocks HTTP: ${results.browserHTTPS ? "Yes" : "No"}`, 20, y); y += 10;
    doc.text(`Breached Accounts Found: ${results.breachCount}`, 20, y); y += 10;

    if (results.breached && results.breachDetails.length > 0) {
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text("Breached Sites:", 20, y); y += 10;

      doc.setFontSize(12);
      results.breachDetails.forEach((b, i) => {
        doc.text(`${i + 1}. ${b.name || "Unknown"} (${b.domain || "unknown"}) - ${b.date || "unknown"}`, 20, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      doc.setTextColor(255, 0, 0);
      doc.text("Change your passwords on these services!", 20, y); y += 10;
    }

    if (results.breached) {
      doc.setTextColor(255, 0, 0);
      doc.text("Warning: Your email was found in public data breaches!", 20, y); y += 10;
    } else {
      doc.setTextColor(0, 128, 0);
      doc.text("Good news: No public breaches were found for this email.", 20, y); y += 10;
    }

    doc.save("SecAudit_Report.pdf");
  };


  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold mb-2">

          {isRegistering ? "Register" : "Login"} to SecAudit
        </h1>
        <p className="text-gray-300 mb-4">
          SecAudit scans your account's email using the HaveIBeenPwned API to check if it's been found in any public data breaches.
          It also evaluates your basic security hygiene (2FA, password reuse, HTTPS usage).
          Once complete, you’ll get a downloadable security audit report in PDF format.
        </p>

        <p className="text-gray-300 text-sm mb-2">
          {isRegistering
            ? "Create a new SecAudit account. Passwords are encrypted before storage."
            : "Welcome back! Log in to run your personal security audit."}
        </p>

        {!isLoggedIn ? (
          <>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-700 rounded bg-black text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-700 rounded bg-black text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={isRegistering ? register : login}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              {isRegistering ? "Register" : "Login"}
            </button>

            {registerError && (
              <p className="text-red-500 text-sm">{registerError}</p>
            )}

            <p
              className="text-blue-400 underline cursor-pointer text-sm"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </p>
          </>
        ) : (
          <>
            <label className="block">
              <input
                type="checkbox"
                checked={results.uses2FA}
                onChange={(e) =>
                  setResults((r) => ({ ...r, uses2FA: e.target.checked }))
                }
              />{" "}
              Do you use 2FA?
            </label>
            <label className="block">
              <input
                type="checkbox"
                checked={results.reusesPasswords}
                onChange={(e) =>
                  setResults((r) => ({ ...r, reusesPasswords: e.target.checked }))
                }
              />{" "}
              Do you reuse passwords?
            </label>
            <label className="block">
              <input
                type="checkbox"
                checked={results.browserHTTPS}
                onChange={(e) =>
                  setResults((r) => ({ ...r, browserHTTPS: e.target.checked }))
                }
              />{" "}
              Does your browser block insecure (HTTP) sites?
            </label>
            {results.breached && results.breachDetails.length > 0 && (
              <div className="mt-4 bg-red-900 p-4 rounded">
                <h3 className="text-lg font-bold text-red-300">Breached Accounts:</h3>
                <ul className="text-sm list-disc list-inside">
                  {results.breachDetails.map((b, i) => (
                    <li key={i}>
                      {b.name} ({b.domain}) - Breached on {b.date}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={runAudit}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mt-4"
            >
              Run Security Audit
            </button>

            {results.breachCount > 0 || results.breachCount === 0 ? (
              <button
                onClick={generatePDF}
                className="w-full bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white mt-2"
              >
                Download PDF Report
              </button>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
