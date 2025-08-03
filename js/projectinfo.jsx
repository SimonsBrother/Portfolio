import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {followTarget} from "./focus";
import {Planet} from "./planets";
import {planetJsons} from "./loadPlanets";


function ProjectTitle() {
  const [title, setTitle] = useState("");

  return <>
    <div className="infobox title">
      <h1 className="info">
        Very long name right here yep
      </h1>
    </div>

    <div className="scroll-arrow">
      <i className="material-symbols-outlined">arrow_drop_down</i>
    </div>
  </>
}


/**
 * Add info box stuff.
 */
export function addProjectInfoElements() {
  const sidebarNode = document.getElementsByClassName("project-info")[0];
  createRoot(sidebarNode).render(<ProjectTitle/>);
}
