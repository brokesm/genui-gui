import { useState } from 'react';
import { Col, Row, Button } from 'reactstrap';
import {
  ActivitiesByTypeFlatView,
  MoleculeActivityProvider,
  MoleculeMetadata,
  MoleculeImage,
  MoleculePropsProvider,
  TabWidget,
  PropertiesTable,
} from '../../..';
import MoleculeSearchProvider from '../details/MoleculeSearchProvider';
import CompoundCard from '../CompoundCard';
import { initActiveTabs } from '../../search/utils';
import { SearchModal } from '../CompoundCard';
import {Modal, ModalBody, ModalFooter} from 'reactstrap';


// function MoleculeData(props) {

//     let showData = typeof props.showInfo === 'boolean' ? props.showInfo : true;
//     const showActivities = typeof props.showActivities === 'boolean' ? props.showActivities : true;
//     const showProperties = typeof props.showProperties === 'boolean' ? props.showProperties : true;

//     if (!(showData || showActivities)) {
//       showData = true;
//     }

//     const tabs = [];
//     if (showData) {
//       tabs.push({
//         title: 'Info',
//         renderedComponent: MoleculeMetadata,
//       });
//     }

//     if (showActivities) {
//       tabs.push({
//         title: 'Activities',
//         renderedComponent: (props) => <MoleculeActivityProvider {...props} component={ActivitiesByTypeFlatView} />,
//       });
//     }

//     if (showProperties) {
//       tabs.push({
//         title: 'Properties',
//         renderedComponent: (props) => (
//           <MoleculePropsProvider
//             {...props}
//             propsList={['AMW', 'NUMHEAVYATOMS', 'NUMAROMATICRINGS', 'HBA', 'HBD', 'LOGP', 'TPSA']}
//             component={PropertiesTable}
//           />
//         ),
//       });
//     }

//     if (props.mode !== null) {
//       tabs.push({
//         title: 'Results',
//         renderedComponent: (props) => (
//           <MoleculeSearchProvider {...props} />
//         ),
//       });
//     }

//     return (
//       <TabWidget {...props} tabs={tabs} activeTab={showActivities ? 'Activities' : 'Info'} />
//     );
// }

// export function CompoundListItem(props) {
//   const [mode, setMode] = useState(null)
//   console.log(props)

//   const mol = props.mol;
//   const sm_cols = [3, 9];
//   const md_cols = [3, 9];

//   function onSimilaritySearch() {
//     setMode("searching")
//     setTimeout(() => {
//       console.log("simulating API call")
//       setMode("browsing")
//     }, 1000)
//   }

//   function onSubstructureSearch() {
//     setMode("searching")
//     setTimeout(() => {
//       console.log("simulating API call")
//       setMode("browsing")
//     }, 1000)

//   }

//   return (
//     <Row>
//       <Col md={md_cols[0]} sm={sm_cols[0]} className="mb-2">
//         <MoleculeImage mol={mol} />
//         <div className="d-flex align-items-left gap-2">
//           <Button onClick={onSimilaritySearch} color="primary" disabled={mode === "searching"}>Similarity</Button>
//           <Button onClick={onSubstructureSearch} color="primary" disabled={mode === "searching"}>Substructure</Button>
//         </div>
//       </Col>
//       <Col md={md_cols[1]} sm={sm_cols[1]}>
//         <MoleculeData {...props} mode={mode}/>
//       </Col>
//     </Row>
//   );
// }

export default function CompoundList(props) {
  const mols = props.mols;
  const [activeTabs, setActiveTabs] = useState({});
  const [modalActiveTabs, setModalActiveTabs] = useState({});
  const [modalOpen, setModalOpen] = useState({});
  const [modalResponse, setModalResponse] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [modalProviders, setModalProviders] = useState([]);

  if (mols.map((mol) => String(mol.id)).filter((id) => !Object.keys(activeTabs).includes(id)).length !== 0) {
    setActiveTabs(() => initActiveTabs(mols, activeTabs));
  }

  const molSetTypes = Object.keys(props.compoundSets);
  const providersByType = molSetTypes.map((type) => props.compoundSets[type]);
  const providers = providersByType.reduce((acc, curr) => [...acc, ...curr], []);

  async function getProjectProviders() {
    const resp = await fetch(props.apiUrls.projectList, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      method: 'GET',
    });

    const projects = [];
    let payload = await resp.json();
    payload.forEach((project) => {
      const url = '/projects/' + project.id + '/';
      projects.push(Object.assign({ url: url }, project));
    });

    return projects;
  }

  async function viewInModal(tab, mol) {
    const providers = await getProjectProviders();
    const ids = providers.map((item) => item.id);
    const mode = tab === 'Similars' ? 'similarity' : 'substructure';
    try {
      const resp = await fetch(props.apiUrls.searchRoot + `project/${mode}/`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          input: mol.smiles,
          ids: ids,
          threshold: 0,
        }),
      });

      const payload = await resp.json();


      if (!resp.ok) {
        throw new Error(resp.statusText);
      }

      setModalResponse(payload);
      setModalMode(mode);
      setModalOpen(prev => ({...prev, [mol.id]: true}));
      setModalActiveTabs(initActiveTabs(payload.hits, {}));
      setModalProviders(providers);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      {mols.map((mol) => (
        <>
          <CompoundCard
            {...props}
            key={mol.id}
            mol={mol}
            activeTabs={activeTabs}
            setActiveTabs={setActiveTabs}
            scope="set"
            providers={providers}
            mode="info"
            viewInModal={viewInModal}
          />
          <Modal isOpen={modalOpen[mol.id]} toggle={() => setModalOpen(prev => ({...prev, [mol.id]: false}))} size="xl">
            <ModalBody>
              {modalOpen[mol.id] &&
                modalResponse.hits.map((mol) => (
                  <CompoundCard
                    {...props}
                    mol={mol}
                    activeTabs={modalActiveTabs}
                    setActiveTabs={setModalActiveTabs}
                    scope="project"
                    providers={modalProviders}
                    mode={modalMode}
                    key={`modal_${mol.id}`}
                  />
                ))}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={() => setModalOpen(prev => ({...prev, [mol.id]: false}))}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </>
      ))}
    </>
  );
}
