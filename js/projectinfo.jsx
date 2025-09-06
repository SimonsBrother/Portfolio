import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {setTitleFunction, followTarget, setVisibleFunction} from "./focus";
import {Planet} from "./planets";
import {planetJsons} from "./loadPlanets";


function ProjectTitle() {
  const [title, setTitle] = useState('');
  const [visible, setVisible] = useState(false);
  setTitleFunction.setTitle = setTitle;
  setVisibleFunction.setVisible = setVisible;

  return <div>
    <div className={ "infobox title border quasar-border " + (visible ? 'showTitle' : '') }>
      <h1 className="info">
        { title }
      </h1>
    </div>

    <div className="scroll-arrow">
      <i className={ "material-symbols-outlined " + (visible ? 'showArrow' : '') }>arrow_drop_down</i>
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
