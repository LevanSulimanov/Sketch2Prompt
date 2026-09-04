import { useState } from "react";
import {
  NodeResizer,
  type NodeProps,
} from "@xyflow/react";

import { useDiagramStore } from "../store/diagramStore";
import type {
  DiagramNode,
  SubmoduleData,
} from "../types/diagram";

import ConnectionHandles from "./ConnectionHandles";


export default function SubmoduleNode({
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

  const submoduleData = data as SubmoduleData;

  const sections = [
    {
      name: "INPUT",
      key: "inp" as const,
      value: submoduleData.inp,
    },
    {
      name: "DESCRIPTION",
      key: "desc" as const,
      value: submoduleData.desc,
    },
    {
      name: "RETURN",
      key: "ret" as const,
      value: submoduleData.ret,
    },
    {
      name: "EXCEPTION",
      key: "exc" as const,
      value: submoduleData.exc,
    },
  ];

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={260}
        minHeight={220}
      />

      <ConnectionHandles />

      <div
        style={{
          width: "100%",
          height: "100%",
          borderWidth: 2,
          borderColor:
            submoduleData.borderColor,
          borderStyle:
            submoduleData.borderStyle,
          borderRadius: 6,
          background:
            submoduleData.backgroundColor,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* TITLE */}

        <div
          onDoubleClick={() => setEditingTitle(true)}
          style={{
            height: 40,
            flexShrink: 0,
            borderBottom: "1px solid #aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            background: "rgba(0, 0, 0, 0.05)",
          }}
        >
          {editingTitle ? (
            <input
              autoFocus
              value={submoduleData.title}
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
                width: "85%",
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
          ) : (
            submoduleData.title
          )}
        </div>

        {/* FOUR SECTIONS */}

        <div
          style={{
            flex: 1,
            overflow: "auto",
          }}
        >
          {sections.map((section) => (
            <div
              key={section.name}
              style={{
                minHeight: 55,
                borderBottom: "1px solid #aaa",
                padding: 6,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#666",
                  marginBottom: 3,
                }}
              >
                {section.name}
              </div>

              <textarea
                value={section.value}
                onChange={(e) =>
                  updateNodeData(id, {
                    [section.key]: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  minHeight: 30,
                  resize: "vertical",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
          ))}
        </div>

        {/* DELETE */}

        {selected && (
          <button
            onClick={() => deleteNode(id)}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              zIndex: 10,
              border: "none",
              borderRadius: 4,
              background: "#d33",
              color: "white",
              padding: "3px 7px",
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
