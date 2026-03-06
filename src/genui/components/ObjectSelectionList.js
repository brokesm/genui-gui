import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, ListGroupItem, ListGroup, Container, Button } from 'reactstrap';
import { Card } from 'reactstrap';
import { TaskAwareComponent, TaskBadgeGroup } from '../index';
import Search from './search/Search';
import { useSearchParams } from 'react-router-dom';

function TasksOverview(props) {
  const tasksURL = new URL(`${props.item.id}/tasks/all/`, props.tasksUrlRoot);
  return (
    <TaskAwareComponent
      handleResponseErrors={props.handleResponseErrors}
      tasksURL={tasksURL}
      // onTaskUpdate={props.onTaskUpdate}
      render={(taskInfo) => {
        return taskInfo.tasksExist ? (
          <React.Fragment>
            Tasks
            <span style={{ fontSize: 'large' }}>
              <TaskBadgeGroup tasks={taskInfo.tasks} />
            </span>{' '}
            <br />
            {/*<TaskProgressBar*/}
            {/*    progressURL={this.props.progressURL}*/}
            {/*    tasks={taskInfo.tasks.running}*/}
            {/*/>*/}
          </React.Fragment>
        ) : null;
      }}
    />
  );
}

function ListItem(props) {
  const Component = props.groupDefinitions[props.groupName].listComponent;
  const componentProps = {};
  componentProps[props.objectProp] = props.item;
  componentProps[props.groupNameProp] = props.groupName;
  componentProps[props.urlProp] = props.groupDefinitions[props.groupName].url;
  const { isOpen, setIsOpen, molsetRef } = props;
  // const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    const projectId = props.currentProject.id;
    const setId = parseInt(localStorage.getItem(`isOpen_${projectId}`));
    localStorage.removeItem(`isOpen_${projectId}`);

    if (setId) {
      setIsOpen((prev) => [...prev, setId]);
      molsetRef.current[setId].current.scrollIntoView();
    }
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col xs="10" lg="11">
          <ListGroupItem
            tag="button"
            active={isOpen.includes(props.item.id)}
            key={props.item.id}
            action
            onClick={() => {
              if (isOpen.includes(props.item.id)) {
                setIsOpen((prev) => prev.filter((id) => id !== props.item.id));
              } else {
                setIsOpen((prev) => [...prev, props.item.id]);
              }
            }}
          >
            <strong ref={molsetRef?.current[props.item.id]}>{props.item.name}</strong> |
            <TasksOverview {...props} />
          </ListGroupItem>
        </Col>
        <Col xs="2" lg="1" className="text-center">
          <Button
            color="danger"
            disabled={isDeleting}
            className="w-99"
            onClick={(e) => {
              setIsDeleting(true);
              props.onDelete(props.groupName, props.item);
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Col>
        {/*<Col xs="2" lg="1"></Col>*/}
      </Row>
      {isOpen.includes(props.item.id) ? (
        <div>
          <br />
          <Card>
            <TaskAwareComponent
              handleResponseErrors={props.handleResponseErrors}
              tasksURL={new URL(`${props.item.id}/tasks/all/`, props.tasksUrlRoot)}
              // onTaskUpdate={props.onTaskUpdate}
              render={(taskInfo) => {
                return <Component {...props} {...componentProps} taskInfo={taskInfo} tasks={taskInfo.tasks} />;
              }}
            />
          </Card>
        </div>
      ) : null}
    </Container>
  );
}

function ActionButton(props) {
  const { item, activeNew, setActiveNew, setIsClosed, setOpen, reset, children } = props;
  return (
    <Button
      style={{ display: 'inline-block', marginLeft: '0.25rem', marginRight: '0.25rem' }}
      key={item.label}
      active={activeNew && item.label === activeNew.label}
      outline
      color="primary"
      onClick={(e) => {
        if (!activeNew || !(item.label === activeNew.label)) {
          setActiveNew(item);
          setIsClosed(false);
          setOpen(true);
          reset();
        } else {
          setActiveNew(null);
          setIsClosed(true);
          setOpen(false);
          reset();
        }
      }}
    >
      {children}
    </Button>
  );
}

function ObjectList(props) {
  const name = props.groupDefinitions[props.groupName].name;
  const new_components = props.groupDefinitions[props.groupName].newComponents;
  const [activeNew, setActiveNew] = useState(null);
  const [open, setOpen] = useState(false); //search + modal
  const [isClosed, setIsClosed] = useState(true); // closed menu
  const [response, setResponse] = useState({});

  const componentProps = {};
  const searchProps = {};
  componentProps[props.groupNameProp] = props.groupName;
  componentProps[props.urlProp] = props.groupDefinitions[props.groupName].url;
  componentProps[props.createProp] = (className, data) => {
    props.onCreate(className, data);
    setActiveNew(null);
  };
  componentProps[props.deleteProp] = props.onDelete;
  componentProps[props.updateProp] = props.onUpdate;

  searchProps.providers = props.objects;
  searchProps.mode = activeNew?.label.toLowerCase();
  searchProps.open = open;
  searchProps.setOpen = setOpen;
  searchProps.response = response;
  searchProps.setResponse = setResponse;
  searchProps.setActiveNew = setActiveNew;
  searchProps.scope = 'sets';

  function reset() {
    setResponse({});
  }

  // React.useEffect(() => {
  //   if (props.focusGroup) {
  //     const elmnt = document.getElementById(props.focusGroup);
  //     scrollTo(document.documentElement, elmnt.offsetTop, 300);
  //     elmnt.scrollIntoView();
  //   }
  // }, [props.focusGroup])

  // synchronize closed search window with deactivated tab
  if (isClosed && activeNew !== null) setActiveNew(null);

  return (
    <React.Fragment>
      <div className="d-flex align-items-center gap-2">
        <div className="d-flex align-items-center">
      <h2>{name} |</h2> 
      {new_components.map((item) =>
        !item.isSearch && (
          <ActionButton
            item={item}
            activeNew={activeNew}
            setActiveNew={setActiveNew}
            setIsClosed={setIsClosed}
            setOpen={setOpen}
            reset={reset}
          >
            {item.label}
          </ActionButton>
        )
      )}
      </div>
      <div className="d-flex align-items-end">
      {new_components.map((item) =>
        item.isSearch && (
          <>
            {item.label === "Similarity" && <h4>Search |</h4>}
            <ActionButton
              item={item}
              activeNew={activeNew}
              setActiveNew={setActiveNew}
              setIsClosed={setIsClosed}
              setOpen={setOpen}
              reset={reset}
            >
              {item.label}
            </ActionButton>
            </>
            
        )
      )}
      </div>
      </div>
      <hr />
      <div id={`${props.groupName}-group-list`} className="group-list">
        {activeNew && (
          <div>
            {activeNew.isSearch ? (
              <activeNew.component {...props} {...searchProps} key={activeNew?.label.toLowerCase()} />
            ) : (
              <activeNew.component {...props} {...componentProps} />
            )}
          </div>
        )}

        <ListGroup>
          {props.objects.map((item) => (
            <ListItem {...props} {...componentProps} key={item.id} item={item} />
          ))}
        </ListGroup>

        <br />
      </div>
    </React.Fragment>
  );
}

function ObjectGroupsList(props) {
  const objects = Object.assign({}, props.objects);
  if (props.ignoreGroups) {
    props.ignoreGroups.forEach((item) => delete objects[item]);
  }

  let scrollToFocus = null;
  if (props.focusGroup && !objects.hasOwnProperty(props.focusGroup)) {
    objects[props.focusGroup] = [];
    scrollToFocus = `${props.focusGroup}-group-list`;
  } else {
    scrollToFocus = false;
  }

  return (
    <div id={props.id}>
      {Object.keys(objects).map((groupName) => {
        return (
          <ObjectList
            {...props}
            scrollToFocus={scrollToFocus}
            key={groupName}
            addNew={groupName === props.addNew}
            groupName={groupName}
            objects={objects[groupName]}
            handleOpenItem={props.handleOpenItem}
          />
        );
      })}
    </div>
  );
}

export default ObjectGroupsList;
