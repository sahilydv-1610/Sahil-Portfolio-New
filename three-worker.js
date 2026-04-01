/* three-worker.js */
let scene, camera, renderer, particles, count, velocities;
let isVisible = true;
let threeAnimId;

self.onmessage = function(e) {
    if (e.data.type === 'init') {
        init(e.data);
    } else if (e.data.type === 'resize') {
        resize(e.data.width, e.data.height, e.data.pixelRatio);
    } else if (e.data.type === 'visibility') {
        isVisible = e.data.isVisible;
        if (isVisible && !threeAnimId) {
            animate();
        }
    }
};

function init({ canvas, width, height, pixelRatio }) {
    // Load Three.js safely inside the worker global context
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.1/three.min.js');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
    // false prevents overriding CSS scale mappings
    renderer.setSize(width, height, false); 
    renderer.setPixelRatio(Math.min(pixelRatio, 1.5));

    count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    velocities = new Float32Array(count);

    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 10;
    for (let i = 0; i < count; i++) velocities[i] = Math.random() * 0.015 + 0.005;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.005,
        color: '#00f0ff',
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    animate();
}

function resize(width, height, pixelRatio) {
    if (!renderer) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

function animate() {
    if (!isVisible) {
        threeAnimId = null;
        return;
    }
    threeAnimId = requestAnimationFrame(animate);

    particles.rotation.z += 0.0003;
    particles.rotation.x += 0.0001;
    particles.rotation.y += 0.00015;

    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
        pos[i * 3 + 2] += velocities[i] * 1.5;
        if (pos[i * 3 + 2] > 2) pos[i * 3 + 2] = -8;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}
