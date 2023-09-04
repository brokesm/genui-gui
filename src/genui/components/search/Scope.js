import { Button, CardHeader } from 'reactstrap';

function Scope({ providers, excluded, setExcluded }) {

  const onExclude = (item) => {
    setExcluded((prev) => (prev.includes(item) ? prev : [...prev, item]));
  };

  const onInclude = (item) => {
    setExcluded((prev) => prev.filter((x) => x.id !== item.id));
  };

  return (
    <CardHeader>
      <div className="d-flex align-items-start mb-2">
        <div className="me-2" style={{ minWidth: 90 }}>Search in:</div>

        <div className="d-flex flex-wrap gap-2" style={{minHeight:38}}>
          {providers
            .filter((item) => !excluded.some((x) => x.id === item.id))
            .map((item) => (
              <Button key={item.id} color="primary" onClick={() => onExclude(item)}>
                {item.name}
              </Button>
            ))}
        </div>
      </div>

      <div className="d-flex align-items-start mb-2">
        <div className="me-2" style={{ minWidth: 90 }}>Filter out:</div>

        <div className="d-flex flex-wrap gap-2" style={{minHeight:38}}>
          {excluded.map((item) => (
            <Button key={item.id} color="secondary" onClick={() => onInclude(item)}>
              {item.name}
            </Button>
          ))}
        </div>
      </div>
    </CardHeader>
  );
}

export default Scope;
