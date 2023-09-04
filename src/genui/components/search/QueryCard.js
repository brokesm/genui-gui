import { Button, CardBody, Spinner, Card, CardHeader, Row, Col, CardFooter } from 'reactstrap';
import { CompoundCardRow } from '../compounds/CompoundCard';
import { useEffect } from 'react';
import { generateImage } from './utils';
import Scope from './Scope';

export function SearchButton(props) {
  const { children, onSubmit, onAbort, status } = props;

  return (
    <>
      <Button
        color="primary"
        disabled={status === 'submitting'}
        onClick={() => {
          onSubmit();
        }}
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
    </>
  );
}

export default function QueryCard(props) {
  const {
    queryRef,
    setOpen,
    onAbort,
    onSubmit,
    status,
    response,
    smartsPattern,
    providers,
    filteredOut,
    setFilteredOut,
    searchAccrossMultipleSets,
    excluded,
    mode
  } = props;


  function onEdit() {
    setOpen(true);
  }

  useEffect(() => {
    // sometimes this generates duplicated structure, don't know why
    if (response) generateImage(queryRef)
  }, [response,queryRef]);

  const toFilter = providers.filter((prov) => !excluded.map((obj) => obj.id).includes(prov.id));

  return (
    <div style={{ width: 'fit-content' }}>
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between gap-4">
            <h2>Query – {mode === "similarity" ? "Similarity Search" : "Substructure Search"}</h2>
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
            <Col xl="2" lg="3" md="4" className="d-flex align-items-center justify-content-center">
              <img ref={queryRef} alt={'Structure not available'} />
            </Col>
            <Col xl="10" lg="9" md="8">
              <CompoundCardRow property={'SMILES'}>{response.query.canonical}</CompoundCardRow>
              <CompoundCardRow property={'SMARTS'}>{smartsPattern}</CompoundCardRow>
              <CompoundCardRow property={'Results'}>{response.total_returned}</CompoundCardRow>
              <CompoundCardRow property={'Searched'}>{response.total_searched}</CompoundCardRow>
            </Col>
          </Row>
        </CardBody>
        {searchAccrossMultipleSets && toFilter.length > 1 && (
            <CardFooter>
              <Scope providers={toFilter} excluded={filteredOut} setExcluded={setFilteredOut} />
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
