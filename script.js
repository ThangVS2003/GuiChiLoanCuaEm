const canvas = document.getElementById('universe-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let particles = [];
const numParticles = 1000;
let isFormingText = false; // Trạng thái: có đang xếp thành chữ không?

// Lấy tham chiếu các DOM Elements
const introText = document.getElementById('intro-text');
const fallingGallery = document.getElementById('falling-gallery');
const fallingImages = document.querySelectorAll('.falling-img');
const greetingBox = document.getElementById('greeting-box');

// 1. Tạo Class Hạt (Particle)
class Particle {
    constructor() {
        // Vị trí hiện tại ngẫu nhiên trên toàn màn hình
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Vị trí đích đến (lúc đầu chưa có, bằng vị trí hiện tại)
        this.destX = this.x;
        this.destY = this.y;
        
        // Vận tốc lơ lửng ngẫu nhiên
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        
        // Bán kính và màu đỏ ngẫu nhiên (sắc thái từ đỏ đến hồng)
        this.radius = Math.random() * 2 + 1;
        this.color = `hsl(${Math.random() * 20 + 340}, 100%, 60%)`;
    }

    update() {
        if (!isFormingText) {
            // Trạng thái lơ lửng vũ trụ
            this.x += this.vx;
            this.y += this.vy;
            // Dội lại khi đụng tường
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        } else {
            // Trạng thái hội tụ (Lerp - Linear Interpolation)
            // Hạt di chuyển một phần quãng đường về đích mỗi khung hình
            let dx = this.destX - this.x;
            let dy = this.destY - this.y;
            this.x += dx * 0.05; // 0.05 là tốc độ hội tụ (có thể chỉnh)
            this.y += dy * 0.05;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        // Thêm hiệu ứng phát sáng nhẹ
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
    }
}

// 2. Hàm đọc tọa độ của chữ "8/3"
function getTextCoordinates() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Vẽ chữ 8/3 to ở giữa
    tempCtx.fillStyle = "white";
    // Kích thước chữ điều chỉnh theo màn hình
    const fontSize = width < 600 ? 150 : 300; 
    tempCtx.font = `bold ${fontSize}px Montserrat, sans-serif`;
    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";
    tempCtx.fillText("8/3", width / 2, height / 2);

    // Quét điểm ảnh (pixel)
    const imgData = tempCtx.getImageData(0, 0, width, height).data;
    const coordinates = [];
    
    // Quét cách đều (step) để không lấy quá nhiều điểm
    const step = 8; 
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const alpha = imgData[(y * width + x) * 4 + 3];
            if (alpha > 128) { // Nếu pixel có màu (không trong suốt)
                coordinates.push({ x: x, y: y });
            }
        }
    }
    return coordinates;
}

// 3. Khởi tạo vũ trụ
function init() {
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
    animate();
}

// 4. Vòng lặp animation
function animate() {
    ctx.clearRect(0, 0, width, height); // Xóa khung hình cũ
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animate); // Gọi lại liên tục
}

init();

// 5. Xử lý sự kiện Click
introText.addEventListener('click', () => {
    // Ẩn chữ mở đầu
    introText.classList.remove('active');
    introText.classList.add('hidden');

    // Lấy tọa độ chữ và gán đích đến cho các hạt
    const textCoords = getTextCoordinates();
    
    // Trộn ngẫu nhiên các hạt để chúng bay không theo quy luật
    particles.forEach(p => {
        // Lấy một điểm đích ngẫu nhiên từ danh sách tọa độ chữ
        const randomCoord = textCoords[Math.floor(Math.random() * textCoords.length)];
        if (randomCoord) {
            p.destX = randomCoord.x;
            p.destY = randomCoord.y;
        }
    });

    // Kích hoạt trạng thái bay vào hình chữ
    isFormingText = true;

    // Chờ 3 giây để hạt bay xong, sau đó thả ảnh rơi và hiện hộp quà
    setTimeout(() => {
        // Xóa Canvas đi (tùy chọn, ở đây làm mờ đi để nhường chỗ cho UI)
        canvas.style.transition = "opacity 2s ease";
        canvas.style.opacity = "0.2";

        // Thả ảnh rơi
        fallingGallery.classList.remove('hidden');
        fallingImages.forEach(img => img.classList.add('fall'));

        // Hiện khung lời chúc
        greetingBox.classList.add('show');
    }, 3000); // 3000ms = 3 giây
});

// Xử lý khi resize màn hình
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});