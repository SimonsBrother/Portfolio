import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';
import {setNavStateFunction, stopFollowing} from "./focus";

// Represents the different states the nav button should be in; treat this like an enum
const NavBtnStates = {
  Default: 0,
  Sidebar: 1,
  Focussed: 2,

  // The icons to show for each state, where the ID of the state represents the index of the icon name from Google icons
  icons: [
    "planet",
    "arrow_back",
    "arrows_output",
  ]
};


function NavBtn({navState, onClick}) {
  const clickedClass = navState === NavBtnStates.Sidebar ? 'clicked' : ''
  return (
    <button
      // Only show the clicked style if the sidebar is shown, not when focussed (and obviously not when in default state)
      className={`nav-btn ${clickedClass}`}
      onClick={onClick}>
      <i className={`material-symbols-outlined nav-btn-icon ${clickedClass}`}>{NavBtnStates.icons.at(navState)}</i>
    </button>
  )
}

function Sidebar(planetJsons) {
  const [navState, setNavState] = useState(NavBtnStates.Default);
  setNavStateFunction.setFollowing = () => setNavState(NavBtnStates.Focussed);
  const onNavButtonClicked = () => {
    switch (navState) {
      case NavBtnStates.Default:
        setNavState(NavBtnStates.Sidebar);
        break;
      case NavBtnStates.Sidebar:
        setNavState(NavBtnStates.Default);
        break;
      case NavBtnStates.Focussed:
        setNavState(NavBtnStates.Default);
        stopFollowing();
        break;
    }
  }

  // const planetEntries = planetJsons.map(planetJson => <PlanetEntry planetJson={planetJson} />)
  return <>
    <NavBtn navState={navState} onClick={onNavButtonClicked} />
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

export function addSidebar() {
  const sidebarNode = document.getElementsByClassName("sidebar")[0];
  createRoot(sidebarNode).render(<Sidebar/>);
}
