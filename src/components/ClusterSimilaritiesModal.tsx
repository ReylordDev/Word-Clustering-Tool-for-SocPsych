import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  TextCursor,
  AlertCircle,
} from "lucide-react";

interface Cluster {
  index: number;
  representativeResponses: {
    text: string;
    similarity: number;
  }[];
}

interface ClusterSimilarity {
  cluster1: number;
  cluster2: number;
  similarity: number;
}

function ClusterSimilarityModal({
  similaritiesPath,
  clusterAssignmentsPath,
  delimiter,
  isOpen,
  setIsOpen,
}: {
  similaritiesPath: string;
  clusterAssignmentsPath: string;
  delimiter: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [clusterSimilarities, setClusterSimilarities] = useState<
    ClusterSimilarity[]
  >([]);
  const [clusters, setDetailedClusters] = useState<Cluster[]>([]);
  const [selectedClusterIndex, setSelectedClusterIndex] = useState<
    number | undefined
  >(undefined);
  const [comparisonClusterIndex, setComparisonClusterIndex] = useState<
    number | undefined
  >(undefined);
  const [selectedClusterExpanded, setSelectedClusterExpanded] = useState(false);
  const [comparisonClusterExpanded, setComparisonClusterExpanded] =
    useState(false);
  const [expandedSimilarClusters, setExpandedSimilarClusters] = useState<
    number[]
  >([]);

  const selectedCluster = clusters.find(
    (c) => c.index === selectedClusterIndex,
  );
  const comparisonCluster = clusters.find(
    (c) => c.index === comparisonClusterIndex,
  );

  console.log("Cluster Similarities: ", clusterSimilarities);
  console.log("Clusters: ", clusters);
  console.log("Selected Cluster: ", selectedCluster);
  console.log("Comparison Cluster: ", comparisonCluster);

  useEffect(() => {
    console.log("Fetching cluster similarities and assignments...");
    window.python.readJsonFile(similaritiesPath).then((similarityUnknown) => {
      const similarity = similarityUnknown as Record<
        string,
        Record<string, number>
      >;
      const clusterSimilarities: ClusterSimilarity[] = [];
      for (const cluster1 in similarity) {
        for (const cluster2 in similarity[cluster1]) {
          clusterSimilarities.push({
            cluster1: parseInt(cluster1),
            cluster2: parseInt(cluster2),
            similarity: similarity[cluster1][cluster2],
          });
        }
      }
      setClusterSimilarities(clusterSimilarities);
    });

    const fetchClusterAssignments = async () => {
      try {
        const input = await window.python.readFile(clusterAssignmentsPath);
        const lines = input.split("\n");
        const parsedData = lines.map((line) => line.split(delimiter));
        parsedData.shift(); // Remove header
        const assignments: Cluster[] = [];
        parsedData.forEach(([response, clusterIndex, similarity]) => {
          if (!response || !clusterIndex || !similarity) return;
          const cluster = assignments.find(
            (c) => c.index === parseInt(clusterIndex),
          );
          if (cluster) {
            cluster.representativeResponses.push({
              text: response,
              similarity: parseFloat(similarity),
            });
          } else {
            assignments.push({
              index: parseInt(clusterIndex),
              representativeResponses: [
                {
                  text: response,
                  similarity: parseFloat(similarity),
                },
              ],
            });
          }
        });
        assignments.forEach((cluster) => {
          cluster.representativeResponses.sort(
            (a, b) => b.similarity - a.similarity,
          );
          cluster.representativeResponses =
            cluster.representativeResponses.slice(0, 5);
        });
        setDetailedClusters(assignments);
      } catch (error) {
        console.error("Error fetching cluster assignments: ", error);
      }
    };

    fetchClusterAssignments();
  }, [similaritiesPath, clusterAssignmentsPath, delimiter]);

  const getClusterSimilarity = useCallback(
    (index1: number, index2: number) => {
      return (
        clusterSimilarities.find(
          (cs) =>
            (cs.cluster1 === index1 && cs.cluster2 === index2) ||
            (cs.cluster1 === index2 && cs.cluster2 === index1),
        )?.similarity || 0
      );
    },
    [clusterSimilarities],
  );

  const getMostSimilarClusters = useCallback(
    (clusterId: number, count = 5) => {
      return clusterSimilarities
        .filter((cs) => cs.cluster1 === clusterId)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, count);
    },
    [clusterSimilarities],
  );

  const SimilarityVisualizer: React.FC<{
    similarity: number;
    primary: boolean;
  }> = ({ similarity, primary = true }) => (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className={`h-2 rounded-full ${primary ? "bg-primary" : "bg-secondary"}`}
        style={{ width: `${similarity * 100}%` }}
      />
    </div>
  );

  const ClusterDetails: React.FC<{ cluster: Cluster | undefined }> = ({
    cluster,
  }) => {
    console.log("Cluster Details: ", cluster);

    if (!cluster) return null;
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-accent">
        <div className="p-4">
          <div>
            <h3 className="gap-1 p-1 text-xl font-medium">
              Representative Responses:
            </h3>
            {cluster.representativeResponses.map((response, index) => (
              <div key={index} className="rounded p-3">
                {/* TODO: Better Line Clamping */}
                <p className="line-clamp-2">"{response.text}"</p>
                <div className="mt-2 flex items-center justify-between px-2 text-sm">
                  <p>
                    Similarity to cluster center:{" "}
                    <span className="font-semibold">
                      {(response.similarity * 100).toFixed(1)}%
                    </span>
                  </p>
                  <div className="h-2.5 w-1/2 rounded-full bg-gray-200">
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
    );
  };

  const SimilarClustersList = ({ clusterId }: { clusterId: number }) => {
    const similarClusters = getMostSimilarClusters(clusterId);
    console.log("Similar Clusters: ", similarClusters);

    return (
      <div className="mt-4 flex flex-col gap-2">
        <h5 className="mb-2 font-medium">
          {similarClusters.length} Most Similar Clusters:
        </h5>
        {similarClusters.map((sc) => (
          <div
            key={sc.cluster2}
            className="rounded bg-white shadow-sm hover:bg-gray-50"
          >
            <div
              className="flex cursor-pointer items-center justify-between p-4"
              onClick={() =>
                setExpandedSimilarClusters((prev) =>
                  prev.includes(sc.cluster2)
                    ? prev.filter((id) => id !== sc.cluster2)
                    : [...prev, sc.cluster2],
                )
              }
            >
              <span className="w-28">Cluster {sc.cluster2 + 1}</span>
              <div className="flex flex-grow items-center">
                <SimilarityVisualizer
                  primary={true}
                  similarity={sc.similarity}
                />
                <div className="flex w-28 items-center justify-end gap-2">
                  <span>{(sc.similarity * 100).toFixed(2)}%</span>
                  <button className="focus:outline-none">
                    {expandedSimilarClusters.includes(sc.cluster2) ? (
                      <ChevronUp size={20} className="text-secondary" />
                    ) : (
                      <ChevronDown size={20} className="text-secondary" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {expandedSimilarClusters.includes(sc.cluster2) && (
              <ClusterDetails
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cluster={clusters.find((c) => c.index === sc.cluster2)!}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const ComparisonClusterSelector = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredClusters = useMemo(() => {
      if (!searchTerm) return [];
      const lowerSearchTerm = searchTerm.toLowerCase();
      return clusters.filter((cluster) => {
        if (cluster.index === selectedClusterIndex) return false;
        return cluster.representativeResponses.some((response) =>
          response.text.toLowerCase().includes(lowerSearchTerm),
        );
      });
    }, [searchTerm]);

    if (selectedClusterIndex === undefined) return null;

    return (
      <div className="flex w-full items-center justify-center gap-4">
        <div className="flex h-12 w-1/3 items-center gap-2 rounded-md border-2 border-primary bg-white p-2">
          <TextCursor size={20} className="text-gray-400" />
          <input
            type="number"
            value={
              comparisonClusterIndex !== undefined
                ? comparisonClusterIndex + 1
                : ""
            }
            onChange={(e) => {
              if (
                e.target.value === "" ||
                parseInt(e.target.value) < 1 ||
                parseInt(e.target.value) > clusters.length
              ) {
                setComparisonClusterIndex(undefined);
              } else {
                setComparisonClusterIndex(parseInt(e.target.value) - 1);
              }
            }}
            placeholder="Cluster ID..."
            className="w-full text-center focus:outline-none"
          />
        </div>
        <p>or</p>
        <div className="relative flex w-full flex-col gap-1">
          <div className="flex h-12 items-center gap-2 rounded-md border-2 border-primary bg-white p-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              className="w-full focus:outline-none"
              placeholder="Search by response content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
          </div>
          {showDropdown &&
            filteredClusters.length > 0 &&
            searchTerm.length > 1 && (
              <ul className="fixed mt-12 max-h-96 w-96 overflow-auto rounded-md border border-primary bg-white shadow-lg">
                {filteredClusters.map((cluster) => (
                  <li
                    key={cluster.index}
                    className="cursor-pointer p-2 hover:bg-gray-100"
                    onClick={() => {
                      if (cluster.index === selectedClusterIndex) return;
                      setComparisonClusterIndex(cluster.index);
                    }}
                  >
                    <span className="font-medium">
                      Cluster {cluster.index + 1}
                    </span>
                    <ul className="mt-1 space-y-1">
                      {cluster.representativeResponses.map(
                        (response, index) => (
                          <li
                            key={index}
                            className="text-ellipsis text-sm text-gray-600"
                          >
                            "{response.text}"
                          </li>
                        ),
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    );
  };

  const MainClusterSelector = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredClusters = useMemo(() => {
      if (!searchTerm) return [];
      const lowerSearchTerm = searchTerm.toLowerCase();
      return clusters.filter((cluster) =>
        cluster.representativeResponses.some((response) =>
          response.text.toLowerCase().includes(lowerSearchTerm),
        ),
      );
    }, [searchTerm]);

    return (
      <div className="flex w-full items-center justify-center gap-4">
        <div className="flex h-12 w-1/3 items-center gap-2 rounded-md border-2 border-primary bg-white p-2">
          <TextCursor size={20} className="text-gray-400" />
          <input
            type="number"
            value={
              selectedClusterIndex !== undefined ? selectedClusterIndex + 1 : ""
            }
            onChange={(e) => {
              if (
                e.target.value === "" ||
                parseInt(e.target.value) < 1 ||
                parseInt(e.target.value) > clusters.length
              ) {
                setSelectedClusterIndex(undefined);
              } else {
                setSelectedClusterIndex(parseInt(e.target.value) - 1);
              }
            }}
            placeholder="Cluster ID..."
            className="w-full text-center focus:outline-none"
          />
        </div>
        <p>or</p>
        <div className="relative flex w-full flex-col gap-1">
          <div className="flex h-12 items-center gap-2 rounded-md border-2 border-primary bg-white p-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              className="w-full focus:outline-none"
              placeholder="Search by response content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
          </div>
          {showDropdown &&
            filteredClusters.length > 0 &&
            searchTerm.length > 1 && (
              <ul className="fixed mt-12 max-h-96 w-96 overflow-auto rounded-md border border-primary bg-white shadow-lg">
                {filteredClusters.map((cluster) => (
                  <li
                    key={cluster.index}
                    className="cursor-pointer p-2 hover:bg-gray-100"
                    onClick={() => setSelectedClusterIndex(cluster.index)}
                  >
                    <span className="font-medium">
                      Cluster {cluster.index + 1}
                    </span>
                    <ul className="mt-1 space-y-1">
                      {cluster.representativeResponses.map(
                        (response, index) => (
                          <li
                            key={index}
                            className="text-ellipsis text-sm text-gray-600"
                          >
                            "{response.text}"
                          </li>
                        ),
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="h-[90vh] w-full max-w-4xl rounded-lg bg-background shadow-xl">
        <div className="h-[10vh] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Cluster Similarities</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-text focus:outline-none"
            >
              <X size={36} />
            </button>
          </div>
          <div className="mt-1 flex items-center px-1">
            <Info size={16} className="mr-2" />
            <p>Select a cluster to view details and compare similarities.</p>
          </div>
        </div>
        <div className="max-h-[80vh] flex-grow overflow-y-auto p-6">
          <div className="flex flex-col justify-start gap-1 px-4 py-2">
            <h5 className="font-medium">Select a cluster:</h5>
            <MainClusterSelector />
          </div>
          {selectedClusterIndex !== undefined && (
            <div className="flex flex-col gap-4 px-4">
              <div className="rounded-lg border bg-white shadow-md hover:bg-gray-50">
                <button
                  onClick={() => setSelectedClusterExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-between p-4 focus:outline-none"
                >
                  <h2 className="text-2xl font-semibold">
                    Cluster {selectedClusterIndex + 1}
                  </h2>
                  {selectedClusterExpanded ? (
                    <ChevronUp size={28} className="text-secondary" />
                  ) : (
                    <ChevronDown size={28} className="text-secondary" />
                  )}
                </button>
                {selectedClusterExpanded && (
                  <ClusterDetails cluster={selectedCluster} />
                )}
              </div>
              <div>
                <div className="p-4">
                  <h5 className="mb-2 font-medium">
                    Compare with another cluster:
                  </h5>
                  <div className="p-4">
                    <ComparisonClusterSelector />
                  </div>
                </div>
                {comparisonClusterIndex !== undefined &&
                  comparisonClusterIndex === selectedClusterIndex && (
                    <div className="flex w-full items-center gap-2 px-8">
                      <AlertCircle size={20} className="text-red-500" />
                      <p className="text-red-500">
                        Cannot compare a cluster with itself.
                      </p>
                    </div>
                  )}
                {comparisonClusterIndex !== undefined &&
                  comparisonClusterIndex !== selectedClusterIndex && (
                    <div className="px-8">
                      <div className="rounded bg-white shadow-sm hover:bg-gray-50">
                        <button
                          onClick={() =>
                            setComparisonClusterExpanded((prev) => !prev)
                          }
                          className="flex w-full items-center justify-between p-4 focus:outline-none"
                        >
                          <h2 className="text-2xl font-semibold">
                            Cluster {comparisonClusterIndex + 1}
                          </h2>
                          {comparisonClusterExpanded ? (
                            <ChevronUp size={28} className="text-secondary" />
                          ) : (
                            <ChevronDown size={28} className="text-secondary" />
                          )}
                        </button>
                        {comparisonClusterExpanded && (
                          <ClusterDetails cluster={comparisonCluster} />
                        )}
                      </div>
                      <div className="mt-2 rounded bg-white p-4 shadow-md">
                        <div className="flex justify-between">
                          <p>Similarity:</p>
                          <p>
                            {(
                              getClusterSimilarity(
                                selectedClusterIndex,
                                comparisonClusterIndex,
                              ) * 100
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                        <div className="flex items-center">
                          <SimilarityVisualizer
                            similarity={getClusterSimilarity(
                              selectedClusterIndex,
                              comparisonClusterIndex,
                            )}
                            primary={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              <SimilarClustersList clusterId={selectedClusterIndex} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClusterSimilarityModal;
