export enum GraphMode {
	Lorenz,
	ThreeBody,
}

export type LorenzConsts = { o: number; p: number; b: number };
export type ThreeBodyConsts = { m: number };

export const LorenzDefaults = {
	BASIC: { o: 10, p: 28, b: 8 / 3 },
	IDK: { o: 10, p: 14, b: 8 / 3 },
};

export class GPoint {
	x = 0;
	y = 0;
	z = 0;
	center = [0, 0];
	scale = 1;
	size = 100;
	points: Points;
	consts: any;

	fun = (self: GPoint, c: any, dt: number) => {
		// self.x += dt;
		// self.y += dt;
		// self.z += dt;
	};

	constructor(init: { xyz?: number[]; center?: number[]; size?: number; scale?: number }, consts: any, fun?: (self: GPoint, consts: any, dt: number) => void) {
		if (init.xyz) [this.x, this.y, this.z] = init.xyz;
		if (init.center) this.center = init.center;
		if (init.scale) this.scale = init.scale;
		if (init.size) this.size = init.size;
		this.consts = consts;
		if (fun) this.fun = fun;

		this.points = new Points(this.size);
	}

	step(callback: (points: Points) => void, dt = 0.01) {
		this.fun(this, this.consts, dt);
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
