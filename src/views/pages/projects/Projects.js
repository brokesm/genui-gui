import { useState, useEffect, useCallback } from 'react';
import { Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { ResponsiveGrid } from '../../../genui/';
import { CreateNewCard } from './CreateNewCard';
import { ProjectCard } from './ProjectCard';
import Search from '../../../genui/components/search/Search';
import SearchDropDown from '../../../genui/components/search/SearchDropDown';

function HeaderNav(props) {
  return (
    <>
      <SearchDropDown {...props} />
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          Actions
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => document.getElementById('new-proj-card').scrollIntoView()}>
            New Project
          </DropdownItem>
          <DropdownItem divider />
          <UncontrolledDropdown>
            <DropdownToggle nav>Open...</DropdownToggle>
            <DropdownMenu>
              {props.projects.map((project) => (
                <DropdownItem
                  key={project.id}
                  onClick={() => {
                    props.openProject(project);
                  }}
                >
                  {project.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
}

function Projects(props) {
  const [projects, setProjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('');
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState({});
  // const [smiles, setSmiles] = useState(null)

  function reset() {
    setResponse({})
    // setSmiles(null)
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

  function onInchiKey() {
    setMode('inchikey');
    setOpen(true);
    reset()
  }

  const fetchUpdates = useCallback(() => {
    fetch(props.apiUrls.projectList, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      method: 'GET',
    })
      .then((response) => response.json())
      .then(updateProjectRoutes);
  }, [props.apiUrls.projectList]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  function updateProjectRoutes(data) {
    const projects = [];
    data.forEach((project) => {
      const url = '/projects/' + project.id + '/';
      projects.push(Object.assign({ url: url }, project));
    });

    setProjects(projects);
    setIsLoading(false);

    props.setPageHeader(
      <HeaderNav
        {...props}
        projects={projects}
        onSimilarity={onSimilarity}
        onSubstructure={onSubstructure}
        onSmarts={onSmarts}
        onInchiKey={onInchiKey}
      />
    );
  }

  function handleCreate(values) {
    setCreating(true);
    fetch(props.apiUrls.projectList, {
      method: 'POST',
      body: JSON.stringify(values),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        let new_project = Object.assign({ url: `/projects/${data.id}` }, data);
        setCreating(false);
        props.openProject(new_project);
      });
  }

  const project_cards = projects.map((project) => ({
    id: project.id,
    h: { md: 3, sm: 3 },
    w: { md: 1, sm: 1 },
    minH: { md: 3, sm: 3 },
    data: project,
  }));

  const new_project_card = {
    id: 'new-project',
    h: { md: 4, sm: 4 },
    w: { md: 1, sm: 1 },
    minH: { md: 4, sm: 4 },
    data: {},
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Search
        {...props}
        providers={projects}
        mode={mode}
        open={open}
        setOpen={setOpen}
        response={response}
        setResponse={setResponse}
        // smiles={smiles}
        // setSmiles={setSmiles}
        scope={"projects"}
        key={mode}
      />
      {creating ? (
        <div>Loading...</div>
      ) : (
        <ResponsiveGrid
          items={project_cards.concat(new_project_card)}
          rowHeight={75}
          mdCols={2}
          smCols={1}
          gridID="projects-grid-layout"
        >
          {project_cards
            .map((item) => (
              <Card key={item.id.toString()}>
                <ProjectCard
                  {...props}
                  project={item.data}
                  deleteProject={(project) => {
                    props.deleteProject(project, fetchUpdates);
                  }}
                />
              </Card>
            ))
            .concat([
              <Card key="new-project" id="new-proj-card">
                <CreateNewCard handleCreate={handleCreate} />
              </Card>,
            ])}
        </ResponsiveGrid>
      )}
    </>
  );
}

export default Projects;
