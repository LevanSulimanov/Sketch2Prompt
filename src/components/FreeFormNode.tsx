import { useState } from "react";

import {
  NodeResizer,
  type NodeProps,
} from "@xyflow/react";

import { useDiagramStore } from "../store/diagramStore";

import type {
  DiagramNode,
  FreeFormData,
} from "../types/diagram";

import ConnectionHandles from "./ConnectionHandles";


export default function FreeFormNode({
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

  const addFreeFormSection =
    useDiagramStore(
      (state) =>
        state.addFreeFormSection
    );

  const updateFreeFormSection =
    useDiagramStore(
      (state) =>
        state.updateFreeFormSection
    );

  const deleteFreeFormSection =
    useDiagramStore(
      (state) =>
        state.deleteFreeFormSection
    );

  const [editingTitle, setEditingTitle] =
    useState(false);

  const freeFormData =
    data as FreeFormData;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={260}
        minHeight={180}
      />

      <ConnectionHandles />

      <div
        style={{
          width: "100%",
          height: "100%",

          borderWidth: 2,
          borderColor:
            freeFormData.borderColor,
          borderStyle:
            freeFormData.borderStyle,

          borderRadius: 6,

          background:
            freeFormData.backgroundColor,

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",

          boxSizing: "border-box",
        }}
      >
        {/* TITLE */}

        <div
          onDoubleClick={() =>
            setEditingTitle(true)
          }
          style={{
            height: 42,
            flexShrink: 0,

            borderBottom:
              "1px solid #aaa",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            paddingLeft: 40,
            paddingRight: 40,

            fontWeight: "bold",

            background:
              "rgba(0, 0, 0, 0.05)",
          }}
        >
          {editingTitle ? (
            <input
              autoFocus

              value={
                freeFormData.title
              }

              onChange={(e) =>
                updateNodeData(id, {
                  title:
                    e.target.value,
                })
              }

              onBlur={() =>
                setEditingTitle(false)
              }

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                }
              }}

              style={{
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
          ) : (
            freeFormData.title
          )}
        </div>

        {/* SECTIONS */}

        <div
          style={{
            flex: 1,

            overflow: "auto",

            minHeight: 0,
          }}
        >
          {freeFormData.sections.map(
            (section) => (
              <div
                key={section.id}

                style={{
                  borderBottom:
                    "1px solid #aaa",

                  padding: 7,

                  boxSizing:
                    "border-box",
                }}
              >
                {/* SECTION HEADER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 5,
                  }}
                >
                  <input
                    value={
                      section.title
                    }

                    onChange={(e) =>
                      updateFreeFormSection(
                        id,
                        section.id,
                        {
                          title:
                            e.target
                              .value,
                        }
                      )
                    }

                    style={{
                      flex: 1,

                      minWidth: 0,

                      fontSize: 11,
                      fontWeight: "bold",

                      border:
                        "1px solid #ddd",

                      boxSizing:
                        "border-box",
                    }}
                  />

                  <button
                    className="nodrag"

                    onClick={() =>
                      deleteFreeFormSection(
                        id,
                        section.id
                      )
                    }

                    title="Delete section"

                    style={{
                      border:
                        "1px solid #bbb",

                      background:
                        "#f7f7f7",

                      borderRadius: 3,

                      cursor: "pointer",

                      fontSize: 11,

                      padding:
                        "2px 6px",
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* SECTION CONTENT */}

                <textarea
                  className="nodrag"

                  value={
                    section.content
                  }

                  onChange={(e) =>
                    updateFreeFormSection(
                      id,
                      section.id,
                      {
                        content:
                          e.target.value,
                      }
                    )
                  }

                  placeholder="Section content..."

                  style={{
                    width: "100%",
                    minHeight: 55,

                    resize: "vertical",

                    border:
                      "1px solid #ddd",

                    boxSizing:
                      "border-box",

                    fontFamily:
                      "inherit",
                  }}
                />
              </div>
            )
          )}

          {freeFormData.sections.length ===
            0 && (
            <div
              style={{
                padding: 15,

                textAlign: "center",

                fontSize: 12,
                color: "#999",
              }}
            >
              No sections
            </div>
          )}
        </div>

        {/* ADD SECTION */}

        <button
          className="nodrag"

          onClick={() =>
            addFreeFormSection(id)
          }

          style={{
            flexShrink: 0,

            height: 32,

            border: "none",
            borderTop:
              "1px solid #aaa",

            background:
              "rgba(0, 0, 0, 0.04)",

            cursor: "pointer",

            fontWeight: "bold",
          }}
        >
          + ADD SECTION
        </button>

        {/* DELETE BOX */}

        {selected && (
          <button
            className="nodrag"

            onClick={() =>
              deleteNode(id)
            }

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
