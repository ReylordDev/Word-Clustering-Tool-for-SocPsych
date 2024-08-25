import { Link } from "react-router-dom";
import { Header } from "./Header";

export default function LandingPage() {
  return (
    <>
      <Header index={0} />
      <div className="flex flex-col items-center gap-4 px-24 py-12">
        <h1 className="text-4xl">
          <span className="text-accent">Word</span>{" "}
          <span className="font-bold text-primary">Clustering</span>
          <br></br>
          based on LLM <span className="text-accent">Embeddings</span>
        </h1>
        <div className="my-14"></div>
        <div className="flex flex-col items-center justify-center gap-8">
          <p>
            Group your survey responses automatically based on their semantic
            similarity
          </p>
          <Link to="/file">
            <button className="w-48 rounded-full bg-primary p-4 px-8 text-background">
              <h5>Let's Start</h5>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
