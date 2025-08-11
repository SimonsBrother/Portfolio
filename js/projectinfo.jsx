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
    <div className="infobox title">
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

  // TODO move to separate file
  const infoboxElements = document.getElementsByClassName("infobox");
  document.onmousemove = document.ontouchmove = event => {
    for (const infoboxElement of infoboxElements) {
      const elementPositions = infoboxElement.getBoundingClientRect();
      const centerX = elementPositions.x + elementPositions.width / 2;
      const centerY = elementPositions.y + elementPositions.height / 2;
      const bearing = -calculateBearing(event.clientX, event.clientY, centerX, centerY) - 180;
      const intensity = Math.pow(Math.abs(Math.sin(bearing * Math.PI / 90)), 0.01) * 50 + 5;
      infoboxElement.style.borderImageSource =
        `linear-gradient(${bearing}deg,
        rgba(0, 0, 0, 1) 0%,
        rgba(255, 255, 43, 1) 8%,
        rgba(0, 255, 30, 1) 17%,
        rgba(227, 227, 227, 1) 24%,
        rgba(224, 224, 224, 1) 88%,
        rgba(66, 66, 66, 1) 94%)`;
    }
    // event.clientX
  }
}

function calculateBearing(x1, y1, x2, y2) {
  return Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI;
}
