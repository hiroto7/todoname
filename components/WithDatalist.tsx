import { useId } from "react";

const WithDatalist: React.FC<{
  options: readonly string[];
  children: (datalist: string) => React.ReactNode;
}> = ({ options, children }) => {
  const datalistId = useId();

  return (
    <>
      <datalist id={datalistId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      {children(datalistId)}
    </>
  );
};

export default WithDatalist;
