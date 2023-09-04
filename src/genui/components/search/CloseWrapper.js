import { CloseButton } from 'reactstrap';

export default function CloseWrapper(props) {
  const { children, open, setOpen, searchAccrossMultipleSets, setResponse, response } = props;

  if (!searchAccrossMultipleSets) return children;

  return (
    <>
      {(open || response) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CloseButton
              onClick={() => {
                setOpen(false);
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
