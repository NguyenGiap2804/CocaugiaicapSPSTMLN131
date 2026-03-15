/* ========================================
   CONFIGURATION & DEFAULT VALUES
   ======================================== */
const defaultConfig = {
    brand_name: 'SP sáng tạo',
    tagline: 'Khám phá vũ trụ triết học cùng thầy Hưng đẹp trai',
    primary_color: '#00d4ff',
    secondary_color: '#7c3aed',
    accent_color: '#f472b6',
    background_color: '#0f0c29',
    text_color: '#ffffff'
};

let config = { ...defaultConfig };

/* ========================================
   ELEMENT SDK INITIALIZATION
   ======================================== */
async function initElementSdk() {
    if (window.elementSdk) {
        await window.elementSdk.init({
            defaultConfig,
            onConfigChange: async (newConfig) => {
                config = { ...defaultConfig, ...newConfig };
                updateUI();
            },
            mapToCapabilities: (cfg) => ({
                recolorables: [
                    {
                        get: () => cfg.background_color || defaultConfig.background_color,
                        set: (value) => {
                            cfg.background_color = value;
                            window.elementSdk.setConfig({ background_color: value });
                        }
                    },
                    {
                        get: () => cfg.primary_color || defaultConfig.primary_color,
                        set: (value) => {
                            cfg.primary_color = value;
                            window.elementSdk.setConfig({ primary_color: value });
                        }
                    },
                    {
                        get: () => cfg.secondary_color || defaultConfig.secondary_color,
                        set: (value) => {
                            cfg.secondary_color = value;
                            window.elementSdk.setConfig({ secondary_color: value });
                        }
                    },
                    {
                        get: () => cfg.accent_color || defaultConfig.accent_color,
                        set: (value) => {
                            cfg.accent_color = value;
                            window.elementSdk.setConfig({ accent_color: value });
                        }
                    },
                    {
                        get: () => cfg.text_color || defaultConfig.text_color,
                        set: (value) => {
                            cfg.text_color = value;
                            window.elementSdk.setConfig({ text_color: value });
                        }
                    }
                ],
                borderables: [],
                fontEditable: undefined,
                fontSizeable: undefined
            }),
            mapToEditPanelValues: (cfg) => new Map([
                ['brand_name', cfg.brand_name || defaultConfig.brand_name],
                ['tagline', cfg.tagline || defaultConfig.tagline]
            ])
        });

        if (window.elementSdk.config) {
            config = { ...defaultConfig, ...window.elementSdk.config };
            updateUI();
        }
    }
}

function updateUI() {
    // Update brand name
    const brandNameEl = document.getElementById('brandName');
    const heroTitleEl = document.getElementById('heroTitle');
    if (brandNameEl) brandNameEl.textContent = config.brand_name;
    if (heroTitleEl) heroTitleEl.textContent = config.brand_name;

    // Update tagline
    const heroSubtitleEl = document.getElementById('heroSubtitle');
    if (heroSubtitleEl) heroSubtitleEl.textContent = config.tagline;

    // Update CSS variables for colors
    document.documentElement.style.setProperty('--primary-color', config.primary_color);
    document.documentElement.style.setProperty('--secondary-color', config.secondary_color);
    document.documentElement.style.setProperty('--accent-color', config.accent_color);
    document.documentElement.style.setProperty('--bg-dark', config.background_color);
    document.documentElement.style.setProperty('--text-primary', config.text_color);
}

/* ========================================
   THREE.JS UNIVERSE SETUP
   ======================================== */

// Scene, Camera, Renderer, Composer
let scene, camera, renderer, composer;
let sun, planets = [];
let raycaster, mouse;
let hoveredObject = null;
let isPageActive = false;
let targetCameraPosition = new THREE.Vector3(0, 2, 12);
let currentCameraPosition = new THREE.Vector3(0, 2, 12);

