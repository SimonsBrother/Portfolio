import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';
import {
  handlePossibleFocusTarget,
  moveToOverviewPos,
  setFollowTarget,
  setNavStateFunction,
  stopFollowing
} from "./focus";
import {Planet} from "./planets";
import {planetJsons} from "./loadPlanets";

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
      className={`nav-btn border twinkle-border ${clickedClass}`}
      onClick={onClick}>
      <i className={`material-symbols-outlined nav-btn-icon prevent-select
      ${clickedClass}`}>{NavBtnStates.icons.at(navState)}</i>
    </button>
  )
}

/**
 * Sidebar component
 * @param planetJsonsToShow the list of planet JSON data
 * @return {JSX.Element}
 */
function Sidebar({planetJsonsToShow}) {
  // Define the navigation state
  const [navState, setNavState] = useState(NavBtnStates.Default);
  // Setup functions that the code handling focus can use; use this round about way to control state outside the function
  setNavStateFunction.setFollowing = () => setNavState(NavBtnStates.Focussed);
  setNavStateFunction.setDefault = () => setNavState(NavBtnStates.Default);

  // Setup how the nav button should react to being clicked
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

  // Create planet entries from JSON
  const planetEntries = planetJsonsToShow.map((planetJson, index) => <PlanetEntry text={planetJson.name}
                                                                                  onClick={() => handlePossibleFocusTarget(Planet.planets[index].model)}
                                                                                  imageUrl={planetJson.iconPath}
                                                                                  key={index} />)

  return <div style={{position: "relative"}}>
    <NavBtn navState={navState} onClick={onNavButtonClicked}/>
    <div className={`sidebar prevent-select ${navState === NavBtnStates.Sidebar ? 'show-sidebar' : ''}`}>
      {/* Back button and re-centre */}
      <PlanetEntry imageUrl={window.innerWidth < 600 ? "img/up.svg" : "img/back.svg" }
                   onClick={() => setNavState(NavBtnStates.Default)} />
      <PlanetEntry text="Re-centre" imageUrl="img/quasar.svg" onClick={moveToOverviewPos} />
      {planetEntries}
    </div>
  </div>
}

/**
 * Entry component in the sidebar
 * @param text the text to show on the sidebar
 * @param onClick the function to call when the entry is clicked
 * @param imageUrl the icon to show for this element.
 * @return {JSX.Element}
 */
function PlanetEntry({text, onClick, imageUrl="img/img.png"}) {
  return (
    <div className="sidebar-item" onClick={onClick}>
      <img src={imageUrl} alt="" className="sidebar-item-image" />
      <h2 className="sidebar-item-text">{text}</h2>
    </div>
  );
}

/**
 * Adds the sidebar to the HTML document.
 */
export function addSidebar() {
  const sidebarNode = document.getElementsByClassName("sidebar-container")[0];
  createRoot(sidebarNode).render(<Sidebar planetJsonsToShow={planetJsons} />);
}
