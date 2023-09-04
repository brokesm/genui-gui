import { useState } from 'react';
import { Button, Spinner, Input, CardBody, CardFooter, Modal, Label, CardHeader } from 'reactstrap';
import Scope from './Scope';
import { A } from '../compounds/CompoundCard';

const apiKey = process.env.REACT_APP_SMARTS_PLUS_API_KEY ? process.env.REACT_APP_SMARTS_PLUS_API_KEY : null;

export default function SmartsSearch(props) {
  const [visualization, setVisualization] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [smarts, setSmarts] = useState(null);
  const [params, setParams] = useState({ top_n: 5 });

  const { providers, status, onSubmit, onAbort, searchAccrossMultipleSets, error, setError, filteredOut, setFilteredOut } = props;

  function timer(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function visualize() {
    const smartsView = 'https://api.smarts.plus/smartsView/';

    if (!apiKey) {
      setError('API key missing. For SMARTS visualization, visit link below.');
      return;
    }

    if (!smarts) {
      setError('SMARTS field required');
      return;
    }

    setIsLoading(true);
    const job = await fetch(smartsView, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        query: {
          smarts: smarts,
          parameters: {
            file_format: 'png',
            legend_mode: 1,
          },
        },
      }),
    })
      .then((response) => response.json())
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });

    const jobId = job.job_id;
    const maxAttempts = 20;

    // Even if jobId is returned from POST request, the query may not be saved yet
    // reason for multiple scheduled GET requests untill it returns the expected object
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const resp = await fetch(`${smartsView}?job_id=${jobId}`)
        .then((response) => response.json())
        .catch((err) => console.log(err.message));

      if (resp?.result?.error) {
        const err = resp.result.error;
        setError(err);
        setIsLoading(false);
        return;
      }

      if (resp?.result?.image) {
        const dataUrl = 'data:image/png;base64,' + resp.result.image;
        setVisualization(dataUrl);
        setIsLoading(false);
        return;
      }

      await timer(100 + attempt * 50);
    }
  }

  function setInput(e) {
    setParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <>
      <CardHeader className="d-flex align-items-left gap-2">
        <div>
          <Label for="top_n">Number of results:</Label>
          <Input onChange={(e) => setInput(e)} name="top_n" defaultValue={params.top_n} value={params.top_n}/>
        </div>
      </CardHeader>
      {searchAccrossMultipleSets && <Scope providers={providers} excluded={filteredOut} setExcluded={setFilteredOut} />}
      <CardBody>
        <div className="d-flex justify-content-between gap-2">
          <Input
            placeholder="SMARTS"
            onChange={(e) => {
              setSmarts(e.target.value);
              setError(null);
            }}
          />

          {visualization && (
            <Modal isOpen={visualization} toggle={() => setVisualization(null)} size="lg">
              <img src={visualization}></img>
            </Modal>
          )}
          <Button onClick={visualize} color="primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" />
              </>
            ) : (
              'Visualize'
            )}
          </Button>
        </div>
        {error && <p style={{ color: 'red' }}>Warning: {error}</p>}
        {apiKey === null && (
          <p>
            Build your SMARTS <A href="https://smarts.plus/">here</A>.
          </p>
        )}
      </CardBody>
      <CardFooter className="d-flex align-items-left gap-2">
        <Button color="primary" onClick={() => onSubmit(smarts, filteredOut, params)} disabled={status === 'submitting'}>
          {status === 'drawing' ? (
            'Submit'
          ) : (
            <>
              Searching... <Spinner type="border" color="light" size="sm" />
            </>
          )}
        </Button>
        {status === 'submitting' && <Button onClick={onAbort}>Abort</Button>}
      </CardFooter>
    </>
  );
}