// Planet data configuration
const planetData = [
    {
        name: 'planet1',
        label: 'Cơ cấu xã hội và cơ cấu xã hội - giai cấp',
        textureUrl: 'image/earth.jpg',
        color: 0x00ccff, // Xanh lam sáng
        emissive: 0x003366,
        size: 0.6,
        orbitRadius: 3.5,
        orbitSpeed: 0.5,
        page: 'pageTech'
    },
    {
        name: 'planet2',
        label: 'CƠ CẤU XÃ HỘI – GIAI CẤP Ở VIỆT NAM HIỆN NAY',
        textureUrl: 'image/venus.jpg',
        color: 0x00ff33, // Xanh lục tinh khiết
        emissive: 0x004400,
        size: 0.5,
        orbitRadius: 5,
        orbitSpeed: 0.42,
        page: 'pageSolutions'
    },
    {
        name: 'planet3',
        label: 'TỔNG KẾT VỀ MỐI QUAN HỆ LIÊN MINH',
        textureUrl: 'image/jupiter.jpg',
        color: 0xffcc00, // Vàng sáng tinh khiết
        emissive: 0x664400,
        size: 0.55,
        orbitRadius: 6.5,
        orbitSpeed: 0.33,
        page: 'pageDesign'
    },
    {
        name: 'planet4',
        label: 'Dương Thịnh Âm Suy',
        textureUrl: 'image/mars.jpg',
        color: 0xff3333, // Đỏ tinh khiết
        emissive: 0x660000,
        size: 0.45,
        orbitRadius: 8,
        orbitSpeed: 0.25,
        page: 'pageBrand'
    }
];

function initThreeJS() {
    const canvas = document.getElementById('universe-canvas');

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 12);

    // Renderer với antialiasing
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Post-processing (Bloom)
    if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
        const renderScene = new THREE.RenderPass(scene, camera);
        // Giảm Bloom có tính tối ưu để màu sắc rõ ràng hơn
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.4, 0.85);
        bloomPass.threshold = 0.4;
        bloomPass.strength = 0.25;
        bloomPass.radius = 0.3;

        composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);
    }

    // Raycaster cho click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    setupLighting();

    // Create celestial objects
    createSun();
    createPlanets();
    createStarField3D();

    // Event listeners
    setupEventListeners();

    // Animation loop
    animate();
}

/* ========================================
   LIGHTING SETUP
   ======================================== */
function setupLighting() {
    // Ambient light - Tối ưu để không quá sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Point light từ mặt trời
    const sunLight = new THREE.PointLight(0xffffff, 1.2, 150);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Directional light từ hướng camera chiếu thẳng vào bề mặt hành tinh
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 5, 20);
    scene.add(directionalLight);
}

/* ========================================
   CREATE SUN (CENTRAL PLANET)
   Mặt trời phát sáng với emissive material
   ======================================== */
function createSun() {
    // Sun geometry
    const sunGeometry = new THREE.SphereGeometry(1.5, 64, 64);

    // Sun material với emissive glow
    const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff8800,
        emissiveIntensity: 0.8,
        roughness: 0.4,
        metalness: 0.1
    });

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'mainPlanet'; // ID để phân biệt khi click
    scene.add(sun);

    // Sun glow effect (sprite)
    const glowSprite = createGlowSprite(0xffaa00, 5);
    sun.add(glowSprite);

    // Corona effect
    const coronaGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const coronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcc00,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sun.add(corona);
}

/* ========================================
   CREATE PLANETS (ORBITAL)
   4 hành tinh xoay quanh mặt trời
   ======================================== */
