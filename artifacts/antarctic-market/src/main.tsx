import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
rootElement.replaceChildren();
const root = createRoot(rootElement);

flushSync(() => {
  root.render(<App />);
});
