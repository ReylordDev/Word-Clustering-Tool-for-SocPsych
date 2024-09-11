import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface ClusterResponse {
  response: string;
  clusterIndex: number;
  similarity: number;
}

interface ClusterGroup {
  clusterIndex: number;
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
  const [clusterResponses, setClusterResponses] = useState<ClusterResponse[]>(
    [],
  );

  useEffect(() => {
    const fetchPreviewData = async () => {
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
        setClusterResponses(clusterAssignments);
      } catch (error) {
        console.error("Error fetching preview data:", error);
      }
    };

    fetchPreviewData();
  }, []);

  const groupedResponses: ClusterGroup[] = clusterResponses.reduce(
    (acc, response) => {
      const group = acc.find((g) => g.clusterIndex === response.clusterIndex);
      if (group) {
        group.responses.push(response);
      } else {
        acc.push({
          clusterIndex: response.clusterIndex,
          responses: [response],
        });
      }
      return acc;
    },
    [] as ClusterGroup[],
  );

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
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-textColor focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="scrollbar flex max-h-[70vh] flex-grow flex-col gap-4 overflow-y-auto p-6">
          {groupedResponses.map((group) => (
            <div
              key={group.clusterIndex}
              className="rounded-lg border bg-white shadow-md hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <button
                onClick={() => toggleCluster(group.clusterIndex)}
                className="flex w-full items-center justify-between p-4 px-8 focus:outline-none"
              >
                <h2 className="text-2xl font-semibold">
                  Cluster {group.clusterIndex + 1} ({group.responses.length}{" "}
                  responses)
                </h2>
                {expandedClusters.includes(group.clusterIndex) ? (
                  <ChevronUp className="text-primaryColor" size={32} />
                ) : (
                  <ChevronDown className="text-primaryColor" size={32} />
                )}
              </button>
              {expandedClusters.includes(group.clusterIndex) && (
                <div className="overflow-hidden rounded-lg border border-dashed border-primaryColor">
                  <div className="p-4">
                    {group.responses.map((response, index) => (
                      <div key={index} className="rounded p-3 py-5">
                        {/* TODO: Better Line Clamping */}
                        <p className="line-clamp-2">"{response.response}"</p>
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
