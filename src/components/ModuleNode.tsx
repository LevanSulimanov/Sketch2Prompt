import { useState } from "react";
import {
  NodeResizer,
  type NodeProps,
} from "@xyflow/react";

import { useDiagramStore } from "../store/diagramStore";
import type { DiagramNode, ModuleData } from "../types/diagram";
import ConnectionHandles from "./ConnectionHandles";

export default function ModuleNode({
  id,
  data,
  selected,
}: NodeProps<DiagramNode>) {
  const updateNodeData = useDiagramStore(
    (state) => state.updateNodeData
  );

  const deleteNode = useDiagramStore(
    (state) => state.deleteNode
  );

  const [editingTitle, setEditingTitle] = useState(false);

  const moduleData = data as ModuleData;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={220}
      />

      <ConnectionHandles />

      <div
        style={{
          width: "100%",
          height: "100%",
          borderWidth: 2,
          borderColor: moduleData.borderColor,
          borderStyle: moduleData.borderStyle,
          borderRadius: 8,
          background: moduleData.backgroundColor,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            height: 50,
            flexShrink: 0,
            borderBottom: "1px solid #999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 18,
            background: "rgba(0, 0, 0, 0.04)",
            cursor: "default",
          }}
          onDoubleClick={() => setEditingTitle(true)}
        >
          {editingTitle ? (
            <input
              autoFocus
              value={moduleData.title}
              onChange={(e) =>
                updateNodeData(id, {
                  title: e.target.value,
                })
              }
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                }
              }}
              style={{
                width: "80%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 18,
              }}
            />
          ) : (
            moduleData.title
          )}
        </div>

        {/* DESCRIPTION */}

        <div
          style={{
            height: 80,
            flexShrink: 0,
            borderBottom: "1px solid #999",
            padding: 8,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              color: "#666",
              marginBottom: 4,
            }}
          >
            DESCRIPTION
          </div>

          <textarea
            value={moduleData.description}
            onChange={(e) =>
              updateNodeData(id, {
                description: e.target.value,
              })
            }
            placeholder="Module description..."
            style={{
              width: "100%",
              height: 45,
              resize: "none",
              border: "1px solid #ddd",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* CONTENT */}

        <div
          style={{
            flex: 1,
            position: "relative",
            padding: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              color: "#aaa",
              pointerEvents: "none",
            }}
          >
            CONTENT
          </div>
        </div>

        {/* DELETE */}

        {selected && (
          <button
            onClick={() => deleteNode(id)}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              zIndex: 10,
              border: "none",
              borderRadius: 4,
              background: "#d33",
              color: "white",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        )}
      </div>
    </>
  );
}
