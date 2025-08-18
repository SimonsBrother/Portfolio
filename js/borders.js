document.addEventListener("DOMContentLoaded", () => {
  const updateRate = 30; // times per second
  const quasarBorderElements = document.getElementsByClassName("quasar-border");
  const twinkleBorderElements = document.getElementsByClassName("twinkle-border");

  setInterval( () => {animateQuasarGradient(quasarBorderElements)},
    1/updateRate);
  setInterval(() => {animateTwinkleGradient(twinkleBorderElements)},
    1/updateRate);
});

let quasarBorderProgress = 0; // this doesn't have any particular unit or upper limit
let quasarBorderDirection = 0;
function animateQuasarGradient(elements) {
  for (const element of elements) {
    quasarBorderProgress += 0.2e-5; // Increase to speed up
    quasarBorderDirection += Math.abs(5 * Math.sin(2 * quasarBorderProgress));
    if (quasarBorderDirection >= 360) {
      quasarBorderDirection = 0;
      quasarBorderProgress = 0;
    }

    setQuasarGradient(element, quasarBorderDirection);
  }
}

function setQuasarGradient(element, direction) {
  element.style.borderImageSource =
    `linear-gradient(${direction}deg,
        rgba(0, 0, 0, 1) ${0}px,
        rgba(255, 255, 43, 1) ${5}%,
        rgba(0, 255, 30, 1) ${17}%,
        rgba(227, 227, 227, 1) ${24}%,
        rgba(224, 224, 224, 1) ${88}%,
        rgba(66, 66, 66, 1) ${94}%)`;
}



const minimumOpacity = 0.5;
const minimumOpacityAtProgress = 0.6
const opacityRateOfChange = 100;
let twinkleBorderProgress = 0; // 0 to 1
function animateTwinkleGradient(elements) {
  for (const element of elements) {
    twinkleBorderProgress += 0.001;

    if (twinkleBorderProgress >= 1) {
      twinkleBorderProgress = 0;
      // todo randomise
    }

    // opacity = 5(progress - 0.7)^2+0.7
    const opacity = opacityRateOfChange * Math.pow(twinkleBorderProgress - minimumOpacityAtProgress, 2) + minimumOpacity
    setTwinkleGradient(element, opacity);
  }
}

function setTwinkleGradient(element, opacity) {
  element.style.borderImageSource =
    `conic-gradient(
    rgba(255, 255, 255, ${1}) 6%,
    rgba(255, 255, 255, ${opacity}) 22%,
    rgba(255, 255, 255, ${1}) 40%,
    rgba(255, 255, 255, ${opacity}) 51%,
    rgba(255, 255, 255, ${1}) 53%,
    rgba(255, 255, 255, ${opacity}) 64%,
    rgba(255, 255, 255, ${1}) 69%,
    rgba(255, 255, 255, ${1}) 81%,
    rgba(255, 255, 255, ${opacity}) 85%,
    rgba(255, 255, 255, ${1}) 90%
    )`;
}