function createPlanets() {
    const textureLoader = new THREE.TextureLoader();

    planetData.forEach((data, index) => {
        // Planet mesh
        const planetGeometry = new THREE.SphereGeometry(data.size, 64, 64);

        const materialOptions = {
            color: data.color,
            emissive: data.emissive || 0x111111,
            emissiveIntensity: data.textureUrl ? 0.0 : 0.1,
            roughness: 0.7,
            metalness: 0.0
        };

        const planetMaterial = new THREE.MeshStandardMaterial(materialOptions);

        if (data.textureUrl) {
            textureLoader.load(data.textureUrl, (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                planetMaterial.map = texture;
                planetMaterial.color.setHex(0xffffff); // Đổi thành trắng để ảnh hiển thị chuẩn nhất
                planetMaterial.emissive.setHex(0x000000); // Tắt sạch Emissive
                planetMaterial.emissiveIntensity = 0;
                planetMaterial.needsUpdate = true;
            });
        }

        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.name = data.name;
        planet.userData = {
            label: data.label,
            orbitRadius: data.orbitRadius,
            orbitSpeed: data.orbitSpeed,
            orbitAngle: (index * Math.PI * 2) / 4, // Phân bố đều
            page: data.page,
            originalScale: data.size
        };

        // Initial position
        planet.position.x = Math.cos(planet.userData.orbitAngle) * data.orbitRadius;
        planet.position.z = Math.sin(planet.userData.orbitAngle) * data.orbitRadius;
        planet.position.y = Math.sin(planet.userData.orbitAngle * 0.5) * 0.5;

        // Add glow (Viền mỏng giống khí quyển thay vì đè lên texture)
        const glow = createGlowSprite(data.color, data.size * 1.6);
        glow.material.opacity = 0.5;
        planet.add(glow);

        scene.add(planet);
        planets.push(planet);

        // Create orbit ring
        createOrbitRing(data.orbitRadius);
    });
}

/* ========================================
   GLOW SPRITE
   Tạo hiệu ứng phát sáng cho hành tinh
   ======================================== */
