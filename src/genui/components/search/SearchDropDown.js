import { DropdownItem, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

function SearchDropDown(props) {
  const { onSimilarity, onSubstructure, onSmarts, onInchiKey } = props;
  
  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret>
        Search
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={onSimilarity}>Similarity</DropdownItem>
        <DropdownItem onClick={onSubstructure}>Substructure</DropdownItem>
        <DropdownItem onClick={onSmarts}>SMARTS</DropdownItem>
        {onInchiKey && <DropdownItem onClick={onInchiKey}>InChI Key</DropdownItem>}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default SearchDropDown;
