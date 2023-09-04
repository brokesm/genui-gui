import { Label, Input,UncontrolledDropdown,DropdownItem,DropdownMenu,DropdownToggle } from 'reactstrap';

export function SearchInput(props) {
  const { setInput, params, name, children } = props;
  return (
    <div>
      <Label for={name}>{children}</Label>
      <Input onChange={(e) => setInput(e)} name={name} defaultValue={params[name]} value={params[name]} />
    </div>
  );
}

export function SearchInputWithOptions(props) {
  const { setInput, params, name, options, children } = props;
  return (
    <div>
      <Label for={name}>{children}</Label>
      <div className="d-flex align-items-left">
        <Input onChange={(e) => setInput(e)} name={name} defaultValue={params[name]} value={params[name]} />
        <UncontrolledDropdown>
          <DropdownToggle caret />
          <DropdownMenu>
            {options.map((option) => (
              <DropdownItem onClick={(e) => setInput(e)} name={name} value={option}>
                {option}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </div>
  );
}
