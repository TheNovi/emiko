export enum GraphMode {
	Lorenz,
	LorenzButterFly,
}

export type LorenzConsts = { o: number; p: number; b: number };

export const LorenzDefaults = {
	BASIC: { o: 10, p: 28, b: 8 / 3 },
};

export class GPoint {
	x = 0;
	y = 0;
	z = 0;
	points: Points;
	consts: any;
	config = {
		center: [0, 0],
		offsetCenter: [0, 0],
		scale: 1,
		size: 100,
		rotateDeg: 0,
		fun: (self: GPoint, c: any, dt: number) => {},
	};

	constructor(xyz: number[], config: GPoint["config"], consts?: any) {
		[this.x, this.y, this.z] = xyz;
		this.config = config;
		this.consts = consts;

		this.points = new Points(this.size);
	}

	step(callback: (points: Points) => void, dt = 0.01) {
		this.fun(this, this.consts, dt);
		const x = this.rotateDeg ? this.x * Math.cos(this.rotateDeg) - this.y * Math.sin(this.rotateDeg) : this.x;
		const y = this.rotateDeg ? this.x * Math.sin(this.rotateDeg) + this.y * Math.cos(this.rotateDeg) : this.y;
		this.points.push(x * this.scale + this.center(0), y * this.scale + this.center(1));
		callback(this.points);
	}

	center(id: number) {
		return this.config.center[id] + this.config.offsetCenter[id];
	}
	get scale() {
		return this.config.scale;
	}
	get size() {
		return this.config.size;
	}
	get rotateDeg() {
		return this.config.rotateDeg;
	}
	get fun() {
		return this.config.fun;
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
