/**
 * The size of an area
 */
const AREA_SIZE = 300;

/**
 * The radius for nodes to build relations
 */
const RADIUS = 200;

/**
 * A small area of the background
 */
class Area {
    /**
     * The different colors
     */
    dotColor = "#FFE0B2";
    lineColor = "#F1F3F4";

    /**
     * The radius of the dots
     */
    radius = 4;

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
            this.nodes.push([offset_x + Math.random() * AREA_SIZE, offset_y + Math.random() * AREA_SIZE]);
        }
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
                    if (distance < RADIUS && Math.random() < 0.5) this.relations.push([node1, node2]);
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
        // Draw the relations
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 2;
        for (const relation of this.relations) {
            ctx.beginPath();
            ctx.moveTo(relation[0][0], relation[0][1]);
            ctx.lineTo(relation[1][0], relation[1][1]);
            ctx.stroke();
        }

        // Draw the dots
        ctx.fillStyle = this.dotColor;
        for (let point of this.nodes) {
            ctx.beginPath();
            ctx.arc(point[0], point[1], this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

/**
 * The background manager
 */
class Background {
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
        window.addEventListener("resize", this.updateCanvas);
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
        const m = this.canvas.clientWidth / AREA_SIZE;
        const n = this.canvas.clientHeight / AREA_SIZE;
        for (let i = 0; i <= m; i++) {
            if (!this.areas[i]) this.areas[i] = [];
            for (let j = 0; j <= n; j++) {
                if (!this.areas[i][j]) {
                    this.areas[i][j] = new Area(i * AREA_SIZE, j * AREA_SIZE);
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
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        for (const areaRow of this.areas) for (const area of areaRow) area.draw(this.ctx);
        requestAnimationFrame(this.drawBackground);
    };
}

// Wait for the HTML to be initialized and start drawing
window.onload = () => {
    new Background();
};
