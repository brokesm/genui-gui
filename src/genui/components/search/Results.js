import CompoundCard from '../compounds/CompoundCard';
import SimplePaginator from '../SimplePaginator';

function Results(props) {
  const { data, providers, scope, mode, activeTabs, setActiveTabs } = props;

  return (
    <SimplePaginator items={data} itemsPerPage={5}>
        {(currentPageItems) => currentPageItems.map((mol) => (
        <CompoundCard
          {...props}
          mol={mol}
          activeTabs={activeTabs}
          setActiveTabs={setActiveTabs}
          scope={scope}
          providers={providers}
          mode={mode}
          key={mol.id}
        />))}
    </SimplePaginator>
  );
}

export default Results;
