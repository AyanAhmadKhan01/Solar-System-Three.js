import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;

let raycaster, mouse;
let planets = [];
let planetInfo = {}; 


let mercury_orbit_radius = 50
let venus_orbit_radius = 60
let earth_orbit_radius = 70
let mars_orbit_radius = 80
let jupiter_orbit_radius = 100
let saturn_orbit_radius = 120
let uranus_orbit_radius = 140
let neptune_orbit_radius = 160

let mercury_revolution_speed = 2
let venus_revolution_speed = 1.5
let earth_revolution_speed = 1
let mars_revolution_speed = 0.8
let jupiter_revolution_speed = 0.7
let saturn_revolution_speed = 0.6
let uranus_revolution_speed = 0.5
let neptune_revolution_speed = 0.4


function createMaterialArray() {
  const skyboxImagepaths = ['./img/skybox/space_ft.png', './img/skybox/space_bk.png', './img/skybox/space_up.png', './img/skybox/space_dn.png', './img/skybox/space_rt.png', './img/skybox/space_lf.png']
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const loader = new THREE.TextureLoader();
  const planetTexture = loader.load(texture);
  const material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });

  const planet = new THREE.Mesh(geometry, material);

  return planet
}


function createRing(innerRadius) {
  let outerRadius = innerRadius - 0.1
  let thetaSegments = 100
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ color: '#202120', side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh)
  mesh.rotation.x = Math.PI / 2
  return mesh;

}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  initializePlanetInfo();

  setSkyBox();
  createPlanetsWithLoading().then(() => {
  
    planets = [
      { mesh: planet_sun, name: 'sun' },
      { mesh: planet_mercury, name: 'mercury' },
      { mesh: planet_venus, name: 'venus' },
      { mesh: planet_earth, name: 'earth' },
      { mesh: planet_mars, name: 'mars' },
      { mesh: planet_jupiter, name: 'jupiter' },
      { mesh: planet_saturn, name: 'saturn' },
      { mesh: planet_uranus, name: 'uranus' },
      { mesh: planet_neptune, name: 'neptune' }
    ];

    scene.add(planet_earth);
    scene.add(planet_sun);
    scene.add(planet_mercury);
    scene.add(planet_venus);
    scene.add(planet_mars);
    scene.add(planet_jupiter);
    scene.add(planet_saturn);
    scene.add(planet_uranus);
    scene.add(planet_neptune);

    const sunLight = new THREE.PointLight(0xffffff, 1, 0); 
    sunLight.position.copy(planet_sun.position); 
    scene.add(sunLight);

    
    createRing(mercury_orbit_radius)
    createRing(venus_orbit_radius)
    createRing(earth_orbit_radius)
    createRing(mars_orbit_radius)
    createRing(jupiter_orbit_radius)
    createRing(saturn_orbit_radius)
    createRing(uranus_orbit_radius)
    createRing(neptune_orbit_radius)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.id = "c";
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 12;
    controls.maxDistance = 1000;

    camera.position.z = 100;

    renderer.domElement.addEventListener('click', onMouseClick, false);

    hideLoadingScreen();
  });
}


function planetRevolver(time, speed, planet, orbitRadius, planetName) {

  let orbitSpeedMultiplier = 0.001;
  const planetAngle = time * orbitSpeedMultiplier * speed;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
}


function animate(time) {
  requestAnimationFrame(animate);

  if (!isPaused) {
    const deltaTime = time - lastTime;
    elapsed += deltaTime;
    
    const rotationSpeed = 0.005;
    planet_earth.rotation.y += rotationSpeed;
    planet_sun.rotation.y += rotationSpeed;
    planet_mercury.rotation.y += rotationSpeed;
    planet_venus.rotation.y += rotationSpeed;
    planet_mars.rotation.y += rotationSpeed;
    planet_jupiter.rotation.y += rotationSpeed;
    planet_saturn.rotation.y += rotationSpeed;
    planet_uranus.rotation.y += rotationSpeed;
    planet_neptune.rotation.y += rotationSpeed;

    planetRevolver(elapsed, mercury_revolution_speed, planet_mercury, mercury_orbit_radius, 'mercury')
    planetRevolver(elapsed, venus_revolution_speed, planet_venus, venus_orbit_radius, 'venus')
    planetRevolver(elapsed, earth_revolution_speed, planet_earth, earth_orbit_radius, 'earth')
    planetRevolver(elapsed, mars_revolution_speed, planet_mars, mars_orbit_radius, 'mars')
    planetRevolver(elapsed, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius, 'jupiter')
    planetRevolver(elapsed, saturn_revolution_speed, planet_saturn, saturn_orbit_radius, 'saturn')
    planetRevolver(elapsed, uranus_revolution_speed, planet_uranus, uranus_orbit_radius, 'uranus')
    planetRevolver(elapsed, neptune_revolution_speed, planet_neptune, neptune_orbit_radius, 'neptune')
  }
  
  lastTime = time;
  controls.update();
  renderer.render(scene, camera);
}

