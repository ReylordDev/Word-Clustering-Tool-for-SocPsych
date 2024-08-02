import { createRoot } from "react-dom/client";

const reactContainer = document.getElementById("react-container");
if (!reactContainer) {
  throw new Error("No react container found");
}
const root = createRoot(reactContainer);
root.render(<h2>Hello from React!</h2>);
