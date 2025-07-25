import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';
import {moveToOverviewPos, setFollowTarget, setNavStateFunction, stopFollowing} from "./focus";
import {Planet} from "./planets";

// Represents the different states the nav button should be in; treat this like an enum
const NavBtnStates = {
  Default: 0,
  Sidebar: 1,
  Focussed: 2,

  // The icons to show for each state, where the ID of the state represents the index of the icon name from Google icons
  icons: [
    "planet",
    "planet",
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
      <i className={`material-symbols-outlined nav-btn-icon prevent-select
      ${clickedClass}`}>{NavBtnStates.icons.at(navState)}</i>
    </button>
  )
}

function Sidebar({planetJsons}) {
  const [navState, setNavState] = useState(NavBtnStates.Default);
  setNavStateFunction.setFollowing = () => setNavState(NavBtnStates.Focussed);
  setNavStateFunction.setDefault = () => setNavState(NavBtnStates.Default);
  const onNavButtonClicked = () => {
    switch (navState) {
      case NavBtnStates.Default:
        setNavState(NavBtnStates.Sidebar);
        break;
      case NavBtnStates.Focussed:
        setNavState(NavBtnStates.Default);
        stopFollowing();
        break;
    }
  }

  const planetEntries = planetJsons.map((planetJson, index) => <PlanetEntry text={planetJson.name}
                                                                            onClick={() => setFollowTarget(Planet.planets[index].model)}
                                                                            key={index} />)

  return <div style={{position: "relative"}}>
    <NavBtn navState={navState} onClick={onNavButtonClicked}/>
    <div className={`sidebar prevent-select ${navState === NavBtnStates.Sidebar ? 'show-sidebar' : ''}`}>
      <PlanetEntry imageUrl="img/back.svg" onClick={() => setNavState(NavBtnStates.Default)} />
      <PlanetEntry text="Re-centre" imageUrl="img/quasar.svg" onClick={moveToOverviewPos} />
      {planetEntries}
    </div>
  </div>
}

function PlanetEntry({text, onClick, imageUrl="img/img.png"}) {
  return (
    <div className="sidebar-item" onClick={onClick}>
      <img src={imageUrl} alt="" className="sidebar-item-image" />
      <h2 className="sidebar-item-text">{text}</h2>
    </div>
  );
}

export function addSidebar() {
  const sidebarNode = document.getElementsByClassName("sidebar-container")[0];
  const testEntries = [{name: "Test1"}, {name: "Test2"}];
  createRoot(sidebarNode).render(<Sidebar planetJsons={testEntries} />);
}