function createSpeedSlider(planetName, initialSpeed, onChange) {
  const container = document.querySelector('#speed-controls .controls-grid');
  
  const wrapper = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = planetName.charAt(0).toUpperCase() + planetName.slice(1);
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '0';
  input.max = '5';
  input.step = '0.1';
  input.value = initialSpeed;
  
  input.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    onChange(v);
  });
  
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  container.appendChild(wrapper);
}

createSpeedSlider('mercury', mercury_revolution_speed, v => mercury_revolution_speed = v);
createSpeedSlider('venus',   venus_revolution_speed,   v => venus_revolution_speed = v);
createSpeedSlider('earth',   earth_revolution_speed,   v => earth_revolution_speed = v);
createSpeedSlider('mars',    mars_revolution_speed,    v => mars_revolution_speed = v);
createSpeedSlider('jupiter', jupiter_revolution_speed, v => jupiter_revolution_speed = v);
createSpeedSlider('saturn',  saturn_revolution_speed,  v => saturn_revolution_speed = v);
createSpeedSlider('uranus',  uranus_revolution_speed,  v => uranus_revolution_speed = v);
createSpeedSlider('neptune', neptune_revolution_speed, v => neptune_revolution_speed = v);


let isPaused = false
let elapsed = 0
let lastTime = 0

const defaultSpeeds = {
  mercury: 2,
  venus:   1.5,
  earth:   1,
  mars:    0.8,
  jupiter: 0.7,
  saturn:  0.6,
  uranus:  0.5,
  neptune: 0.4
}

document.getElementById('pause-btn').addEventListener('click', () => {
  isPaused = !isPaused
  const btn = document.getElementById('pause-btn')
  const btnText = btn.querySelector('.btn-text')
  const btnIcon = btn.querySelector('.btn-icon')
  
  if (isPaused) {
    btnText.textContent = 'Resume'
    btnIcon.textContent = '▶'
  } else {
    btnText.textContent = 'Pause'
    btnIcon.textContent = '⏸'
  }
})

document.getElementById('reset-btn').addEventListener('click', () => {
  elapsed = 0
  lastTime = 0
  
  mercury_revolution_speed = defaultSpeeds.mercury
  venus_revolution_speed = defaultSpeeds.venus
  earth_revolution_speed = defaultSpeeds.earth
  mars_revolution_speed = defaultSpeeds.mars
  jupiter_revolution_speed = defaultSpeeds.jupiter
  saturn_revolution_speed = defaultSpeeds.saturn
  uranus_revolution_speed = defaultSpeeds.uranus
  neptune_revolution_speed = defaultSpeeds.neptune

  document.querySelectorAll('#speed-controls input').forEach(input => {
    const name = input.previousSibling.textContent.toLowerCase()
    if (defaultSpeeds[name] !== undefined) {
      input.value = defaultSpeeds[name]
    }
  })
  
  if (isPaused) {
    isPaused = false
    const btn = document.getElementById('pause-btn')
    const btnText = btn.querySelector('.btn-text')
    const btnIcon = btn.querySelector('.btn-icon')
    btnText.textContent = 'Pause'
    btnIcon.textContent = '⏸'
  }
})

document.getElementById('info-close').addEventListener('click', hidePlanetInfo);

document.getElementById('watermark').addEventListener('click', () => {
  
  const watermark = document.getElementById('watermark');
  const originalContent = watermark.innerHTML;
  watermark.innerHTML = `
    <div class="watermark-content">
      <span class="watermark-icon">💫</span>
      
      <span class="watermark-text">Thanks for visiting!</span>
    </div>
  `;
  
  setTimeout(() => {
    watermark.innerHTML = originalContent;
  }, 2000);
});


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

