export class ShootingStar {
  private x: number;
  private y: number;
  private length: number;
  private speed: number;
  private opacity: number;
  private angle: number;
  private lifetime: number;
  private age: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    // Start from upper-right area
    this.x = Math.random() * canvasWidth * 0.7 + canvasWidth * 0.3;
    this.y = Math.random() * canvasHeight * 0.4;
    this.length = 80 + Math.random() * 80;
    this.speed = 6 + Math.random() * 4;
    this.opacity = 1;
    this.angle = (140 + Math.random() * 20) * (Math.PI / 180);
    this.lifetime = 60 + Math.random() * 30; // frames
    this.age = 0;
  }

  update(): void {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.age++;
    this.opacity = Math.max(0, 1 - this.age / this.lifetime);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const tailX = this.x - Math.cos(this.angle) * this.length;
    const tailY = this.y - Math.sin(this.angle) * this.length;

    const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
    gradient.addColorStop(0.5, `rgba(180, 220, 255, ${this.opacity * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  isDead(): boolean {
    return this.age >= this.lifetime;
  }
}
