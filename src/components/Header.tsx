export function Header(props: { children: React.ReactNode }) {
  return (
    <div className="">
      <h1 className="h-48 cursor-default select-none p-8 pl-12 text-6xl">
        {props.children}
      </h1>
      <div className="bg-accent h-8 w-screen"></div>
    </div>
  );
}
