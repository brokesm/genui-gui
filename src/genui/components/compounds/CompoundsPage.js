import { useState, useEffect, useRef, createRef } from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import ObjectGroupsList from '../ObjectSelectionList';
import Search from '../search/Search';
import SearchDropDown from '../search/SearchDropDown';

function HeaderNav(props) {
  return (
    <>
      <SearchDropDown {...props}/>
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav>Add New...</DropdownToggle>
        <DropdownMenu>
          {props.molSetChoices.map((choice) => (
            <DropdownItem
              key={choice}
              onClick={() => {
                props.onMolSetChoice(choice, []);
              }}
            >
              {props.definitions[choice].name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
}

function CompoundsPage(props) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('');
  const [isOpen, setIsOpen] = useState([])
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState({});

  const molsets = props.compoundSets;
  const molsetsEmpty = Object.keys(molsets).length === 0 && molsets.constructor === Object;
  const molsetScope = Object.values(molsets).reduce((acc, arr) => acc.concat(arr), []);

  const molsetRef = useRef(null)

  if (molsetScope.length !== 0 && molsetRef.current === null) {
    molsetRef.current = molsetScope.reduce((acc, ms) => ({...acc,[ms.id]:createRef()}), {})
  }

  function onMolSetChoice(choice, array) {
    setSelected(choice);
    props.handleAddMolSetList(choice, array);
  }

  function reset() {
    setResponse({})
  }

  function onSimilarity() {
    setMode('similarity');
    setOpen(true);
    reset()
  }

  function onSubstructure() {
    setMode('substructure');
    setOpen(true);
    reset()
  }

  function onSmarts() {
    setMode('smarts');
    setOpen(true);
    reset()
  }

  useEffect(() => {
    props.setPageHeader(
      <HeaderNav
        {...props}
        molSetChoices={Object.keys(props.definitions)}
        onSimilarity={onSimilarity}
        onSubstructure={onSubstructure}
        onSmarts={onSmarts}
        onMolSetChoice={onMolSetChoice}
      />
    );
  }, []);

  if (molsets === null) return <div>Loading...</div>;
  if (molsetsEmpty)
    return (
      <div>
        <p>There are currently no compound sets. Start by adding one from the actions menu in the top right.</p>
      </div>
    );

  return (
    <>
      <Search
        {...props}
        providers={molsetScope}
        open={open}
        setOpen={setOpen}
        mode={mode}
        setIsOpen={setIsOpen}
        molsetRef={molsetRef}
        response={response}
        setResponse={setResponse}
        scope={"sets"}
        key={mode}
      />
      <ObjectGroupsList
        {...props}
        id="compound-sets-list"
        objects={molsets}
        objectProp="molset"
        groupNameProp="currentMolsetClass"
        urlProp="molsetListUrl"
        ignoreGroups={['MolSet']}
        createProp="handleCreateNew"
        deleteProp="handleDelete"
        updateProp="handleUpdate"
        onDelete={props.handleMolSetDelete}
        onCreate={props.handleAddMolSet}
        onUpdate={props.requestMolSetsUpdate}
        focusGroup={selected}
        tasksUrlRoot={props.apiUrls.compoundSetsRoot}
        groupDefinitions={props.definitions}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        molsetRef={molsetRef}
      />
    </>
  );
}

export default CompoundsPage;
