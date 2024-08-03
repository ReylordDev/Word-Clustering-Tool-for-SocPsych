import { Link } from "react-router-dom";
import { Header } from "./Header";

export default function LandingPage() {
  return (
    <>
      <Header>
        <span className="text-secondary">Word </span>
        <span className="text-primary">Clustering </span>
        <br />
        based on LLM
        <span className="text-secondary"> Embeddings</span>
      </Header>
      <div className="mt-72"></div>
      <div className="flex items-center justify-center">
        <Link to="/file">
          <button className="bg-primary text-background w-48 rounded-full p-4 px-8">
            <h5>Let's Start</h5>
          </button>
        </Link>
      </div>
    </>
  );
}
