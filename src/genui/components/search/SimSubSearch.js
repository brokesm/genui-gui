import { useState, useRef, useEffect } from 'react';
import { Modal, CardFooter, CardBody, CardHeader } from 'reactstrap';
import Scope from './Scope';
import KetcherEditor from './KetcherEditor';
import { SearchButton } from './QueryCard';
import { getSmartsPattern } from './utils';
import QueryCard from './QueryCard';
import { SearchInput, SearchInputWithOptions } from './SearchInputs';
import CloseWrapper from './CloseWrapper';

export default function SimSubSearch(props) {
  const {
    status,
    onSubmit,
    onAbort,
    providers,
    searchAccrossMultipleSets,
    open,
    setOpen,
    response,
    smiles,
    setSmiles,
    mode,
    error,
    setError,
    setResponse,
    excluded, 
    setExcluded
  } = props;

  const [smartsPattern, setSmartsPattern] = useState(null);
  const [params, setParams] = useState({
    top_n: 5,
    threshold: 0,
    fp_type: 'morganFP',
    metric: 'tanimoto',
  });

  const queryRef = useRef(null);

  function setInput(e) {
    setParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <>
      <Modal
        isOpen={open}
        toggle={() => {
          //props?.setActiveNew && props.setActiveNew(null)
          setOpen(false);
          setError(null)
        }}
        size="xl"
      >
        <CardHeader className="d-flex align-items-left gap-2">
          <SearchInput setInput={setInput} params={params} name="top_n">
            Number of results:
          </SearchInput>
          {mode === 'similarity' && (
            <>
              <SearchInput setInput={setInput} params={params} name="threshold">
                Similarity threshold:
              </SearchInput>
              <SearchInputWithOptions
                setInput={setInput}
                params={params}
                name="fp_type"
                options={['morganFP', 'maccsFP']}
              >
                Fingerprint:
              </SearchInputWithOptions>
              <SearchInputWithOptions setInput={setInput} params={params} name="metric" options={['tanimoto', 'dice']}>
                Metric:
              </SearchInputWithOptions>
            </>
          )}
        </CardHeader>
        {searchAccrossMultipleSets && <Scope providers={providers} excluded={excluded} setExcluded={setExcluded} />}
        <CardBody>
          <KetcherEditor setSmiles={setSmiles} smiles={smiles} />
        </CardBody>
        {error && <p style={{ color: 'red' }}>Warning: {error}</p>}
        <CardFooter className="d-flex align-items-left gap-2">
          <SearchButton
            onSubmit={async () => {
              const ok = await onSubmit(smiles, excluded, params);
              const smarts = await getSmartsPattern()
              if (ok) {
                setSmartsPattern(smarts);
                setOpen(false);
              }
            }}
            onAbort={onAbort}
            status={status}
          >
            Submit
          </SearchButton>
        </CardFooter>
      </Modal>
      {smiles && response?.hits && (
        <CloseWrapper {...props} searchAccrossMultipleSets={searchAccrossMultipleSets} setResponse={setResponse}>
          <QueryCard
            {...props}
            setOpen={setOpen}
            queryRef={queryRef}
            onSubmit={() => onSubmit(smiles, excluded, params)}
            onAbort={onAbort}
            status={status}
            response={response}
            smartsPattern={smartsPattern}
            excluded={excluded}
            mode={mode}
          />
       </CloseWrapper>
      )}
    </>
  );
}
