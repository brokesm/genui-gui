import { useState, useRef } from 'react';
import CloseWrapper from './CloseWrapper';
import Results from './Results';
import { initActiveTabs } from './utils';
import SmartsInput from './SmartsInput';
import { Button, CardBody, CardFooter, Modal } from 'reactstrap';
import SearchParams from './SearchParams';
import Scope from './Scope';
import KetcherEditor from './KetcherEditor';
import { SearchButton } from './QueryCard';
import QueryCard from './QueryCard';
import InchiKeyInput from './InchiKeyInput';

function Search(props) {
  const [smarts, setSmarts] = useState(null);
  const [smiles, setSmiles] = useState(null);
  const [inchiKey, setInchiKey] = useState(null)
  const [status, setStatus] = useState('drawing');
  const [activeTabs, setActiveTabs] = useState({});
  const [error, setError] = useState(null);
  const [filteredOut, setFilteredOut] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [visualization, setVisualization] = useState(null);
  const [params, setParams] = useState({
    top_n: 5,
    threshold: 0,
    fp_type: 'morganFP',
    metric: 'tanimoto',
  });

  const controllerRef = useRef(null);
  const queryRef = useRef(null);

  const { providers, mode, open, setOpen, response, setResponse, scope } = props;
  const searchAccrossMultipleSets = props.searchAccrossMultipleSets ?? true;
  const providerArray = scope === 'projects' ? 'project_ids' : 'providers';

  async function onSubmit(input, excluded, params) {
    const ids = providers.filter((item) => !excluded.some((e) => e.id === item.id)).map((item) => item.id);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus('submitting');
    setError(null);
    setFilteredOut([]);

    try {
      const res = await fetch(props.apiUrls.searchRoot + `${scope}/${mode}/`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({
          input,
          ids,
          ...params,
        }),
      });

      let payload = await res.json();

      if (!res.ok) {
        const message = `${res.status} ${res.statusText}`;
        const err = new Error(message);
        err.status = res.status;
        err.payload = payload;
        throw err;
      }

      setResponse(payload);
      setActiveTabs(initActiveTabs(payload.hits, {}));
      return true;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      setError(`Error ${err.status}: ${Object.values(err.payload)}`);
    } finally {
      setStatus('drawing');
      controllerRef.current = null;
    }
  }

  function onAbort() {
    setStatus('drawing');
    controllerRef.current.abort();
  }

  function setInput(e) {
    setParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function onModalToggle() {
    setOpen(false);
    setError(null);
  }

  async function onSearch() {
    const input = mode === 'smarts' ? smarts : mode === "inchikey" ? inchiKey : smiles;
    const parameters = mode === 'similarity' ? params : {};
    const ok = await onSubmit(input, excluded, parameters);
    if (ok) setOpen(false);
  }

  // postsearch filtering
  let hits;
  if (response?.hits && mode !== "inchikey") {
    const excludedIds = excluded.map((e) => e.id);
    const providerIds = providers.map((p) => p.id);
    const filteredOutIds = filteredOut.map((fo) => fo.id);
    hits = response.hits.filter((hit) =>
      hit[providerArray]
        .filter((provider) => !excludedIds.includes(provider))
        .some((provider) => !filteredOutIds.includes(provider) && providerIds.includes(provider))
    );
  }

  return (
    <>
      <Modal isOpen={open} toggle={onModalToggle} size="xl">
        {mode === 'similarity' && <SearchParams setInput={setInput} params={params} />}
        {searchAccrossMultipleSets && mode !== "inchikey" && <Scope providers={providers} excluded={excluded} setExcluded={setExcluded} />}
        <CardBody>
          {(mode === 'similarity' || mode === "substructure") && <KetcherEditor setSmiles={setSmiles} smiles={smiles} />}
          {mode === "inchikey" && <InchiKeyInput setError={setError} inchiKey={inchiKey} setInchiKey={setInchiKey}/>}
          {mode === 'smarts' && (
            <SmartsInput
              setError={setError}
              smarts={smarts}
              setSmarts={setSmarts}
              visualization={visualization}
              setVisualization={setVisualization}
            />
          )}
        </CardBody>
        {error && <p style={{ color: 'red' }}>Warning: {error}</p>}
        <CardFooter className="d-flex justify-content-between">
          <SearchButton onSearch={onSearch} onAbort={onAbort} status={status}>
            Submit
          </SearchButton>
          <Button onClick={onModalToggle}>Close</Button>
        </CardFooter>
      </Modal>

      {response?.hits && (
        <CloseWrapper {...props} searchAccrossMultipleSets={searchAccrossMultipleSets} setResponse={setResponse}>
          <QueryCard
            {...props}
            setOpen={setOpen}
            queryRef={queryRef}
            // onSubmit={() => onSubmit(smiles, excluded, params)}
            // onAbort={onAbort}
            // status={status}
            response={response}
            excluded={excluded}
            mode={mode}
            searchAccrossMultipleSets={searchAccrossMultipleSets}
            filteredOut={filteredOut}
            setFilteredOut={setFilteredOut}
            smiles={smiles}
          />
          {response.hits.length !== 0 && (
            <Results
              {...props}
              providers={providers}
              data={mode === "inchikey" ? response.hits : hits}
              scope={scope}
              mode={mode}
              setActiveTabs={setActiveTabs}
              activeTabs={activeTabs}
              key={Object.keys(activeTabs)}
            />
          )}
        </CloseWrapper>
      )}
    </>
  );
}

export default Search;
