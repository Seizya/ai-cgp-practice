import { onLoad, isChrome } from "./util";
import { onClick, ge } from "./dom";
import { Canvas } from "./graphics";
import { GameLoop } from "./framework";

showConsoleBanner();

// Link UI events to functions
onLoad(() => {
	const beginGame = ge("begin_game");
	onClick(beginGame, function fn() {
		beginGame.removeEventListener("click", fn);
		startGame();
	});
});

// Main
function startGame() {
	const img = new Image();
	img.src = "icon.svg";

	const c = new Canvas(ge<HTMLCanvasElement>("game_main_canvas"), ge("game_view"));
	window.addEventListener("resize", () => c.fitSizeAndClear());
	const loop = new GameLoop({
		init: () => 0, resume: () => 0, pause: () => 0,
		update: () => { },
		draw: (leftover) => {
			c.clear("#ded");
			c.rect("#eee", "#222", 100, 100, 100, 100);
			c.texture(c.getTexture(img, 0, 0, 512, 512, 100, 100), 300, 100);
			c.ellipse("#eee", "#222", 500, 100, 100, 50);
			c.ellipse("#eee", "", 700, 100, 150);
			c.rect("", "#222", 700, 100, 100, 50, leftover * Math.PI);
		}
	}, 1000);
	loop.start();
	loop.perfReporter = {
		perfOfDraw: ts => ts < 10 ? 0 : console.log("draw... ", ts.toFixed(1)),
		perfOfUpdate: (ts, cnt) => (ts / cnt) < 10 ? 0 : console.log("update. ", (ts / cnt).toFixed(1)),
	}
	window["l"] = loop;
}

// Banner
function showConsoleBanner() {
	if (isChrome()) {
		console.log(
			"\n" +
			`%c %c AI CGP Practice\n` +
			"%c %c Made by omasakun in 2019\n" +
			"%c %c GitHub: https://github.com/omasakun/ai-cgp-practice\n" +
			"%c %c Author: https://github.com/omasakun\n" +
			"%c %c Enjoy!\n",
			"color: #130f40; background-color: #a799ef; line-height: 2;",
			"color: #ddd6ff; background-color: #524983; line-height: 2;",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"font-weight: bold"
		);
	} else {
		console.log(
			"\n" +
			`┃ ### AI CGP Practice ### \n` +
			"┃ \n" +
			"┃ Made by omasakun in 2019\n" +
			"┃ GitHub: https://github.com/omasakun/ai-cgp-practice\n" +
			"┃ Author: https://github.com/omasakun\n" +
			"┃ Enjoy!\n"
		);
	}
}
