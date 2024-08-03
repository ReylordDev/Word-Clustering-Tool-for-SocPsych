export function FileSelector({
  selectedFile,
  setSelectedFile,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log(files);
    if (files) {
      const file = files[0];
      if (file && file.size > 0 && file.type === "text/csv") {
        setSelectedFile(file);
      }
    }
  };

  function BrowseButton() {
    return (
      <label className="cursor-pointer rounded-full bg-primary p-4 px-8 text-background">
        Browse
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    );
  }

  return (
    <div className="flex h-72 w-72 flex-col items-center gap-4 rounded-3xl border-4 border-dashed border-accent">
      {selectedFile && (
        <div className="flex flex-col items-center gap-2">
          <h5>Selected File</h5>
          <div className="flex">
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 fill-primary stroke-0"
            >
              <path
                fillRule="evenodd"
                d="M14,2 C14.2652165,2 14.5195704,2.10535684 14.7071068,2.29289322 L19.7071068,7.29289322 C19.8946432,7.4804296 20,7.73478351 20,8 L20,19 C20,20.6568542 18.6568542,22 17,22 L7,22 C5.34314575,22 4,20.6568542 4,19 L4,5 C4,3.34314575 5.34314575,2 7,2 L14,2 Z M11.999,4 L7,4 C6.44771525,4 6,4.44771525 6,5 L6,19 C6,19.5522847 6.44771525,20 7,20 L17,20 C17.5522847,20 18,19.5522847 18,19 L18,10 L13,10 C12.4871642,10 12.0644928,9.61395981 12.0067277,9.11662113 L12,9 L11.999,4 Z M17.586,8 L13.999,4.414 L14,8 L17.586,8 Z"
              />
            </svg>
            <p className="max-w-52 text-wrap">{selectedFile.name}</p>
          </div>
        </div>
      )}
      {!selectedFile && (
        <>
          <h5 className="">Choose File</h5>
          <svg viewBox="0 0 24 24" className="fill-primary stroke-0">
            <path
              fillRule="evenodd"
              d="M14,2 C14.2652165,2 14.5195704,2.10535684 14.7071068,2.29289322 L19.7071068,7.29289322 C19.8946432,7.4804296 20,7.73478351 20,8 L20,9 C20,9.55228475 19.5522847,10 19,10 L13,10 C12.4871642,10 12.0644928,9.61395981 12.0067277,9.11662113 L12,9 L11.999,4 L7,4 C6.44771525,4 6,4.44771525 6,5 L6,19 C6,19.5522847 6.44771525,20 7,20 L9,20 C9.55228475,20 10,20.4477153 10,21 C10,21.5522847 9.55228475,22 9,22 L7,22 C5.34314575,22 4,20.6568542 4,19 L4,5 C4,3.34314575 5.34314575,2 7,2 L14,2 Z M17,12 C17.5522847,12 18,12.4477153 18,13 L18,16 L21,16 C21.5522847,16 22,16.4477153 22,17 C22,17.5522847 21.5522847,18 21,18 L18,18 L18,21 C18,21.5522847 17.5522847,22 17,22 C16.4477153,22 16,21.5522847 16,21 L16,18 L13,18 C12.4477153,18 12,17.5522847 12,17 C12,16.4477153 12.4477153,16 13,16 L16,16 L16,13 C16,12.4477153 16.4477153,12 17,12 Z M13.999,4.414 L14,8 L17.586,8 L13.999,4.414 Z"
            />
          </svg>
          <div className="flex flex-col items-center justify-center">
            <p>Drag and Drop a file</p>
            <p>or</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <BrowseButton />
            <p className="text-sm text-gray-600">Supported file type: CSV</p>
          </div>
        </>
      )}
    </div>
  );
}
