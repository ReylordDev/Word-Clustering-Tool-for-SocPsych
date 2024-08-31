import { useEffect, useState } from "react";
import { AlertCircle, X, ChevronUp, ChevronDown } from "lucide-react";

interface Data {
  mergers: Merger[];
}

interface Merger {
  mergedClusters: MergedCluster[];
  similarityPairs: SimilarityPair[];
}

interface MergedCluster {
  index: number;
  responses: Response[];
}

interface Response {
  response: string;
  similarity: number;
}

interface SimilarityPair {
  clusterPair: number[];
  similarity: number;
}

function MergedClustersModal({
  path,
  mergeThreshold,
  isOpen,
  setIsOpen,
}: {
  path: string;
  mergeThreshold: number | undefined;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [mergers, setMergers] = useState<Merger[]>([]);
  const [expandedClusters, setExpandedClusters] = useState<number[]>([]);
  const [expandedClusterGroups, setExpandedClusterGroups] = useState<number[]>(
    [],
  );
  const representativeResponses = 5;

  const toggleCluster = (index: number) => {
    setExpandedClusters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleClusterGroup = (index: number) => {
    setExpandedClusterGroups((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  useEffect(() => {
    window.python.readJsonFile(path).then((value: unknown) => {
      const data = value as Data;
      console.log(data);
      // Limit the number of representative responses
      data.mergers.forEach((merger) => {
        merger.mergedClusters.forEach((cluster) => {
          cluster.responses = cluster.responses.slice(
            0,
            representativeResponses,
          );
        });
      });
      setMergers(data.mergers);
    });
  }, [path]);

  if (!mergeThreshold) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="h-[90vh] w-full max-w-4xl rounded-lg bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-6 pb-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold">Merged Clusters</h2>
                <p>
                  Merging Similarity Threshold:{" "}
                  <span className="font-semibold">{mergeThreshold * 100}%</span>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-text focus:outline-none"
              >
                <X size={36} />
              </button>
            </div>
            <div className="flex max-h-[70vh] flex-grow flex-col gap-4 overflow-y-auto p-6">
              {mergers.length > 0 ? (
                mergers.map((merger, mergerIndex) => (
                  <div
                    key={mergerIndex}
                    className="rounded-lg bg-white p-4 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="mb-2 text-xl font-semibold">
                        Merged Group {mergerIndex + 1}
                      </h2>
                      <button
                        className="px-4 text-primary hover:text-violet-900"
                        onClick={() => {
                          toggleClusterGroup(mergerIndex);
                          merger.mergedClusters.forEach((cluster) =>
                            setExpandedClusters((prev) =>
                              expandedClusterGroups.includes(mergerIndex)
                                ? prev.filter((i) => i !== cluster.index)
                                : [...prev, cluster.index],
                            ),
                          );
                        }}
                      >
                        {expandedClusterGroups.includes(mergerIndex) ? (
                          <ChevronUp size={32} />
                        ) : (
                          <ChevronDown size={32} />
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {merger.mergedClusters.map((cluster, index) => (
                        <div key={index} className="rounded-md border">
                          <button
                            className="flex w-full items-center justify-between p-4"
                            onClick={() => toggleCluster(cluster.index)}
                          >
                            <h3 className="text-lg font-medium">
                              Cluster {cluster.index}
                            </h3>
                            {expandedClusters.includes(cluster.index) ? (
                              <ChevronUp
                                size={24}
                                className="text-secondary hover:text-pink-700"
                              />
                            ) : (
                              <ChevronDown
                                size={24}
                                className="text-secondary hover:text-pink-700"
                              />
                            )}
                          </button>
                          {expandedClusters.includes(cluster.index) && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-dashed border-accent">
                              <div className="p-2">
                                <div>
                                  <h3 className="gap-1 p-1 text-xl font-medium">
                                    Representative Responses:
                                  </h3>
                                  {cluster.responses.map((response) => (
                                    <div
                                      key={cluster.index}
                                      className="rounded p-3"
                                    >
                                      {/* TODO: Better Line Clamping */}
                                      <p className="line-clamp-2">
                                        "{response.response}"
                                      </p>
                                      <div className="mt-2 flex flex-col">
                                        <div className="flex items-center justify-between px-2 text-sm">
                                          <p>
                                            Similarity to cluster center:{" "}
                                            <span className="font-semibold">
                                              {(
                                                response.similarity * 100
                                              ).toFixed(1)}
                                              %
                                            </span>
                                          </p>
                                        </div>
                                        <div className="h-2.5 w-full rounded-full bg-gray-200">
                                          <div
                                            className="h-2.5 rounded-full bg-accent"
                                            style={{
                                              width: `${response.similarity * 100}%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <h3 className="mb-2 text-lg font-medium">
                        Paired Similarity
                      </h3>
                      <div className="flex flex-col gap-4">
                        {merger.similarityPairs.map((pair, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-start gap-4">
                              <p className="w-96 text-nowrap">
                                Cluster{" "}
                                <span className="font-semibold">
                                  {pair.clusterPair[0]}
                                </span>{" "}
                                and Cluster{" "}
                                <span className="font-semibold">
                                  {pair.clusterPair[1]}
                                </span>
                                :
                              </p>
                              <div className="h-2.5 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-2.5 rounded-full bg-primary"
                                  style={{
                                    width: `${pair.similarity * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="w-24 text-xl">
                                {(pair.similarity * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-96 items-center justify-center">
                  <p className="text-xl font-semibold">
                    No clusters were merged.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-b-lg border-t bg-background px-6 py-4">
              <AlertCircle size={20} />
              <p>
                Cluster IDs on this page are not comparable to the other views.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default MergedClustersModal;
