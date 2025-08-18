
document.addEventListener("DOMContentLoaded", () => {
  const infoboxElements = document.getElementsByClassName("border");

  let progress = 0;
  let direction = 0;
  setInterval( () => {
    for (const infoboxElement of infoboxElements) {
      progress += 0.2e-5; // Increase to speed up
      direction += Math.abs(5 * Math.sin(2 * progress));
      if (direction >= 360) {
        direction = 0;
        progress = 0;
      }

      setGradient(infoboxElement, direction);
    }
  }, 1/30 // update 30 times per second
  );

});

function setGradient(element, direction) {
  element.style.borderImageSource =
    `linear-gradient(${direction}deg,
        rgba(0, 0, 0, 1) ${0}px,
        rgba(255, 255, 43, 1) ${5}%,
        rgba(0, 255, 30, 1) ${17}%,
        rgba(227, 227, 227, 1) ${24}%,
        rgba(224, 224, 224, 1) ${88}%,
        rgba(66, 66, 66, 1) ${94}%)`;
}
