/**
 * The size of an area
 */
const AREA_SIZE = 300;

/**
 * The radius for nodes to build relations
 */
const RELATION_RADIUS = 200;

/**
 * The radius of the dots
 */
const NODE_RADIUS = 4;

/**
 * The delta time between the animation frames
 */
let deltaTime = 0;
let lastTime = Date.now();

/**
 * A small area of the background
 */
class Area {
    /**
     * The parameters for the one animated node
     */
    x = 0;
    y = 0;
    radius = 0;
    speed = 0;
    progress = 0;

    /**
     * The nodes in the given area
     */
    nodes = [];

    /**
     * The relations in the given area
     */
    relations = [];

    /**
     * Constructor
     */
    constructor(offset_x = 0, offset_y = 0) {
        // Create the nodes
        for (let i = 0; i < 5; i++) {
            this.nodes.push([Math.floor(offset_x + Math.random() * AREA_SIZE),
                             Math.floor(offset_y + Math.random() * AREA_SIZE)]);
        }

        // Save the information for the animated circle
        this.x = this.nodes[0][0];
        this.y = this.nodes[0][1];
        this.radius = Math.random() * 40 + 15;
        this.speed = Math.random() * 1e-3;

        // Set the related nodes
        this.setRelatedNodes(this.nodes);
    }

    /**
     * Set the related nodes for a given set of nodes
     *
     * @param nodes The other nodes
     */
    setRelatedNodes(nodes) {
        for (const node1 of this.nodes) {
            for (const node2 of nodes) {
                if (node1 !== node2) {
                    const distance = Math.sqrt(Math.pow(node1[0] - node2[0], 2) + Math.pow(node1[1] - node2[1], 2));
                    if (distance < RELATION_RADIUS && Math.random() < 0.5) this.relations.push([node1, node2]);
                }
            }
        }
    }

    /**
     * Draw the area
     *
     * @param ctx The canvas context
     */
    draw(ctx) {
        // Animate the first node
        this.progress += deltaTime * this.speed;
        this.nodes[0][0] = this.x + this.radius * Math.sin(this.progress);
        this.nodes[0][1] = this.y + this.radius * Math.cos(this.progress);

        // Draw the relations
        for (const relation of this.relations) {
            ctx.beginPath();
            ctx.moveTo(relation[0][0], relation[0][1]);
            ctx.lineTo(relation[1][0], relation[1][1]);
            ctx.stroke();
        }

        // Draw the dots
        for (let point of this.nodes) {
            ctx.beginPath();
            ctx.arc(point[0], point[1], NODE_RADIUS, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

/**
 * The background manager
 */
class Background {
    /**
     * The recent fps counts
     */
    fpsCounts = [];

    /**
     * The different colors
     */
    dotColor = "#FFE0B2";
    lineColor = "#F1F3F4";

    /**
     * The fps count
     */
    fps = document.getElementById("fps");

    /**
     * The canvas
     */
    canvas = document.getElementById("background");

    /**
     * The canvas context
     */
    ctx = this.canvas.getContext("2d");

    /**
     * The drawn areas
     */
    areas = [];

    /**
     * The class responsible for the background
     */
    constructor() {
        // Watch for size changes
        const resizeObserver = new ResizeObserver(this.updateCanvas);
        resizeObserver.observe(this.canvas);
        this.updateCanvas();
        this.drawBackground();
    }

    /**
     * Update the canvas
     */
    updateCanvas = () => {
        // Update context size
        this.ctx.canvas.width = this.canvas.clientWidth;
        this.ctx.canvas.height = this.canvas.clientHeight;

        // Create new areas on demand
        const m = this.canvas.clientHeight / AREA_SIZE;
        const n = this.canvas.clientWidth / AREA_SIZE;
        for (let i = 0; i <= m; i++) {
            if (!this.areas[i]) this.areas[i] = [];
            for (let j = 0; j <= n; j++) {
                if (!this.areas[i][j]) {
                    this.areas[i][j] = new Area(j * AREA_SIZE, i * AREA_SIZE);
                    if (this.areas[i - 1] && this.areas[i - 1][j]) this.areas[i - 1][j].setRelatedNodes(this.areas[i][j].nodes);
                    if (this.areas[i][j - 1]) this.areas[i][j - 1].setRelatedNodes(this.areas[i][j].nodes);
                }
            }
        }
    };

    /**
     * Draw the graph background
     */
    drawBackground = () => {
        // Calculate the time difference
        const now = Date.now();
        deltaTime = now - lastTime;
        lastTime = now;

        // Update the fps count
        this.fpsCounts.push(1000 / deltaTime);
        if (this.fpsCounts.length > 60) this.fpsCounts.splice(0, 1);
        this.fps.innerHTML = `FPS: ${Math.floor(this.fpsCounts.reduce((acc, v) => acc + v) / this.fpsCounts.length)}`;

        // Set the colors
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.dotColor;

        // Clear the canvas
        const top = -this.canvas.getBoundingClientRect().top - AREA_SIZE;
        const height = window.innerHeight + AREA_SIZE;
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        // Redraw the visible areas only
        const start = Math.floor(Math.max(0, top / AREA_SIZE));
        const end = Math.floor(Math.min(this.areas.length - 1, (top + height) / AREA_SIZE));
        for (let i = start; i <= end; i++) {
            if (this.areas[i]) for (const area of this.areas[i]) area.draw(this.ctx);
        }

        // Keep the animation going
        window.requestAnimationFrame(this.drawBackground);
    };
}

// Wait for the HTML to be initialized and start drawing
window.onload = () => {
    new Background();
};
