import { Header } from "./Header";
import {
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  Folder,
  File,
  Maximize2,
} from "lucide-react";
import Button from "./Button";
import { useState } from "react";

function TotalTimeDropdown() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex w-full flex-col justify-start">
      <div className="flex w-full items-center justify-between">
        <p>Total Time</p>
        <Button
          primary={false}
          onClick={() => {
            console.log("Open Total Time");
            setOpen(!open);
          }}
          leftIcon={<Clock />}
          text="14:34 min"
          rightIcon={open ? <ChevronDown /> : <ChevronUp />}
        />
      </div>
      {open && (
        <div className="flex flex-col p-4 px-8">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Check
                className="rounded bg-slate-800 text-background"
                size={20}
              />
              Reading File
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />0 sec
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <>
      <Header index={5} />
      <div className="my-8" />
      <div className="flex flex-col items-start justify-start gap-4 px-32">
        <h1 className="text-5xl">Results</h1>
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <p className="py-2 text-xl font-semibold text-primary">
              Your results have been saved.
            </p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Folder");
              }}
              rightIcon={<Folder />}
              text="Open Folder"
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Updated Input File</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Updated Input File");
              }}
              text="View File"
              rightIcon={<File />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Cluster Assignments</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Cluster Assignments");
              }}
              text="View Table"
              rightIcon={<Maximize2 />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Pairwise Cluster Similarities</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Pairwise Cluster Similarities");
              }}
              text="View Table"
              rightIcon={<Maximize2 />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Outlier Responses</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Outlier Responses");
              }}
              text="View List"
              rightIcon={<Maximize2 />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Merged Clusters</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Merged Clusters");
              }}
              text="View List"
              rightIcon={<Maximize2 />}
            />
          </div>
          <TotalTimeDropdown />
        </div>
      </div>
    </>
  );
}
