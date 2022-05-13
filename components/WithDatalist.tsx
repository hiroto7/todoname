const WithDatalist: React.FC<{
  datalistId: string;
  options: readonly string[];
  children: (datalist: string) => React.ReactNode;
}> = ({ datalistId, options, children }) => (
  <>
    <datalist id={datalistId}>
      {options.map((option) => (
        <option key={option} value={option} />
      ))}
    </datalist>
    {children(datalistId)}
  </>
);

export default WithDatalist;
