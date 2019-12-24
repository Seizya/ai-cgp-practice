import { opt } from "./util";

export type TextureSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;
export interface TextureI {
	readonly ready: boolean
}
export interface CanvasI<T extends TextureI, C> { // T: Texture, C: Color
	fitSizeAndClear(): void
	clear(color?: C): void
	getTexture(image: TextureSource, x?: number, y?: number, srcW?: number, srcH?: number, dstW?: number, dstH?: number): T
	texture(texture: T, x: number, y: number, rot?: number): void
	ellipse(fill: C, stroke: C, x: number, y: number, rx: number, ry?: number): void
	rect(fill: C, stroke: C, x: number, y: number, w: number, h?: number, rot?: number): void
	flush(): void
}
export interface Texture extends TextureI {
	image: TextureSource
	srcX: number
	srcY: number
	srcW: number
	srcH: number
	dstW: number
	dstH: number
}
export class Canvas implements CanvasI<Texture, string> {
	private ctx: CanvasRenderingContext2D;
	private ctxH: number;
	private ctxW: number;
	constructor(
		private canvas: HTMLCanvasElement,
		private parent: HTMLElement,
		shouldFitSize = true,
	) {
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) throw `Failed: canvas.getContext("2d")`;
		this.ctx = ctx;
		this.ctxH = 0;
		this.ctxW = 0;
		if (shouldFitSize) this.fitSizeAndClear();
	}
	fitSizeAndClear(color?: string): void {
		const c = this.canvas, p = this.parent;
		const dpr = window.devicePixelRatio || 1;
		c.style.width = p.clientWidth + "px";
		c.style.height = p.clientHeight + "px";
		this.ctxW = c.width = p.clientWidth * dpr;
		this.ctxH = c.height = p.clientHeight * dpr;
		this.ctx.lineWidth = dpr;
		this.clear(color);
	}
	clear(color?: string): void {
		const c = this.ctx;
		if (color) {
			c.closePath();
			c.fillStyle = color;
			c.fillRect(0, 0, this.ctxW, this.ctxH);
		} else {
			c.clearRect(0, 0, this.ctxW, this.ctxH);
		}
	}
	getTexture(image: TextureSource, x?: number, y?: number, srcW?: number, srcH?: number, dstW?: number, dstH?: number): Texture {
		x = opt(0, x);
		y = opt(0, y);
		srcW = opt(image.width, srcW);
		srcH = opt(image.height, srcH);
		dstW = opt(srcW, dstW);
		dstH = opt(srcH, dstH);
		return {
			image: image,
			ready: true,
			srcX: x, srcY: y,
			srcH, srcW, dstW, dstH
		};
	}
	texture(texture: Texture, cx: number, cy: number, rot?: number): void {
		const c = this.ctx;
		const t = texture;
		if (rot) {
			const f = c.getTransform(), w = t.dstW, h = t.dstH;
			c.translate(cx, cy);
			c.rotate(rot);
			c.drawImage(t.image, t.srcX, t.srcY, t.srcW, t.srcH, -w / 2, -h / 2, t.dstW, t.dstH);
			c.setTransform(f);
		} else {
			c.drawImage(t.image, t.srcX, t.srcY, t.srcW, t.srcH, cx - t.dstW / 2, cy - t.dstH / 2, t.dstW, t.dstH);
		}
	}
	ellipse(fill: string, stroke: string, cx: number, cy: number, w: number, h?: number, rot?: number): void {
		const c = this.ctx;
		c.fillStyle = fill;
		c.strokeStyle = stroke;
		c.beginPath();
		if (rot) {
			const f = c.getTransform();
			c.translate(cx, cy);
			c.rotate(rot);
			c.ellipse(0, 0, w / 2, opt(w, h) / 2, 0, 0, Math.PI * 2);
			c.setTransform(f);
		} else {
			c.ellipse(cx, cy, w / 2, opt(w, h) / 2, 0, 0, Math.PI * 2);
		}
		c.closePath();
		if (fill.length) c.fill();
		if (stroke.length) c.stroke();
	}
	rect(fill: string, stroke: string, cx: number, cy: number, w: number, h?: number, rot?: number): void {
		h = opt(w, h);
		const c = this.ctx;
		c.fillStyle = fill;
		c.strokeStyle = stroke;
		c.beginPath();
		if (rot) {
			const t = c.getTransform();
			c.translate(cx, cy);
			c.rotate(rot);
			c.rect(-w / 2, -h / 2, w, h);
			c.setTransform(t);
		} else {
			c.rect(cx - w / 2, cy - h / 2, w, h);
		}
		c.closePath();
		if (fill.length) c.fill();
		if (stroke.length) c.stroke();
	}
	flush(): void {
		// すべてのコマンドは、実行されるとともにキャンバスに反映されるため、do nothing.
	}
}
