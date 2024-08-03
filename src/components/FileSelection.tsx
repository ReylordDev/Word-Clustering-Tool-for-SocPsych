import { Link } from "react-router-dom";
import { Header } from "./Header";

export default function LandingPageStar() {
  return (
    <>
      <Header>File Selection</Header>
      <div className="flex items-center justify-center">
        <Link to={"/"}>
          <button className="bg-primary text-background w-48 rounded-full p-4 px-8">
            <h5>Let's Start</h5>
          </button>
        </Link>
      </div>
    </>
  );
}
