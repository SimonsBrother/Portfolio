import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';

function Sidebar(planetJsons) {
  const [showSidebar, setShowSidebar] = useState(false)
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  function NavBtn() {
    return (
      <button id="nav-btn"
              className={showSidebar ? 'nav-btn-clicked' : 'nav-btn-default'}
              onClick={toggleSidebar}>
        <i className="material-symbols-outlined" id="planet-icon">planet</i>
      </button>
    )
  }

  // const planetEntries = planetJsons.map(planetJson => <PlanetEntry planetJson={planetJson} />)

  return <>
    <NavBtn/>
    <ol>
      {/*{planetEntries}*/}
    </ol>
  </>
}

function PlanetEntry(planetJson, id) {
  return (
    <li key={id}>
      id
    </li>
  );
}

const sidebarNode = document.getElementById("sidebar");
createRoot(sidebarNode).render(<Sidebar/>);

// const navBtn = document.getElementById("nav-btn-container");
// createRoot(navBtn).render(<NavBtn/>);
