import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {setTitleFunction} from "./focus";
import {Planet} from "./planets";
import {planetJsons} from "./loadPlanets";


function ProjectTitle() {
  const [title, setTitle] = useState('');
  setTitleFunction.setTitle = setTitle;
  const visibility = title === '' ? 'hidden' : 'visible'

  return <div style={ {visibility} }>
    <div className="infobox title border quasar-border">
      <h1 className="info">
        { title }
      </h1>
    </div>

    <div className="scroll-arrow">
      <i className="material-symbols-outlined" style={ {visibility} }>arrow_drop_down</i>
    </div>
  </div>
}

function InfoPanel() {

}

/**
 * Add info box stuff to DOM.
 */
export function addProjectInfoElements() {
  const sidebarNode = document.getElementsByClassName("project-info")[0];
  createRoot(sidebarNode).render(<ProjectTitle/>);
}
