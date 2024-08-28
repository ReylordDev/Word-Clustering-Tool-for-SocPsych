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
        console.log(input.length);
        const lines = input.split("\n");
        console.log(lines.length);
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
  }, [path, delimiter]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-3xl font-semibold">Cluster Assignments</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-text focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          {groupedResponses.map((group) => (
            <div
              key={group.clusterIndex}
              className="overflow-hidden rounded-lg border border-dashed border-accent hover:bg-pink-100"
            >
              <button
                onClick={() => toggleCluster(group.clusterIndex)}
                className="flex w-full items-center justify-between bg-opacity-10 p-4 hover:bg-opacity-20"
              >
                <p className="text-xl font-semibold">
                  Cluster {group.clusterIndex + 1}
                </p>
                {expandedClusters.includes(group.clusterIndex) ? (
                  <ChevronUp className="text-text" size={20} />
                ) : (
                  <ChevronDown className="text-text" size={20} />
                )}
              </button>
              {expandedClusters.includes(group.clusterIndex) && (
                <div className="p-4">
                  {group.responses.map((response, index) => (
                    <div key={index} className="rounded bg-background p-3">
                      {/* TODO: Better Line Clamping */}
                      <p className="line-clamp-2">"{response.response}"</p>
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClusterAssignmentModal;
