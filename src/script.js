import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"
import { Raycaster } from "three"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
gui.closed = true

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Raycaster
const raycaster = new Raycaster()

// Mouse
const mouse = new THREE.Vector2()
const point = new THREE.Vector2()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

/**
 * Bg
 */
const bg = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(25, 25, 128, 128),
  new THREE.MeshBasicMaterial({ color: "#000" })
)
scene.add(bg)

/**
 * Particle
 */
let particleGeometry, particleMaterial, dot
const createParticle = () => {
  //   if (dot !== null) {
  //     scene.remove(dot)
  //   }

  particleGeometry = new THREE.PlaneBufferGeometry(3, 3, 32, 32)

  particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },

    vertexShader: `
            uniform float uTime;
    
            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.);
    
                modelPosition.x = sin(modelPosition.x * 2. * 3.14);
                modelPosition.y = cos(modelPosition.x * 2. * 3.14);
    
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectionPosition = projectionMatrix * viewPosition;
    
                gl_Position = projectionPosition;
    
                // Points
                gl_PointSize = 1.;
            }
        `,
    fragmentShader: `
            void main() {
                gl_FragColor = vec4(vec3(1.), 1.);
            }
        `,
  })

  dot = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(dot)

  dot.position.set(point.x, point.y)
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const aspectRatio = sizes.width / sizes.height
const camera = new THREE.OrthographicCamera(
  -4 * aspectRatio,
  4 * aspectRatio,
  4,
  -4,
  0.1,
  100
)
// const camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 100)

camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Mouse move
 */
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1

  createParticle()
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Cast ray
  raycaster.setFromCamera(mouse, camera)

  const objectsToTest = [bg]
  const intersects = raycaster.intersectObjects(objectsToTest)

  if (intersects.length > 0) {
    point.x = intersects[0].point.x
    point.y = intersects[0].point.y
  }

  // Update controls
  controls.update()

  //   Update Materials
  if (particleMaterial) {
    particleMaterial.uniforms.uTime.value = elapsedTime
  }

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
