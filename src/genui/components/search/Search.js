import { useState, useRef } from 'react';
import CloseWrapper from './CloseWrapper';
import SmartsSearch from './SmartsSearch';
import Results from './Results';
import SimSubSearch from './SimSubSearch';
import { initActiveTabs } from './utils';

function Search(props) {
  const [status, setStatus] = useState('drawing');
  const [activeTabs, setActiveTabs] = useState({});
  const [error, setError] = useState(null);
  const [filteredOut, setFilteredOut] = useState([]);
  const [excluded, setExcluded] = useState([])

  const controllerRef = useRef(null);

  const { providers, mode, open, setOpen, response, setResponse, smiles, setSmiles, setActiveNew, scope } = props;
  const searchAccrossMultipleSets = props.searchAccrossMultipleSets ?? true;
  //const scope = providers.some((obj) => obj.hasOwnProperty('project')) ? 'set' : 'project';
  const providerArray = scope === 'project' ? "project_ids" : "providers"

  async function onSubmit(input, excluded, params) {
    const ids = providers.filter((item) => !excluded.some((e) => e.id === item.id)).map((item) => item.id);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus('submitting');
    setError(null);
    setFilteredOut([])

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

      const payload = await res.json();

      if (!res.ok) {
        const message = `${res.status} ${res.statusText}`;
        const err = new Error(message);
        err.status = res.status;
        err.payload = payload;
        throw err;
      }

      setResponse(payload);
      setActiveTabs(initActiveTabs(payload.hits, {}));
      return true
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

  const searchProps = {
    providers,
    status,
    onSubmit,
    onAbort,
    searchAccrossMultipleSets,
    open,
    setOpen,
    response,
    setResponse,
    smiles,
    setSmiles,
    setActiveNew,
    mode,
    error,
    setError,
    filteredOut,
    setFilteredOut,
    excluded,
    setExcluded
  };

  let hits
  if (response?.hits) {
    const excludedIds = excluded.map((e) => e.id);
    const providerIds = providers.map((p) => p.id);
    const filteredOutIds = filteredOut.map((fo) => fo.id)
    hits = response.hits.filter((hit) =>
      hit[providerArray]
        .filter((provider) => !excludedIds.includes(provider))
        .some((provider) => !filteredOutIds.includes(provider) && providerIds.includes(provider))
    );
  }
  
  return (
    <>
      {mode === 'smarts' && (
        <CloseWrapper {...props} searchAccrossMultipleSets={searchAccrossMultipleSets}>
          <SmartsSearch {...searchProps} />
        </CloseWrapper>
      )}
      {mode === 'substructure' && <SimSubSearch {...searchProps} />}
      {mode === 'similarity' && <SimSubSearch {...searchProps} />}
      
      {response?.hits && response.hits.length !== 0 && (
          <Results
            {...props}
            providers={providers}
            data={hits}
            scope={scope}
            mode={mode}
            setActiveTabs={setActiveTabs}
            activeTabs={activeTabs}
            key={Object.keys(activeTabs)}
          />
      )}
    </>
  );
}

export default Search;
