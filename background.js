import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

let app;

try {
  app = TubesCursor(document.getElementById('canvas'), {
    tubes: {
      colors: ["#f967fb", "#53bc28", "#6958d5"],
      lights: {
        intensity: 100,
        colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
      }
    },
    bloom: {
      enabled: true,
      strength: 0.8,
      radius: 0.3,
      threshold: 0.3
    }
  });

  document.body.addEventListener('click', () => {
    const colors = randomColors(3);
    const lightsColors = randomColors(4);
    if (app && app.tubes) {
      app.tubes.setColors(colors);
      app.tubes.setLightsColors(lightsColors);
    }
  });
} catch (err) {
  console.warn("Dynamic background failed to initialize:", err);
}

function randomColors(count) {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
}
