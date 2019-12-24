export interface GameFuncs {
	init()
	resume()
	update()
	draw(leftover: number) // 0 <= leftover
	pause()
}
export interface PerfReporter {
	perfOfUpdate(timeSpan: number, count: number): void
	perfOfDraw(timeSpan: number)
}
const dummyPerfReporter: PerfReporter = {
	perfOfDraw: () => { },
	perfOfUpdate: () => { },
}
export class GameLoop {
	perfReporter: PerfReporter = dummyPerfReporter;
	private isStarted = false;
	private aniHandler = 0;
	constructor(
		private funcs: GameFuncs,
		private updatePeriod = 1000 / 60, // ms
		private maxLag = Math.max(50, updatePeriod * 4), // ms
	) {
		funcs.init();
	}
	start() {
		if (this.isStarted) return;
		let lag = 0, prevTime = -1;
		const fn = () => {
			const now = performance.now();
			if (prevTime < 0) { //initial step
				prevTime = now;
			}
			lag += now - prevTime;
			prevTime = now;
			if (lag > this.maxLag) {
				lag = 0;
				console.log("timeout.");
			} else {
				const updateCount = (lag / this.updatePeriod) << 0;
				lag %= this.updatePeriod;

				const beforeUpdates = performance.now();
				for (let i = 0; i < updateCount; i++)
					this.funcs.update();
				if (updateCount > 0)
					this.perfReporter.perfOfUpdate(performance.now() - beforeUpdates, updateCount);

				const beforeDraw = performance.now();
				this.funcs.draw((lag + (performance.now() - now)) / this.updatePeriod);
				this.perfReporter.perfOfDraw(performance.now() - beforeDraw);
			}
			this.aniHandler = requestAnimationFrame(fn);
		};
		this.aniHandler = requestAnimationFrame(fn);
		this.isStarted = true;
		this.funcs.resume();
	}
	pause() {
		if (!this.isStarted) return;
		cancelAnimationFrame(this.aniHandler);
		this.isStarted = false;
		this.funcs.pause();
	}
	isRunning() {
		return this.isStarted;
	}
}
