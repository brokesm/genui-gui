import { Input } from 'reactstrap';

export default function InchiKeyInput(props) {
  const { setError, inchiKey, setInchiKey } = props;
  return (
    <>
      <p>Search across all projects.</p>
      <div className="d-flex justify-content-between gap-2">
        <Input
          placeholder="InchiKey"
          onChange={(e) => {
            setInchiKey(e.target.value);
            setError(null);
          }}
          value={inchiKey ?? ''}
        />
      </div>
    </>
  );
}