function createGlowSprite(color, size) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    const colorObj = new THREE.Color(color);
    gradient.addColorStop(0, `rgba(${colorObj.r * 255}, ${colorObj.g * 255}, ${colorObj.b * 255}, 1)`);
    gradient.addColorStop(0.4, `rgba(${colorObj.r * 255}, ${colorObj.g * 255}, ${colorObj.b * 255}, 0.5)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, 1);

    return sprite;
}

/* ========================================
   ORBIT RINGS
   Vòng quỹ đạo của hành tinh
   ======================================== */
function createOrbitRing(radius) {
    const segments = 128;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(segments * 3);

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.15
    });

    const ring = new THREE.LineLoop(geometry, material);
    scene.add(ring);
}

/* ========================================
   3D STAR FIELD
   Sao 3D trong không gian
   ======================================== */
function createStarField3D() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        // Random positions in sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 50 + Math.random() * 100;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Random star colors (white to blue)
        const colorIntensity = 0.5 + Math.random() * 0.5;
        colors[i * 3] = colorIntensity;
        colors[i * 3 + 1] = colorIntensity;
        colors[i * 3 + 2] = colorIntensity + Math.random() * 0.3;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

/* ========================================
   METEOR SHOWER SYSTEM
   Hệ thống sao băng rơi động
   ======================================== */
let meteors = [];
const maxMeteors = 30;

function createMeteor() {
    // Vị trí bắt đầu ngẫu nhiên từ phía trên
    const startX = (Math.random() - 0.5) * 200;
    const startY = 100 + Math.random() * 50;
    const startZ = (Math.random() - 0.5) * 200;
    
    // Hướng rơi xuống với góc
    const velocityX = (Math.random() - 0.5) * 0.5;
    const velocityY = -(1 + Math.random() * 0.5);
    const velocityZ = (Math.random() - 0.5) * 0.5;
    
    // Tạo đường dẫn sao băng bằng LineGeometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
        startX, startY, startZ,
        startX + velocityX * 5, startY + velocityY * 5, startZ + velocityZ * 5
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
        color: 0xffff88,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
    });
    
    const meteor = new THREE.Line(geometry, material);
    meteor.userData = {
        position: {x: startX, y: startY, z: startZ},
        velocity: {x: velocityX, y: velocityY, z: velocityZ},
        life: 1.0,
        maxLife: 1.0
    };
    
    scene.add(meteor);
    meteors.push(meteor);
    
    return meteor;
}

function updateMeteors() {
    // Duy trì số lượng sao băng
    while (meteors.length < maxMeteors) {
        createMeteor();
    }
    
    // Cập nhật từng sao băng
    for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i];
        const data = meteor.userData;
        
        // Cập nhật vị trí
        data.position.x += data.velocity.x;
        data.position.y += data.velocity.y;
        data.position.z += data.velocity.z;
        
        // Giảm thời gian sống
        data.life -= 0.008;
        
        // Cập nhật opacity dựa trên thời gian sống
        meteor.material.opacity = 0.8 * (data.life / data.maxLife);
        
        // Xóa sao băng khi hết thời gian sống
        if (data.life <= 0) {
            scene.remove(meteor);
            meteors.splice(i, 1);
        } else {
            // Cập nhật vị trí của đường dẫn
            const positions = meteor.geometry.attributes.position.array;
            positions[0] = data.position.x;
            positions[1] = data.position.y;
            positions[2] = data.position.z;
            positions[3] = data.position.x + data.velocity.x * 5;
            positions[4] = data.position.y + data.velocity.y * 5;
            positions[5] = data.position.z + data.velocity.z * 5;
            meteor.geometry.attributes.position.needsUpdate = true;
        }
    }
}

/* ========================================
   EVENT LISTENERS
   ======================================== */
function setupEventListeners() {
    // Mouse move for parallax and hover
    window.addEventListener('mousemove', onMouseMove);

    // Click for planet interaction
    window.addEventListener('click', onMouseClick);

    // Resize
    window.addEventListener('resize', onWindowResize);
}

/* ========================================
   RAYCASTER - MOUSE HOVER
   Phát hiện hover trên object 3D
   ======================================== */
function onMouseMove(event) {
    // Update mouse position (-1 to 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update cursor glow
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        cursorGlow.style.left = event.clientX + 'px';
        cursorGlow.style.top = event.clientY + 'px';
    }

    // Camera parallax effect (only when no page is active)
    if (!isPageActive) {
        targetCameraPosition.x = mouse.x * 2;
        targetCameraPosition.y = 2 + mouse.y * 1;
        targetCameraPosition.z = 12;
    }

    // Raycaster check
    raycaster.setFromCamera(mouse, camera);

    // Check sun
    const sunIntersects = raycaster.intersectObject(sun);

    // Check planets
    const planetIntersects = raycaster.intersectObjects(planets);

    const allIntersects = [...sunIntersects, ...planetIntersects];

    if (allIntersects.length > 0) {
        const intersected = allIntersects[0].object;

        if (hoveredObject !== intersected) {
            // Reset previous hover
            if (hoveredObject) {
                resetHoverState(hoveredObject);
            }

            hoveredObject = intersected;
            applyHoverState(hoveredObject);

            // Show tooltip
            showTooltip(intersected, event);
        } else {
            // Update tooltip position
            updateTooltipPosition(event);
        }

        document.body.style.cursor = 'pointer';
    } else {
        if (hoveredObject) {
            resetHoverState(hoveredObject);
            hoveredObject = null;
        }
        hideTooltip();
        document.body.style.cursor = 'default';
    }
}

/* ========================================
   HOVER STATE MANAGEMENT
   Scale up và highlight khi hover
   ======================================== */
function applyHoverState(object) {
    // Scale up animation
    const targetScale = object.name === 'mainPlanet' ? 1.1 : 1.3;
    gsapScale(object, targetScale);

    // Increase emissive for glowing effect when hovered
    if (object.material && object.name !== 'mainPlanet') {
        object.material.emissiveIntensity = 0.3; // Sáng nhè nhẹ lúc hover
        object.material.emissive.setHex(object.userData.hoverColor || 0x333333);
    } else if (object.material) {
        object.material.emissiveIntensity = 2.0;
    }
}

function resetHoverState(object) {
    // Scale back
    const targetScale = object.name === 'mainPlanet' ? 1 : 1;
    gsapScale(object, targetScale);

    // Reset emissive
    if (object.material && object.name !== 'mainPlanet') {
        object.material.emissiveIntensity = 0;
        object.material.emissive.setHex(0x000000);
    } else if (object.material) {
        object.material.emissiveIntensity = 1.5;
    }
}

// Simple scale animation
function gsapScale(object, targetScale) {
    object.userData.targetScale = targetScale;
}

/* ========================================
   TOOLTIP MANAGEMENT
   Floating label hiển thị tên hành tinh
   ======================================== */
function showTooltip(object, event) {
    const tooltip = document.getElementById('planetTooltip');
    const textEl = tooltip.querySelector('.tooltip-text');

    if (object.name === 'mainPlanet') {
        textEl.textContent = 'Video sản phẩm chính';
    } else if (object.userData && object.userData.label) {
        textEl.textContent = object.userData.label;
    }

    tooltip.style.left = event.clientX + 20 + 'px';
    tooltip.style.top = event.clientY - 50 + 'px';
    tooltip.classList.add('visible');
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('planetTooltip');
    tooltip.style.left = event.clientX + 20 + 'px';
    tooltip.style.top = event.clientY - 50 + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('planetTooltip');
    tooltip.classList.remove('visible');
}

/* ========================================
   RAYCASTER - MOUSE CLICK
   Phát hiện click trên object 3D
   
   CÁCH RAYCASTER HOẠT ĐỘNG:
   1. Raycaster tạo một tia từ camera đi qua điểm mouse click
   2. Tia này được chiếu vào scene 3D
   3. intersectObjects() kiểm tra tia cắt qua object nào
   4. Trả về mảng các object bị cắt (sorted by distance)
   5. Ta xử lý object đầu tiên (gần nhất với camera)
   ======================================== */
function onMouseClick(event) {
    // Update mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast ray from camera through mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check sun intersection
    const sunIntersects = raycaster.intersectObject(sun);
    if (sunIntersects.length > 0) {
        // SUN CLICKED - Mở video modal
        openVideoModal();
        return;
    }

    // Check planet intersections
    const planetIntersects = raycaster.intersectObjects(planets);
    if (planetIntersects.length > 0) {
        const clickedPlanet = planetIntersects[0].object;

        // PLANET CLICKED - Chuyển trang
        if (clickedPlanet.userData && clickedPlanet.userData.page) {
            // GSAP Cinematic Camera Zoom
            if (typeof gsap !== 'undefined') {
                // Caculate offset to not be exactly inside the planet
                const offset = clickedPlanet.position.clone().normalize().multiplyScalar(4);
                gsap.to(targetCameraPosition, {
                    x: clickedPlanet.position.x + offset.x,
                    y: clickedPlanet.position.y + 1,
                    z: clickedPlanet.position.z + offset.z,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            }
            openPage(clickedPlanet.userData.page);
        }
    }
}

/* ========================================
   VIDEO MODAL
   Mở modal video khi click mặt trời
   ======================================== */
function openVideoModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.add('active');

    // Auto play video
    const video = document.getElementById('mainVideo');
    if (video) {
        video.play().catch(() => {
            // Autoplay blocked
        });
    }
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');

    document.querySelectorAll("video").forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
}
/* ========================================
   PAGE NAVIGATION
   Chuyển đổi giữa các trang nội dung
   ======================================== */
function openPage(pageId) {
    if (!pageId) return;
    isPageActive = true;
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');

        // Animate cards (cho content-card)
        setTimeout(() => {
            const cards = page.querySelectorAll('.content-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 150);
            });
        }, 500);
    }
}

function closePage() {
    const activePage = document.querySelector('.page-section.active');
    if (activePage) {
        // Reset cards
        const cards = activePage.querySelectorAll('.content-card');
        cards.forEach(card => card.classList.remove('visible'));

        activePage.classList.remove('active');
    }

    isPageActive = false;
    // Cinematic Zoom Out
    if (typeof gsap !== 'undefined') {
        gsap.to(targetCameraPosition, {
            x: 0,
            y: 2,
            z: 12,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }
}

/* ========================================
   WINDOW RESIZE
   ======================================== */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
}

/* ========================================
   ANIMATION LOOP
   Vòng lặp animation chính
   
   ANIMATION HỆ MẶT TRỜI:
   1. Mặt trời xoay tại chỗ (rotation.y)
   2. Mỗi hành tinh có orbitAngle tăng dần
   3. Vị trí hành tinh = cos/sin(angle) * radius
   4. Tạo chuyển động orbit mượt mà
   ======================================== */
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate sun rotation
    if (sun) {
        sun.rotation.y += 0.005;
    }

    // Animate planets orbiting
    planets.forEach(planet => {
        // Update orbit angle
        planet.userData.orbitAngle += planet.userData.orbitSpeed * 0.01;

        // Calculate new position
        const radius = planet.userData.orbitRadius;
        const angle = planet.userData.orbitAngle;

        planet.position.x = Math.cos(angle) * radius;
        planet.position.z = Math.sin(angle) * radius;
        planet.position.y = Math.sin(angle * 2) * 0.3; // Slight vertical wobble

        // Self rotation
        planet.rotation.y += 0.02;

        // Scale animation (hover effect)
        if (planet.userData.targetScale) {
            const currentScale = planet.scale.x;
            const diff = planet.userData.targetScale - currentScale;
            planet.scale.setScalar(currentScale + diff * 0.1);
        }
    });

    // Smooth camera movement (parallax or cinematic)
    currentCameraPosition.lerp(targetCameraPosition, 0.04);
    camera.position.x = currentCameraPosition.x;
    camera.position.y = currentCameraPosition.y;
    camera.position.z = currentCameraPosition.z;
    camera.lookAt(0, 0, 0);

    // Update meteor shower
    updateMeteors();

    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

/* ========================================
   STAR FIELD 2D (CSS)
   Tạo sao nhỏ cho background
   ======================================== */
function createStars2D() {
    const starsLayer = document.getElementById('starsLayer');
    const starCount = 400;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = Math.random() * 2.5 + 0.5;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 4 + 2;
        const opacity = Math.random() * 0.7 + 0.2;
        const delay = Math.random() * 3;

        star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                background: hsl(${Math.random() * 60 + 200}, 100%, 70%);
                box-shadow: 0 0 ${size * 2}px hsl(${Math.random() * 60 + 200}, 100%, 60%);
                --duration: ${duration}s;
                --opacity: ${opacity};
                animation: twinkle ${duration}s ease-in-out ${delay}s infinite;
            `;

        starsLayer.appendChild(star);
    }
}

