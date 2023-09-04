import { useEffect, useState } from 'react';

export function useAbortableFetch(url, options) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    setIsLoading(true)

    fetch(url, { ...options, signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => setData(result))
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          console.log(err.message);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setIsLoading(false));

    return () => abortController.abort();
  }, [url]);

  return { data:data, error:error, isLoading:isLoading };
}