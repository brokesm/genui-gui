import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import { useRef, useEffect } from 'react';

import 'ketcher-react/dist/index.css';
const structServiceProvider = new StandaloneStructServiceProvider();

const KetcherEditor = (props) => {
  const containerRef = useRef(null);
  const {setSmiles, smiles} = props

  useEffect(() => {
    document.addEventListener('contextmenu', (e) => e.stopPropagation(), true)
    return () => {
      document.removeEventListener('contextmenu', (e) => e.stopPropagation(), true)
    }
  },[])

  async function onKetcherInit(ketcher) {
    if (smiles) await ketcher.setMolecule(smiles)
    window.ketcher = ketcher;
    ketcher.editor.subscribe("change", async () => {
      const smiles = await ketcher.getSmiles()
      setSmiles(smiles)
    })
    containerRef.current.scrollIntoView({ block: "end" });
  }

  return (
    <div style={{ height: 600 }} ref={containerRef}>
      <Editor
        staticResourcesUrl={process.env.PUBLIC_URL}
        structServiceProvider={structServiceProvider}
        errorHandler={(e) => console.log(e.message)}
        disableMacromoleculesEditor
        onInit={(ketcher) => onKetcherInit(ketcher)}
      />
    </div>
  );
};

export default KetcherEditor;
