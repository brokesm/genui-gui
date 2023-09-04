import { useState } from 'react';
import classnames from 'classnames';
import Search from './search/Search';
import { TabContent, TabPane, Nav, NavItem, NavLink, Card } from 'reactstrap';

function TabWidget(props) {
  const defaultTab = props.activeTab ?? props.tabs?.[0]?.title ?? '';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const searchTabs = ['Similarity', 'Substructure', 'SMARTS'];
  const emptyTriplet = { open: false, response: {}, smiles: null };

  const [triplets, setTriplets] = useState(() => {
    return searchTabs.reduce(
      (acc, tab) => ({
        ...acc,
        [tab]: emptyTriplet,
      }),
      {}
    );
  });

  function triplet(tabTitle) {
    return triplets[tabTitle];
  }

  function setTriplet(tabTitle, update) {
    setTriplets((prev) => ({ ...prev, [tabTitle]: { ...prev[tabTitle], ...update } }));
  }

  function openOnlyOnFirstVisit(tabTitle) {
    if (!searchTabs.includes(tabTitle)) return;

    setTriplets((prev) => {
      const curr = prev[tabTitle];
      const noResponseYet = !curr.response || Object.keys(curr.response).length === 0;

      if (noResponseYet && !curr.open) {
        return { ...prev, [tabTitle]: { ...curr, open: true } };
      }
      return prev;
    });
  }

  if (props.activeTab && activeTab !== props.activeTab) {
    setActiveTab(props.activeTab);
  }

  return (
    <>
      <Card body className="stretch-to-container unDraggable">
        <div className="full-bleed">
          <Nav tabs>
            {props.tabs.map((tab) => (
              <NavItem key={tab.title}>
                <NavLink
                  className={classnames({ active: activeTab === tab.title })}
                  onClick={() => {
                    setActiveTab(tab.title);
                    openOnlyOnFirstVisit(tab.title);
                  }}
                  key={tab.title}
                >
                  {tab.title}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <TabContent activeTab={activeTab}>
            {props.tabs.map((tab) => {
              const Component = tab.renderedComponent;
              const isSearch = tab?.isSearch
              return (
                <TabPane key={tab.title} tabId={tab.title}>
                  {isSearch ? (
                    <Search
                      {...props}
                      providers={Object.keys(props.compoundSets)
                        .map((type) => props.compoundSets[type]
                        .filter((set) => set.id === props.item.id))
                        .reduce((acc, curr) => [...acc, ...curr], [])}
                      mode={tab.title.toLowerCase()}
                      open={triplet(tab.title).open}
                      setOpen={(open) => setTriplet(tab.title, { open })}
                      response={triplet(tab.title).response}
                      setResponse={(response) => setTriplet(tab.title, { response })}
                      smiles={triplet(tab.title).smiles}
                      setSmiles={(smiles) => setTriplet(tab.title, { smiles })}
                      searchAccrossMultipleSets={false}
                      scope={"set"}
                    />
                  ) : (
                    <Component {...props} />
                  )}
                </TabPane>
              );
            })}
          </TabContent>
        </div>
      </Card>
    </>
  );
}

export default TabWidget;
