import { DropdownItem, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

function SearchDropDown(props) {
  const { onSimilarity, onSubstructure, onSmarts } = props;
  
  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret>
        Search
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={onSimilarity}>Similarity</DropdownItem>
        <DropdownItem onClick={onSubstructure}>Substructure</DropdownItem>
        <DropdownItem onClick={onSmarts}>SMARTS</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default SearchDropDown;
