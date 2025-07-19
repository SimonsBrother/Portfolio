import React from 'react';
import { createRoot } from 'react-dom/client';

function Sidebar() {
  return <div>

  </div>
}

const domNode = document.getElementById("sidebar");
const root = createRoot(domNode);
root.render(<Sidebar/>);
