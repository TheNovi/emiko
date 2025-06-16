export default class Lorenz {
	x = 0;
	y = 1;
	z = 1.05;
	o = 10;
	p = 28;
	b = 2.667;
	center = [0, 0];
	scale = 1;
	size = 100;
	points: Points;
	//                       o   p   b
	static readonly BASIC = [10, 28, 8 / 3];
	static readonly IDK = [10, 14, 8 / 3];

	constructor(init: { xyz?: number[]; center?: number[]; size?: number; scale?: number; consts?: number[] }) {
		if (init.xyz) [this.x, this.y, this.z] = init.xyz;
		if (init.center) this.center = init.center;
		if (init.scale) this.scale = init.scale;
		if (init.size) this.size = init.size;
		if (init.consts) [this.o, this.p, this.b] = init.consts;

		this.points = new Points(this.size);
	}

	private lorenz(dt: number) {
		let dx = this.o * (this.y - this.x);
		let dy = this.x * (this.p - this.z) - this.y;
		let dz = this.x * this.y - this.b * this.z;
		this.x += dx * dt;
		this.y += dy * dt;
		this.z += dz * dt;
	}

	step(callback: (points: Points) => void, dt = 0.01) {
		this.lorenz(dt);
		this.points.push(this.x * this.scale + this.center[0], this.y * this.scale + this.center[1]);
		callback(this.points);
	}
}
/**
 * I was unable to find "correct" way to do this. But this works (or at least its much better than array's push+shift approach)
 */
export class Points {
	private d: number[][] = [];
	private oi = 0;
	private readonly size: number;

	get length() {
		return this.d.length;
	}

	constructor(size: number) {
		this.size = size;
	}

	push(x: number, y: number) {
		if (this.d.length < this.size) this.d.push([x, y]);
		else {
			this.d[this.oi][0] = x;
			this.d[this.oi][1] = y;
			this.oi = (this.oi + 1) % this.size;
		}
	}

	get(i: number) {
		return this.d[(this.oi + i) % this.size];
	}

	debug() {
		console.log(this.oi, this.length, this.d.toString());
	}
}

//TODO Unit tests
// let p = new Points(3);
// p.push(1, 0);
// p.push(2, 0);
// p.push(3, 0);
// p.push(4, 0);
// p.push(5, 0);
// p.push(6, 0);
// p.push(7, 0);
// p.push(8, 0);
// for (let i = 0; i < p.length; i++) {
// 	console.log(p.get(i));
// }
// p.debug();
