import { useEffect, useState } from "react";

export default function App() {
  const [pythonExists, setPythonExists] = useState(false);
  const [hasMinimalPythonVersion, setHasMinimalPythonVersion] = useState(false);
  const [setupScriptMessages, setSetupScriptMessages] = useState<string[]>([]);

  useEffect(() => {
    window.python.isPythonInstalled().then((result) => {
      setPythonExists(result);
    });
  }, []);

  useEffect(() => {
    window.python.hasMinimalPythonVersion().then((result) => {
      setHasMinimalPythonVersion(result);
      window.python.runSetupScript();
    });
  }, [pythonExists]);

  window.python.onSetupScriptMessage((event, message) => {
    console.log(message);
    setSetupScriptMessages((prevMessages) => {
      if (prevMessages.includes(message)) return prevMessages;
      if (message.includes("The application is ready to use.")) {
        window.startup.complete();
      }
      return [...prevMessages, message];
    });
  });

  return (
    <>
      <h3>Setting up...</h3>
      {pythonExists ? (
        <h4>Python is installed</h4>
      ) : (
        <div>
          <h4>Python is not installed!</h4>
          <p>
            Please install Python 3.7 or higher from{" "}
            <a href="https://www.python.org/downloads/">
              <span>python.org</span>
            </a>
          </p>
        </div>
      )}
      {hasMinimalPythonVersion ? (
        <h4>Python version is sufficient</h4>
      ) : (
        <div>
          <h4>Python version is insufficient!</h4>
          <p>
            Please install Python 3.7 or higher from{" "}
            <a href="https://www.python.org/downloads/">
              <span>python.org</span>
            </a>
          </p>
        </div>
      )}
      <div>
        <h4>Setup script messages:</h4>
        <ul>
          {setupScriptMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