/* ========================================
   LOADING SCREEN
   ======================================== */
function hideLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
    }, 2500);
}

/* ========================================
   NAVIGATION MENU
   ======================================== */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageMap = {
        'tech': 'pageTech',
        'solutions': 'pageSolutions',
        'design': 'pageDesign',
        'brand': 'pageBrand'
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageKey = item.dataset.page;
            if (pageMap[pageKey]) {
                openPage(pageMap[pageKey]);
            }
        });
    });

    // Planet indicators
    const planetDots = document.querySelectorAll('.planet-dot');
    planetDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const planetName = dot.dataset.planet;
            if (planetName === 'sun') {
                openVideoModal();
            } else {
                const planet = planets.find(p => p.name === planetName);
                if (planet && planet.userData.page) {
                    openPage(planet.userData.page);
                    // Animate portfolio cards
                    setTimeout(() => {
                        const cards = document.querySelectorAll('.portfolio-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                            }, index * 150);
                        });
                    }, 500);
                }
            }
        });
    });

    // Video modal close
    document.getElementById('modalClose').addEventListener('click', closeVideoModal);
    document.getElementById('videoModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeVideoModal();
        }
    });

    // Explore CTA
    document.getElementById('exploreCta').addEventListener('click', () => {
        openVideoModal();
    });
}

/* ========================================
   INITIALIZE APPLICATION
   ======================================== */
async function init() {
    await initElementSdk();
    createStars2D();
    initThreeJS();
    setupNavigation();
    hideLoadingScreen();
}

// Start application
init();
