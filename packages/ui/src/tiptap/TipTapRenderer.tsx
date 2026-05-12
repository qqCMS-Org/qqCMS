import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { NodeRegistry, TipTapNode } from "./types";

const RegistryContext = createContext<NodeRegistry>({});

export function NodeRenderer({ node }: { node: TipTapNode }) {
	const registry = useContext(RegistryContext);
	const Component = registry[node.type];

	if (!Component) {
		return <span data-unknown-node={node.type} />;
	}

	return <Component node={node} />;
}

export function TipTapRenderer({
	node,
	registry,
}: {
	node: TipTapNode;
	registry: NodeRegistry;
}) {
	return (
		<RegistryContext.Provider value={registry}>
			<NodeRenderer node={node} />
		</RegistryContext.Provider>
	);
}
