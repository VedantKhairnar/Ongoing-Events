var swiper = new Swiper('.blog-slider', {
      spaceBetween: 30,
      effect: 'fade',
      loop: true,
      mousewheel: {
        invert: false,
      },
      // autoHeight: true,
      pagination: {
        el: '.blog-slider__pagination',
        clickable: true,
      }
    });


//   //////////////////////////
    particlesJS("particles-js", {
      "particles": {
        "number": {
          "value": 150,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#ffffff"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          "image": {
            "src": "img/github.svg",
            "width": 100,
            "height": 100
          }
        },
        "opacity": {
          "value": 0.5,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 2,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 40,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "grab"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 150,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
    
    requestAnimationFrame();
    
////////////////////

import * as $ from '//unpkg.com/three@0.117.1/build/three.module.js'
import { OrbitControls } from '//unpkg.com/three@0.117.1/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from '//unpkg.com/three@0.117.1/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from '//unpkg.com/three@0.117.1/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from '//unpkg.com/three@0.117.1/examples/jsm/postprocessing/UnrealBloomPass'

// ----
// Boot
// ----

const renderer = new $.WebGLRenderer({ antialias: false });
const scene = new $.Scene();
const camera = new $.PerspectiveCamera(75, 2, .1, 100);
const controls = new OrbitControls(camera, renderer.domElement);
const composer = new EffectComposer(renderer);
const size = new $.Vector2();
window.addEventListener('resize', () => {
    const { clientWidth, clientHeight } = renderer.domElement;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(clientWidth, clientHeight, false);
    renderer.getDrawingBufferSize(size);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    composer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(clientWidth, clientHeight);
});
document.body.prepend(renderer.domElement);
window.dispatchEvent(new Event('resize'));
renderer.setAnimationLoop(function (t) {
    composer.render();
    controls.update();
});

// ----
// Main
// ---- 

controls.autoRotate = true;
camera.position.set(0, .2, .2);

//// Make Mesh

const N_SPIRAL = 16;
const N_INST = 128;
const spirals = [];
const geom = new $.SphereBufferGeometry(.2, 3, 4);
geom.rotateX(Math.PI / 4);
for (let i = 0, I = N_SPIRAL; i < I; ++i) {
    const mat = new $.MeshLambertMaterial();
    const spiral = new $.InstancedMesh(geom, mat, N_INST);
    spiral.instanceMatrix.setUsage($.DynamicDrawUsage);
    spirals[i] = spiral;
    scene.add(spiral);
}

//// Lighting

const light = new $.PointLight('white', 1, 5, 1);
light.position.set(0, 1, 0);
scene.add(light);

//// PostProcessing

composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(size, 1, 1, .3));

//// Animate 

const f = (a, b, phi) => a * Math.pow(Math.E, b * phi);
const ctrl = {
    $spiral: null, $phi: 0, $r: 0, $scale: 1, $ry: 10, $iI: 0, $jJ: 0,
    $mtxT: new $.Matrix4(), $mtxR: new $.Matrix4(), $mtxS: new $.Matrix4(),
    set time(t) {
        for (let i = 0, I = spirals.length; i < I; ++i) {
            this.$spiral = spirals[i];
            this.$iI = i / I;
            this.$spiral.material.color.setHSL(t * (1 - this.$iI), 0.5, 0.5);
            this.$ry += 1e-4;
            for (let j = 0, J = N_INST; j < J; ++j) {
                this.$phi = (this.$jJ = j / J) * 6.28 + this.$iI * 6.28 * 4/*shift*/;
                this.$r = f(this.$iI, 0.005/*diverse-ity*/, this.$phi);
                this.$scale = 0.5 * (1 + this.$iI - this.$jJ);
                this.$mtxT.makeTranslation(this.$r * Math.cos(this.$phi), 0, this.$r * Math.sin(this.$phi))
                    .multiply(this.$mtxS.makeScale(this.$scale, this.$scale, this.$scale))
                    .multiply(this.$mtxR.makeRotationY(this.$jJ * this.$ry * 6.28))
                this.$spiral.setMatrixAt(j, this.$mtxT);
            }
            this.$spiral.instanceMatrix.needsUpdate = true;
        }
    },
}

gsap.timeline({ repeat: 1e10 })
    .to(ctrl, { duration: 5, time: 1, ease: 'power4' })
    .play();