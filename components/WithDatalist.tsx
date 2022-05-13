const WithDatalist: React.FC<{
  name: string;
  options: readonly string[];
  children: (datalist: string) => React.ReactNode;
}> = ({ name, options, children }) => {
  const datalistId = `${name}Datalist`;
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
