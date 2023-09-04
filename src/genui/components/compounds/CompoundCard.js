import { useState } from 'react';
import { MoleculePic } from './details/MoleculeImage';
import {
  CardImg,
  Col,
  Row,
  Card,
  CardBody,
  Nav,
  NavLink,
  NavItem,
  Spinner
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';

export function CompoundCardRow(props) {
  const { property, children } = props;
  return (
    <div className="d-flex align-items-left gap-2">
      <div
        style={{
          borderRight: '5px solid darkblue',
          minWidth: 100,
          marginBottom: 5,
        }}
      >
        <strong>{property}</strong>
      </div>
      <div style={{ marginBottom: 5 }}>{children}</div>
    </div>
  );
}

function CompoundCardContainer(props) {
  const { children, mol } = props;
  return (
    <Card>
      <CardBody>
        <Row className="d-flex justify-content-between" sm="1">
          <Col xl="2" lg="3" md="4">
            <MoleculePic mol={mol} as={CardImg} alt={mol.smiles} />
          </Col>
          <Col xl="10" lg="9" md="8">
            {children}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

function NavigateButton(props) {

  const { setIsOpen, isOpen, scope, provider, children, molsetRef, modalId } = props;
  const navigate = useNavigate();
  return (
    <button
      style={{
        background: 'transparent',
        cursor: 'pointer',
        textDecoration: 'underline',
        color: '#069',
        border: 'none',
        padding: 0,
      }}
      onClick={() => {
        if (scope === 'project') {
          props.setModalOpen(prev => ({...prev, [modalId]:false}))
          navigate('/projects/' + provider.id + '/compounds', { state: { isOpen: isOpen } });
        } else {
          setIsOpen((prev) => [...prev, provider.id]);
          molsetRef.current[provider.id].current.scrollIntoView();
        }
      }}
    >
      {children}
    </button>
  );
}

export function A({ href, children }) {
  return (
    <a style={{ color: '#069' }} target="_blank" rel="noopener noreferrer" href={href}>
      {children}
    </a>
  );
}

export function InfoCard(props) {
  const { mol, providers, scope, mode, setIsOpen } = props;
  //const info = Object.keys(mol).filter((key) => typeof mol[key] !== 'object' && !Array.isArray(mol[key]));

  const info = ['smiles', 'inchi', 'inchiKey'];
  if (mode === 'similarity') info.push('similarity');
  const providerArray = scope === 'project' ? 'project_ids' : 'providers';

  function transformWord(word) {
    const transformWord = {
      smiles: 'SMILES',
      inchi: 'InChI',
      inchiKey: 'InChIKey',
      chemblID: 'ChEMBL ID',
    };
    if (Object.keys(transformWord).includes(word)) {
      return transformWord[word];
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  return (
    <CompoundCardContainer {...props}>
      {info.map((prprty) => (
        <CompoundCardRow property={transformWord(prprty)}>{mol[prprty] ? mol[prprty] : '-'}</CompoundCardRow>
      ))}
      <CompoundCardRow property={'Found in'}>
        {providers
          .filter((prov) => mol[providerArray].includes(prov.id))
          .map((prov) => (
            <>
              <NavigateButton
                {...props}
                provider={prov}
                scope={scope}
                isOpen={scope === 'project' && mol.providers}
                setIsOpen={setIsOpen}
                modalId={mol.id}
              >
                {prov.name}
              </NavigateButton>{' '}
            </>
          ))}
      </CompoundCardRow>
      {Object.keys(mol.extraArgs).map((arg) => (
        <CompoundCardRow property={transformWord(arg)}>
          {arg === 'chemblID' ? (
            <A href={`https://www.ebi.ac.uk/chembl/explore/compound/${mol.extraArgs[arg]}`}>{mol.extraArgs[arg]}</A>
          ) : (
            mol.extraArgs[arg]
          )}
        </CompoundCardRow>
      ))}
    </CompoundCardContainer>
  );
}

export function DetailsCard(props) {
  const { activities, properties, isLoading } = props;

  //    const translateProperty = {
  //     AMW: "Molecular weight",
  //     HBA: "Hydrogen bond acceptors",
  //     HBD: "Hydrogen bond donors",
  //     LOGP: "logP",
  //     TPSA: "TPSA",
  //     NUMROTATABLEBONDS:"Number of rotatable bonds"
  //    }

  const translateProperty = {
    AMW: 'AMW',
    HBA: 'HBA',
    HBD: 'HBD',
    LOGP: 'LOGP',
    TPSA: 'TPSA',
    NUMROTATABLEBONDS: 'NROTBONDS',
  };

  return (
    <CompoundCardContainer {...props}>
      {isLoading ? (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
          <Spinner type={'border'} color={'primary'} />
        </div>
      ) : (
        <Row
          sm="1"
          md="1"
          lg="1"
          xl={activities.every((activity) => Object.keys(activity.extraArgs).length !== 0) ? '3' : '2'}
        >
          <Col>
            <CompoundCardRow property={'Properties'}>
              {Object.keys(properties).map((property) => (
                <div>
                  {translateProperty[property] ?? property} = {properties[property]}
                </div>
              ))}
            </CompoundCardRow>
          </Col>
          {activities.length !== 0 && (
            <>
              <Col>
                <CompoundCardRow property={'Activities'}>
                  {activities.map((activity) => (
                    <div>
                      {activity.type.value} {activity.extraArgs.relation ?? '='}{' '}
                      {Math.round(activity.value * 100) / 100} {activity.units?.value} – {activity.source}
                    </div>
                  ))}
                </CompoundCardRow>
              </Col>
              {activities.every((activity) => Object.keys(activity.extraArgs).length !== 0) && (
                <Col>
                  <CompoundCardRow property={'Extra'}>
                    {activities.map((activity, idx) => (
                      <>
                        {/* {idx === 0 && (
                        <div>
                          Target:{' '}
                          <A href={`https://www.ebi.ac.uk/chembl/explore/target/${activities[idx].extraArgs.target}`}>
                            {activities[idx].extraArgs.target}
                          </A>
                        </div>
                      )} */}
                        {activity.extraArgs.assay && (
                          <div>
                            Assay ({activity.type.value}):{' '}
                            <A href={`https://www.ebi.ac.uk/chembl/explore/assay/${activity.extraArgs.assay}`}>
                              {activity.extraArgs.assay}
                            </A>
                          </div>
                        )}
                      </>
                    ))}
                  </CompoundCardRow>
                </Col>
              )}
            </>
          )}
        </Row>
      )}
    </CompoundCardContainer>
  );
}

export default function CompoundCard(props) {
  const [activities, setActivities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { mol, activeTabs, setActiveTabs, scope, providers, mode, viewInModal } = props;
  const options = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    method: 'GET',
  };

  const activsFromLS = JSON.parse(localStorage.getItem(`activities_${mol.id}`));
  const propsFromLS = JSON.parse(localStorage.getItem(`properties_${mol.id}`));

  if (activsFromLS && propsFromLS && activities.length === 0 && Object.keys(properties).length === 0) {
    setActivities(activsFromLS);
    setProperties(propsFromLS);
  }

  async function fetchExtraArgs(activity) {
    const assayId = activity.extraArgs?.assay;
    const targetId = activity.extraArgs?.target;
    const sourceId = activity.source; //expecting not null

    const assay =
      assayId &&
      (await fetch(props.apiUrls.compoundSetsRoot + `chembl/assays/${assayId}/`, options).then((response) =>
        response.json()
      ));
    const target =
      targetId &&
      (await fetch(props.apiUrls.compoundSetsRoot + `chembl/targets/${targetId}/`, options).then((response) =>
        response.json()
      ));
    const source = await fetch(props.apiUrls.activitySetsRoot + `${sourceId}/`, options).then((response) =>
      response.json()
    );

    if (target) activity.extraArgs = { ...activity.extraArgs, target: target.targetID };
    if (assay) activity.extraArgs = { ...activity.extraArgs, assay: assay.assayID };
    if (source) activity = { ...activity, source: source.name };

    return activity;
  }

  async function onTabChange(tab, compoundId) {
    setActiveTabs((prev) => ({ ...prev, [compoundId]: tab }));

    if (tab !== 'Details') return;
    if (activities.length !== 0 && Object.keys(properties).length !== 0) return;

    setIsLoading(true);

    const activs = await fetch(props.apiUrls.compoundsRoot + `${compoundId}/activities/`, options)
      .then((response) => response.json())
      .then(async (data) => Promise.all(data.map(fetchExtraArgs)))
      .catch((err) => {
        console.log(err);
      });

    const compound = await fetch(
      props.apiUrls.compoundsRoot +
        `${compoundId}/?` +
        new URLSearchParams({
          properties: ['NUMROTATABLEBONDS', 'HBA', 'HBD', 'AMW', 'TPSA', 'LOGP'],
        }),
      options
    )
      .then((response) => response.json())
      .catch((err) => {
        console.log(err);
      });

    setIsLoading(false);
    setActivities(activs);
    setProperties(compound.properties);

    localStorage.setItem(`activities_${compoundId}`, JSON.stringify(activs));
    localStorage.setItem(`properties_${compoundId}`, JSON.stringify(compound.properties));
  }

  return (
    <>
      <ResultsHeader
        activeTab={activeTabs[mol.id] ?? 'Info'}
        onTabChange={onTabChange}
        viewInModal={viewInModal}
        mol={mol}
        tabs={mode === 'info' ? ['Info', 'Details', 'Similars', 'Shared Substructure'] : ['Info', 'Details']}
      />
      {activeTabs[mol.id] === 'Info' && (
        <InfoCard {...props} mol={mol} scope={scope} providers={providers} mode={mode}/>
      )}
      {activeTabs[mol.id] === 'Details' && (
        <DetailsCard {...props} activities={activities} mol={mol} properties={properties} isLoading={isLoading} />
      )}
    </>
  );
}

function ResultsHeader(props) {
  const { activeTab, onTabChange, tabs, mol, viewInModal } = props;
  const defaultTabs = ['Info', 'Details'];
  const headerTabs = tabs ? tabs : defaultTabs;

  return (
    <Nav tabs style={{ width: 'fit-content' }}>
      {headerTabs.map((tab) => (
        <NavItem>
          <NavLink
            className={tab === activeTab ? 'active' : ''}
            onClick={
              defaultTabs.includes(tab)
                ? () => onTabChange(tab, mol.id)
                : () => {
                    viewInModal(tab, mol);
                  }
            }
          >
            {tab}
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  );
}
