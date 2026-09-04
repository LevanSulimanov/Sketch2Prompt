import {
  Handle,
  Position,
} from "@xyflow/react";

export default function ConnectionHandles() {
  const handleStyle = {
    width: 24,
    height: 24,
    background: "#ffffff",
    border: "3px solid #333",
    zIndex: 50,
    cursor: "crosshair",
  };

  return (
    <>
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={true}
      />
    </>
  );
}
