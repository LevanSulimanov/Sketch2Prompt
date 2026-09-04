import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  NodeChange,
  applyNodeChanges,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import ModuleNode from "./ModuleNode";
import { useDiagramStore } from "../store/diagramStore";

const nodeTypes = {
  module: ModuleNode,
};

export default function DiagramCanvas() {
  const boxes = useDiagramStore((state) => state.boxes);
  const updateBox = useDiagramStore((state) => state.updateBox);
  const selectBox = useDiagramStore((state) => state.selectBox);

  const nodes: Node[] = boxes.map((box) => ({
    id: box.id,
    type: box.type,
    position: {
      x: box.x,
      y: box.y,
    },
    style: {
      width: box.width,
      height: box.height,
    },
    data: {
      box,
    },
    draggable: true,
    selectable: true,
    resizable: true,
  }));

  const handleNodesChange = (changes: NodeChange[]) => {
    for (const change of changes) {
      if (change.type === "position" && change.position) {
        updateBox(change.id, {
          x: change.position.x,
          y: change.position.y,
        });
      }
    }
  };

  return (
    <div className="diagram-canvas">
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onNodeClick={(_, node) => selectBox(node.id)}
        onPaneClick={() => selectBox(null)}
        fitView
      >
        <Background gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
