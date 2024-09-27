import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  List,
  Search,
  Ellipsis,
} from "lucide-react";
import Button from "../components/Button";

interface ClusterResponse {
  response: string;
  clusterIndex: number;
  similarity: number;
}

interface Cluster {
  index: number;
  responses: ClusterResponse[];
}

const ClusterAssignmentModal = ({
  path,
  delimiter,
  isOpen,
  setIsOpen,
}: {
  path: string;
  delimiter: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [expandedClusters, setExpandedClusters] = useState<number[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const previewCount = 50;
  const filteredClusters = useMemo(() => {
    if (!searchTerm) return null;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return clusters.filter((cluster) => {
      return cluster.responses.some((response) =>
        response.response.toLowerCase().includes(lowerSearchTerm),
      );
    });
  }, [searchTerm]);

  const previewClusters = filteredClusters || clusters;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const input = await window.python.readFile(path);
        const lines = input.split("\n");
        const parsedData = lines.map((line) => line.split(delimiter));
        parsedData.shift(); // Remove header
        let clusterAssignments = parsedData.map(
          ([response, clusterIndex, similarity]) => ({
            response,
            clusterIndex: parseInt(clusterIndex),
            similarity: parseFloat(similarity),
          }),
        );
        clusterAssignments = clusterAssignments.filter(
          (response) =>
            response.response.length > 0 &&
            response.clusterIndex >= 0 &&
            response.similarity >= 0,
        );
        return clusterAssignments;
      } catch (error) {
        console.error("Error fetching preview data:", error);
      }
    };

    fetchData()
      .then((data) => {
        if (!data) return;
        // Group responses by cluster index
        setClusters(
          data.reduce((acc, response) => {
            const group = acc.find((g) => g.index === response.clusterIndex);
            if (group) {
              group.responses.push(response);
            } else {
              acc.push({
                index: response.clusterIndex,
                responses: [response],
              });
            }
            return acc;
          }, [] as Cluster[]),
        );
      })
      .catch(console.error);
  }, []);

  const toggleCluster = (clusterIndex: number) => {
    setExpandedClusters((prev) =>
      prev.includes(clusterIndex)
        ? prev.filter((i) => i !== clusterIndex)
        : [...prev, clusterIndex],
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="mt-[60px] w-full max-w-4xl rounded-lg bg-backgroundColor shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-6 pb-4">
          <h2 className="text-3xl font-semibold">Cluster Assignments</h2>
          <div className="flex flex-col items-center justify-center gap-2">
            <Button
              onClick={() => window.python.showItemInFolder(path || "")}
              disabled={!path}
              text="View Assignments File"
              leftIcon={<List />}
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-textColor focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="flex items-center justify-between border-b p-6 pb-4">
          <div className="flex w-full items-center justify-center gap-4">
            <div className="relative flex w-full flex-col gap-1">
              <div className="flex h-12 items-center gap-2 rounded-md border-2 border-primaryColor bg-white p-2 dark:bg-zinc-900">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  className="w-full focus:outline-none"
                  placeholder="Search by response content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="scrollbar flex max-h-[65vh] flex-grow flex-col gap-4 overflow-y-auto p-6">
          {previewClusters.map((cluster) => (
            <div
              key={cluster.index}
              className="rounded-lg border bg-white shadow-md hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <button
                onClick={() => toggleCluster(cluster.index)}
                className="flex w-full items-center justify-between p-4 px-8 focus:outline-none"
              >
                <h2 className="text-2xl font-semibold">
                  Cluster {cluster.index} ({cluster.responses.length} responses)
                </h2>
                {expandedClusters.includes(cluster.index) ? (
                  <ChevronUp className="text-primaryColor" size={32} />
                ) : (
                  <ChevronDown className="text-primaryColor" size={32} />
                )}
              </button>
              {expandedClusters.includes(cluster.index) && (
                <div className="overflow-hidden rounded-lg border border-dashed border-primaryColor">
                  <div className="flex flex-col gap-2 p-4">
                    {cluster.responses
                      .slice(0, previewCount)
                      .map((response, index) => (
                        <div
                          key={index}
                          className={`rounded p-3 ${response.response.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) && searchTerm.length > 0 && "bg-accent-50"}`}
                        >
                          {/* TODO: Better Line Clamping */}
                          {/* <p className="line-clamp-2">"{response.response}"</p> */}
                          {response.response
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ? (
                            <>
                              <span>
                                "
                                {response.response.slice(
                                  0,
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()),
                                )}
                              </span>
                              <span className="font-bold text-primaryColor">
                                {response.response.slice(
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()),
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()) +
                                    searchTerm.length,
                                )}
                              </span>
                              <span>
                                {response.response.slice(
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()) +
                                    searchTerm.length,
                                )}
                                "
                              </span>
                            </>
                          ) : (
                            <span>"{response.response}"</span>
                          )}
                          <div className="mt-3 flex items-end justify-between">
                            <div className="flex w-full flex-col">
                              <p>Similarity to cluster center: </p>
                              <div className="h-2.5 rounded-full bg-primary-100">
                                <div
                                  className="h-2.5 rounded-full bg-primaryColor"
                                  style={{
                                    width: `${response.similarity * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <span className="flex w-28 items-center justify-end gap-2 text-xl">
                              {(response.similarity * 100).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    {cluster.responses
                      .slice(previewCount)
                      .filter(
                        (response) =>
                          response.response
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) &&
                          searchTerm.length > 0,
                      ).length > 0 &&
                      cluster.responses
                        .slice(previewCount)
                        .filter(
                          (response) =>
                            response.response
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) &&
                            searchTerm.length > 0,
                        )
                        .map((response, index) => (
                          <div key={index}>
                            <div className="flex w-full justify-center p-4">
                              <Ellipsis size={24} />
                            </div>
                            <div className="rounded bg-accent-50 p-3">
                              <span>
                                "
                                {response.response.slice(
                                  0,
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()),
                                )}
                              </span>
                              <span className="font-bold text-primaryColor">
                                {response.response.slice(
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()),
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()) +
                                    searchTerm.length,
                                )}
                              </span>
                              <span>
                                {response.response.slice(
                                  response.response
                                    .toLowerCase()
                                    .indexOf(searchTerm.toLowerCase()) +
                                    searchTerm.length,
                                )}
                                "
                              </span>
                              <div className="mt-3 flex items-end justify-between">
                                <div className="flex w-full flex-col">
                                  <p>Similarity to cluster center: </p>
                                  <div className="h-2.5 rounded-full bg-primary-100">
                                    <div
                                      className="h-2.5 rounded-full bg-primaryColor"
                                      style={{
                                        width: `${response.similarity * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="flex w-28 items-center justify-end gap-2 text-xl">
                                  {(response.similarity * 100).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    {cluster.responses.length > previewCount && (
                      <div className="flex items-center justify-center p-4">
                        <p>
                          +{" "}
                          {cluster.responses.length -
                            previewCount -
                            cluster.responses.filter(
                              (response) =>
                                response.response
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) &&
                                searchTerm.length > 0,
                            ).length}{" "}
                          more responses in the assignments file
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClusterAssignmentModal;
