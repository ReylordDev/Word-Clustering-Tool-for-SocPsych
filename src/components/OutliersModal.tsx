import { useEffect, useState } from "react";
import { AlertCircle, X, ChevronUp, ChevronDown } from "lucide-react";

function OutliersModal({
  path,
  nearestNeighbors,
  zScoreThreshold,
  isOpen,
  setIsOpen,
}: {
  path: string;
  nearestNeighbors: number;
  zScoreThreshold: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [outliers, setOutliers] = useState<
    { response: string; similarity: number }[]
  >([]);
  const [threshold, setThreshold] = useState<number>(0.95);
  const precision = 3;

  useEffect(() => {
    window.python.readJsonFile(path).then((value: unknown) => {
      const data = value as {
        response: string;
        similarity: number;
        threshold: number;
      }[];
      setOutliers(
        data.map((outlier) => ({
          response: outlier.response,
          similarity: outlier.similarity,
        })),
      );
      setThreshold(data[0].threshold);
    });
  }, []);

  const OutlierCard = ({
    outlier,
  }: {
    outlier: { response: string; similarity: number };
    threshold: number;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // This is awkward because sometimes we show the option to expand the text even if there is nothing to expand
    // TODO: Refactor this to be more elegant
    const shouldTruncate = outlier.response.length > 100;

    return (
      <div className="rounded-lg border bg-white p-4 shadow-md">
        <div className="flex items-start space-x-3">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-accent" size={20} />
          <div className="flex-grow">
            <p
              className={`${shouldTruncate && !isExpanded ? "line-clamp-2" : ""}`}
            >
              "{outlier.response}"
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 flex items-center text-sm text-blue-500"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Read more</span>
                  </>
                )}
              </button>
            )}
            <div className="mt-2 flex justify-between px-2 text-sm">
              <p>
                Similarity:{" "}
                <span className="font-semibold">
                  {outlier.similarity.toFixed(precision)}
                </span>
              </p>
              <p>
                Threshold:{" "}
                <span className="font-semibold">
                  {threshold.toFixed(precision)}
                </span>
              </p>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-accent"
                style={{
                  width: `${(outlier.similarity / threshold) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="h-[90vh] w-full max-w-4xl rounded-lg bg-background shadow-xl">
            <div className="flex flex-col gap-2 border-b p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Response Outliers</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-text focus:outline-none"
                >
                  <X size={36} />
                </button>
              </div>
              <div>
                <p>
                  Displaying{" "}
                  <span className="font-semibold">{outliers.length}</span>{" "}
                  outlier responses.
                </p>
                <p className="text-sm">
                  These responses have a lower similarity to their{" "}
                  <span className="font-semibold">{nearestNeighbors}</span>{" "}
                  nearest neighbors compared to the threshold (Z-score:{" "}
                  <span className="font-semibold">{zScoreThreshold}</span>).
                </p>
              </div>
            </div>
            <div className="flex max-h-[70vh] flex-grow flex-col gap-4 overflow-y-auto p-6">
              {outliers.map((outlier, index) => (
                <OutlierCard
                  key={index}
                  outlier={outlier}
                  threshold={threshold}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default OutliersModal;
