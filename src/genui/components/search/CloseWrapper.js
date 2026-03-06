import { CloseButton } from 'reactstrap';

export default function CloseWrapper(props) {
  const { children, searchAccrossMultipleSets, setResponse, response } = props;

  if (!searchAccrossMultipleSets) return children;

  return (
    <>
      {response && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CloseButton
              onClick={() => {
                setResponse(null)
                props?.setActiveNew && props.setActiveNew(null)
              }}
            ></CloseButton>
          </div>
          {children}
        </>
      )}
    </>
  );
}