init();
animate(0);

// Planet information data
function initializePlanetInfo() {
  planetInfo = {
    sun: {
      name: "Sun",
      description: "The Sun is the star at the center of our Solar System. It's a nearly perfect sphere of hot plasma, providing light and heat to all planets.",
      distance: "0 AU",
      period: "N/A"
    },
    mercury: {
      name: "Mercury", 
      description: "Smallest planet, closest to the Sun. Mercury has extreme temperature variations and no atmosphere.",
      distance: "0.39 AU",
      period: "88 days"
    },
    venus: {
      name: "Venus",
      description: "Second planet from the Sun. Venus is the hottest planet in our solar system due to its thick atmosphere.",
      distance: "0.72 AU",
      period: "225 days"
    },
    earth: {
      name: "Earth",
      description: "Third planet from the Sun and the only known planet with life. Earth has liquid water and a protective atmosphere.",
      distance: "1.00 AU",
      period: "365 days"
    },
    mars: {
      name: "Mars", 
      description: "Fourth planet from the Sun, known as the Red Planet. Mars has the largest volcano and canyon in the solar system.",
      distance: "1.52 AU",
      period: "687 days"
    },
    jupiter: {
      name: "Jupiter",
      description: "Fifth planet from the Sun and the largest in our solar system. Jupiter is a gas giant with over 80 moons.",
      distance: "5.20 AU",
      period: "12 years"
    },
    saturn: {
      name: "Saturn",
      description: "Sixth planet from the Sun, famous for its prominent ring system. Saturn is a gas giant composed mostly of hydrogen and helium.",
      distance: "9.58 AU",
      period: "29 years"
    },
    uranus: {
      name: "Uranus", 
      description: "Seventh planet from the Sun. Uranus rotates on its side and has a faint ring system.",
      distance: "19.18 AU",
      period: "84 years"
    },
    neptune: {
      name: "Neptune",
      description: "Eighth and outermost planet in our solar system. Neptune is a windy, cold, and dark world.",
      distance: "30.07 AU",
      period: "165 years"
    }
  };
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const planetMeshes = planets.map(p => p.mesh);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    const planetData = planets.find(p => p.mesh === clickedObject);
    
    if (planetData) {
      showPlanetInfo(planetData.name);
    }
  }
}

function showPlanetInfo(planetName) {
  const info = planetInfo[planetName];
  if (!info) return;

  const panel = document.getElementById('info-panel');
  const nameElement = document.getElementById('info-name');
  const textElement = document.getElementById('info-text');
  const distanceElement = document.getElementById('info-distance');
  const periodElement = document.getElementById('info-period');

  nameElement.textContent = info.name;
  textElement.textContent = info.description;
  
  if (distanceElement) distanceElement.textContent = info.distance;
  if (periodElement) periodElement.textContent = info.period;
  
  panel.hidden = false;
}

function hidePlanetInfo() {
  document.getElementById('info-panel').hidden = true;
}



function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 1000); 
  }
}

function createPlanetsWithLoading() {
  return new Promise((resolve) => {
    setTimeout(() => {
      planet_earth = loadPlanetTexture("./img/Earth_hd.jpg", 4, 100, 100, 'standard');
      planet_sun = loadPlanetTexture("../img/Sun_hd.jpg", 20, 100, 100, 'basic');
      planet_mercury = loadPlanetTexture("./img/mercury_hd.jpg", 2, 100, 100, 'standard');
      planet_venus = loadPlanetTexture("./img/venus_hd.jpg", 3, 100, 100, 'standard');
      planet_mars = loadPlanetTexture("./img/mars_hd.jpg", 3.5, 100, 100, 'standard');
      planet_jupiter = loadPlanetTexture("./img/jupiter_hd.jpg", 10, 100, 100, 'standard');
      planet_saturn = loadPlanetTexture("./img/saturn_hd.jpg", 8, 100, 100, 'standard');
      planet_uranus = loadPlanetTexture("./img/uranus_hd.jpg", 6, 100, 100, 'standard');
      planet_neptune = loadPlanetTexture("./img/neptune_hd.jpg", 5, 100, 100, 'standard');
      resolve();
    }, 100);
  });
}
