import { Button, CardBody, Spinner, Card, CardHeader, Row, Col, CardFooter } from 'reactstrap';
import { CompoundCardRow } from '../compounds/CompoundCard';
import { useEffect } from 'react';
import { generateImage } from './utils';
import Scope from './Scope';

export function SearchButton(props) {
  const { children, onSearch, onAbort, status } = props;

  return (
    <div className="d-flex align-items-left gap-2">
      <Button
        color="primary"
        disabled={status === 'submitting'}
        onClick={onSearch}
      >
        {status === 'submitting' ? (
          <>
            Searching... <Spinner type="border" color="light" size="sm" />
          </>
        ) : (
          <>{children}</>
        )}
      </Button>
      {status === 'submitting' && <Button onClick={onAbort}>Abort</Button>}
    </div>
  );
}

export default function QueryCard(props) {
  const {
    queryRef,
    setOpen,
    onAbort,
    onSubmit,
    status,
    smartsPattern,
    response,
    providers,
    filteredOut,
    setFilteredOut,
    searchAccrossMultipleSets,
    excluded,
    mode,
    smiles
  } = props;

  function onEdit() {
    setOpen(true);
  }

  useEffect(() => {
    // sometimes this generates duplicated structure, don't know why - perhaps solved?
    if (response && mode !== 'smarts') generateImage(queryRef, smiles)
  }, [response, queryRef, smiles]);

  const toFilter = providers.filter((prov) => !excluded.map((obj) => obj.id).includes(prov.id));

  const translateMode = {
    similarity:"Similarity",
    substructure: "Substructure",
    smarts:"SMARTS",
    inchikey: "InChI Key"
  }

  return (
    <div style={{ width: 'fit-content' }}>
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between gap-4">
            <h2>Query – {translateMode[mode]} Search</h2>
            <div className="d-flex align-items-left gap-2">
              <Button color="primary" onClick={onEdit}>
                Edit
              </Button>
              {/* <SearchButton onSubmit={onSubmit} onAbort={onAbort} status={status}>
                Run Again
              </SearchButton> */}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Row className="d-flex justify-content-between" sm="1">
            {mode !== 'smarts' && mode !== "inchikey" && (
              <Col xl="2" lg="3" md="4" className="d-flex align-items-center justify-content-center">
                <img ref={queryRef} alt={'Structure not available'} />
              </Col>
            )}

            <Col xl="10" lg="9" md="8">
              <CompoundCardRow property={mode ===  "smarts" ? 'SMARTS' : mode === "inchikey" ? "InChI Key" : "SMILES"}>{response.query.input}</CompoundCardRow>
              {/* {mode !== "smarts" && <CompoundCardRow property={'SMARTS'}>{smartsPattern}</CompoundCardRow>} */}
              <CompoundCardRow property={'Results'}>{response.total_returned}</CompoundCardRow>
              <CompoundCardRow property={'Searched'}>{response.total_searched}</CompoundCardRow>
            </Col>
          </Row>
        </CardBody>
        {searchAccrossMultipleSets && toFilter.length > 1 && mode !== "inchikey" && (
          <CardFooter>
            <Scope providers={toFilter} excluded={filteredOut} setExcluded={setFilteredOut} />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
