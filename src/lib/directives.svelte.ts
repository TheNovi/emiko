export function clickedOutsideOfNode(node: HTMLElement, close: () => any) {
	const event = 'click';
	function c(e: MouseEvent) {
		// console.log(node, e.target);
		if (!node.contains(e.target as Node)) close();
	}
	$effect(() => {
		window.addEventListener(event, c);
		return () => {
			window.removeEventListener(event, c);
		};
	});
}
