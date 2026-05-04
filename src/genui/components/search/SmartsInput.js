import { Input, Button, Spinner } from 'reactstrap';
import { useState } from 'react';
import { A } from '../compounds/CompoundCard';

const apiKey = process.env.REACT_APP_SMARTS_PLUS_API_KEY ? process.env.REACT_APP_SMARTS_PLUS_API_KEY : null;

export default function SmartsInput(props) {
  const { setError, smarts, setSmarts, visualization, setVisualization } = props;
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      const resp = await fetch(smartsView, {
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
              smarts_string_into_picture: false
            },
          },
        }),
      });

      const job = await resp.json();
      const jobId = job.job_id;
      const maxAttempts = 50;

      // Even if jobId is returned from POST request, the query may not be saved yet
      // reason for multiple scheduled GET requests untill it returns the expected object
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const resp = await fetch(`${smartsView}?job_id=${jobId}`);
        if (!resp.ok) {
          setError('Invalid SMARTS string');
          setIsLoading(false);
          return;
        }
        const job = await resp.json();
        if (job?.result?.error) {
          const err = new Error(resp.result.error);
          throw err;
        }

        if (job?.result?.image) {
          const dataUrl = 'data:image/png;base64,' + job.result.image;
          setVisualization(dataUrl);
          setIsLoading(false);
          return;
        }

        if (attempt === 49) {
          setError('Took too long to respond. Check your internet connection');
          setIsLoading(false);
          return;
        }

        await timer(100 + attempt * 50);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="d-flex justify-content-between gap-2">
        <Input
          placeholder="SMARTS"
          onChange={(e) => {
            setSmarts(e.target.value);
            setError(null);
          }}
          value={smarts ?? ""}
        />

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
      {apiKey === null && (
        <p>
          Build your SMARTS <A href="https://smarts.plus/">here</A>.
        </p>
      )}
      {visualization && <img src={visualization}></img>}
    </>
  );
}
