const colors = [
	"bg-red-700", // A
	"bg-orange-700", // B
	"bg-amber-800", // C
	"bg-yellow-900", // D
	"bg-lime-800", // E
	"bg-green-700", // F
	"bg-emerald-700", // G
	"bg-teal-700", // H
	"bg-cyan-700", // I
	"bg-sky-800", // J
	"bg-blue-900", // K
	"bg-indigo-800", // L
	"bg-violet-800", // M
	"bg-purple-800", // N
	"bg-fuchsia-800", // O
	"bg-pink-700", // P
	"bg-rose-700", // Q
	"bg-gray-800", // R
	"bg-slate-800", // S
	"bg-stone-700", // T
	"bg-neutral-800", // U
	"bg-zinc-800", // V
	"bg-red-900", // W
	"bg-green-900", // X
	"bg-blue-800", // Y
	"bg-rose-900", // Z
];

export default function (nameChar) {
	if (!nameChar || typeof nameChar !== "string") return "bg-black";

	const letter = nameChar.toLowerCase();
	if (letter >= "a" && letter <= "z") {
		const index = letter.charCodeAt(0) - "a".charCodeAt(0);
		return colors[index];
	}

	return "bg-black"; // default for non-letters
}
