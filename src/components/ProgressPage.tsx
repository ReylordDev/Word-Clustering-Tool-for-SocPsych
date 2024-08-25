import { Link } from "react-router-dom";
import { Header } from "./Header";
import { useState, useEffect } from "react";

export default function ProgressPage() {
  const [complete, setComplete] = useState(false);
  const [todoList, setTodoList] = useState<string[]>([
    "Reading input file",
    "Loading language model",
    "Embedding words",
    "Outlier detection",
    "Finding number of clusters", // This might not be a todo
    "Clustering",
    "Merging clusters",
  ]);
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<string>(todoList[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Poll the backend here
      window.python
        .pollClusterProgress()
        .then(
          (progress: { currentTask: string; completedMessages: string[] }) => {
            console.log(progress);
            if (progress.currentTask) {
              setCompletedList(progress.completedMessages);
              setTodoList(
                todoList.filter(
                  (task) => !progress.completedMessages.includes(task),
                ),
              );
              setCurrentTask(progress.currentTask);
            } else {
              setCurrentTask("");
            }
            if (progress.completedMessages.includes("Clustering complete")) {
              // Make sure that todo list and the backend are in sync
              setComplete(true);
            }
          },
        );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header index={4} />
      <div className="flex flex-col items-center justify-start gap-4 px-24">
        {complete && (
          <>
            <Link to={"/results"}>
              <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                View Results
              </button>
            </Link>
            <h3>Clustering Complete!</h3>
          </>
        )}
        {!complete && (
          <>
            <h3>{currentTask}...</h3>
            <div className="flex w-full justify-between">
              <div className="flex flex-col gap-4">
                <h4>Completed</h4>
                <ul className="flex flex-col gap-4">
                  {completedList.map((task, index) => (
                    <li key={index}>
                      <p>- {task}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <h4>To-Do</h4>
                <ul className="flex flex-col gap-4">
                  {todoList.map((task, index) => (
                    <li key={index}>
                      <p>- {task}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
