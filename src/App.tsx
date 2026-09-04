import { 
  useCallback,
  useRef,
  useState,
} from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ConnectionMode,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import ModuleNode from "./components/ModuleNode";
import SubmoduleNode from "./components/SubmoduleNode";
import FreeFormNode from "./components/FreeFormNode";

import { useDiagramStore } from "./store/diagramStore";

import type {
  ConnectionStyle,
} from "./types/diagram";

type EdgeLineStyle =
  | "solid"
  | "dashed"
  | "dotted";

const nodeTypes = {
  module: ModuleNode,
  submodule: SubmoduleNode,
  freeform: FreeFormNode,
};

function App() {
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);

  const selectedNodeId = useDiagramStore(
    (state) => state.selectedNodeId
  );

  const addModule = useDiagramStore(
    (state) => state.addModule
  );

  const addSubmodule = useDiagramStore(
    (state) => state.addSubmodule
  );

  const addFreeForm = useDiagramStore(
    (state) => state.addFreeForm
  );

  const setNodes = useDiagramStore(
    (state) => state.setNodes
  );

  const setEdges = useDiagramStore(
    (state) => state.setEdges
  );

  const setSelectedNode = useDiagramStore(
    (state) => state.setSelectedNode
  );

  const [
    connectionStyle,
    setConnectionStyle,
  ] = useState<ConnectionStyle>(
    "forward"
  );

  const [
    selectedEdgeId,
    setSelectedEdgeId,
  ] = useState<string | null>(null);

  /*
   * --------------------------------------------------
   * CURRENTLY SELECTED NODE
   * --------------------------------------------------
   */

  const selectedNode = nodes.find(
    (node) => node.id === selectedNodeId
  );

  /*
   * --------------------------------------------------
   * FIND THE ACTIVE MODULE
   * --------------------------------------------------
   *
   * Case 1:
   *
   * MODULE selected
   *
   * MODULE 1  <-- selected
   *
   * activeModule = MODULE 1
   *
   *
   * Case 2:
   *
   * SUBMODULE selected
   *
   * MODULE 1
   *   └── SUBMODULE 1  <-- selected
   *
   * activeModule = MODULE 1
   */

  const activeModule =
    selectedNode?.type === "module"
      ? selectedNode
      : selectedNode?.type === "submodule" &&
        selectedNode.parentId
      ? nodes.find(
          (node) =>
            node.id === selectedNode.parentId &&
            node.type === "module"
        )
      : undefined;

  /*
   * --------------------------------------------------
   * NODE CHANGES
   * --------------------------------------------------
   */

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(
        applyNodeChanges(changes, nodes)
      );
    },
    [nodes, setNodes]
  );

  /*
   * --------------------------------------------------
   * EDGE CHANGES
   * --------------------------------------------------
   */

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(
        applyEdgeChanges(changes, edges)
      );
    },
    [edges, setEdges]
  );

  /*
   * --------------------------------------------------
   * CONNECT
   * --------------------------------------------------
   */

  const onConnect = useCallback(
    (connection: Connection) => {
      const edgeColor = "#555555";

      const markerStart =
        connectionStyle === "backward" ||
        connectionStyle === "both"
          ? {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            }
          : undefined;

      const markerEnd =
        connectionStyle === "forward" ||
        connectionStyle === "both"
          ? {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            }
          : undefined;

      const newEdge = {
        ...connection,

        type: "smoothstep",

        markerStart,
        markerEnd,

        /*
        * Makes the invisible clickable area around
        * the edge much wider than the visible line.
        */
        interactionWidth: 30,

        data: {
          connectionStyle,
          lineColor: edgeColor,
          lineStyle: "solid",
        },

        style: {
          stroke: edgeColor,
          strokeWidth: 2,
        },
      };

      setEdges(
        addEdge(newEdge, edges)
      );
    },
    [
      edges,
      setEdges,
      connectionStyle,
    ]
  );

  const changeSelectedEdgeDirection = (
    direction: ConnectionStyle
  ) => {
    if (!selectedEdge) {
      return;
    }

    const edgeColor = String(
      selectedEdge.data?.lineColor ??
        "#555555"
    );

    const markerStart =
      direction === "backward" ||
      direction === "both"
        ? {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          }
        : undefined;

    const markerEnd =
      direction === "forward" ||
      direction === "both"
        ? {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          }
        : undefined;

    updateEdge(selectedEdge.id, {
      markerStart,
      markerEnd,

      data: {
        ...selectedEdge.data,
        connectionStyle: direction,
      },
    });
  };

  const updateEdge = useDiagramStore(
    (state) => state.updateEdge
  );

  const deleteEdge = useDiagramStore(
    (state) => state.deleteEdge
  );

  const selectedEdge = edges.find(
    (edge) => edge.id === selectedEdgeId
  );

  const changeSelectedEdgeLineStyle = (
    lineStyle: EdgeLineStyle
  ) => {
    if (!selectedEdge) {
      return;
    }

    const strokeDasharray =
      lineStyle === "dashed"
        ? "10 6"
        : lineStyle === "dotted"
        ? "2 6"
        : "none";

    updateEdge(selectedEdge.id, {
      style: {
        ...selectedEdge.style,
        stroke:
          selectedEdge.style?.stroke ??
          "#555555",
        strokeWidth: 2,
        strokeDasharray,
        strokeLinecap:
          lineStyle === "dotted"
            ? "round"
            : "butt",
      },

      data: {
        ...selectedEdge.data,
        lineStyle,
      },
    });
  };

  const loadDiagram = useDiagramStore(
    (state) => state.loadDiagram
  );

  const clearDiagram = useDiagramStore(
    (state) => state.clearDiagram
  );

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const saveDiagram = () => {
    const diagram = {
      version: 1,

      savedAt:
        new Date().toISOString(),

      nodes,
      edges,
    };

    const json = JSON.stringify(
      diagram,
      null,
      2
    );

    const blob = new Blob(
      [json],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "diagram.json";

    document.body.appendChild(
      anchor
    );

    anchor.click();

    document.body.removeChild(
      anchor
    );

    URL.revokeObjectURL(url);
  };

  const loadDiagramFile = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const text =
          String(reader.result);

        const parsed =
          JSON.parse(text);

        if (
          !Array.isArray(
            parsed.nodes
          ) ||
          !Array.isArray(
            parsed.edges
          )
        ) {
          throw new Error(
            "Invalid diagram file"
          );
        }

        loadDiagram(
          parsed.nodes,
          parsed.edges
        );

        setSelectedEdgeId(null);
      } catch (error) {
        console.error(error);

        alert(
          "Could not load this diagram file."
        );
      }
    };

    reader.readAsText(file);

    /*
    * Allows loading the same file
    * twice in a row.
    */
    event.target.value = "";
  };

  const exportPromptJson = () => {
    /*
    * --------------------------------------------------
    * MODULES
    * --------------------------------------------------
    *
    * Find all top-level MODULE nodes.
    */
    const modules = nodes
      .filter(
        (node) =>
          node.type === "module"
      )
      .map((moduleNode) => {
        /*
        * Find SUBMODULEs belonging
        * specifically to this MODULE.
        */
        const submodules = nodes
          .filter(
            (node) =>
              node.type ===
                "submodule" &&
              node.parentId ===
                moduleNode.id
          )
          .map((submoduleNode) => {
            if (
              submoduleNode.data.type !==
              "submodule"
            ) {
              return null;
            }

            return {
              id: submoduleNode.id,

              title:
                submoduleNode.data.title,

              input:
                submoduleNode.data.inp,

              description:
                submoduleNode.data.desc,

              return:
                submoduleNode.data.ret,

              exception:
                submoduleNode.data.exc,
            };
          })
          .filter(
            (
              submodule
            ): submodule is NonNullable<
              typeof submodule
            > => submodule !== null
          );

        if (
          moduleNode.data.type !==
          "module"
        ) {
          return null;
        }

        return {
          id: moduleNode.id,
          title:
            moduleNode.data.title,

          description:
            moduleNode.data.description,

          submodules,
        };
      })
      .filter(
        (
          module
        ): module is NonNullable<
          typeof module
        > => module !== null
      );

    /*
    * --------------------------------------------------
    * FREE FORM BOXES
    * --------------------------------------------------
    */
    const freeForms = nodes
      .filter(
        (node) =>
          node.type === "freeform"
      )
      .map((node) => {
        if (
          node.data.type !==
          "freeform"
        ) {
          return null;
        }

        return {
          id: node.id,

          title: node.data.title,

          sections:
            node.data.sections.map(
              (section) => ({
                title:
                  section.title,

                content:
                  section.content,
              })
            ),
        };
      })
      .filter(
        (
          node
        ): node is NonNullable<
          typeof node
        > => node !== null
      );

    /*
    * --------------------------------------------------
    * CONNECTIONS
    * --------------------------------------------------
    *
    * We keep semantic connectivity,
    * but remove visual information.
    */
    const connections = edges.map(
      (edge) => ({
        source: edge.source,

        target: edge.target,

        sourceHandle:
          edge.sourceHandle ??
          null,

        targetHandle:
          edge.targetHandle ??
          null,

        direction:
          String(
            edge.data
              ?.connectionStyle ??
              "forward"
          ),
      })
    );

    /*
    * --------------------------------------------------
    * FINAL PROMPT STRUCTURE
    * --------------------------------------------------
    */
    const promptDiagram = {
      modules,
      freeForms,
      connections,
    };

    const json = JSON.stringify(
      promptDiagram,
      null,
      2
    );

    const blob = new Blob(
      [json],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "diagram-prompt.json";

    document.body.appendChild(
      anchor
    );

    anchor.click();

    document.body.removeChild(
      anchor
    );

    URL.revokeObjectURL(url);
  };

  const clearEntireDiagram = () => {
    const confirmed =
      window.confirm(
        "Clear the entire diagram?"
      );

    if (!confirmed) {
      return;
    }

    clearDiagram();

    setSelectedEdgeId(null);
  };

  const toolbarButtonStyle = {
    fontSize: 16,
    padding: "8px 12px",
    minHeight: 38,
  };

  const toolbarSelectStyle = {
    fontSize: 16,
    padding: "6px 10px",
    minHeight: 38,
  };

  const toolbarLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 16,
  };

  const toolbarColorStyle = {
    width: 42,
    height: 38,
    padding: 2,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOOLBAR */}

      <div
        style={{
          minHeight: 72,
          flexShrink: 0,
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          background: "#f7f7f7",
          flexWrap: "wrap",
        }}
      >
        {/* ADD MODULE */}

        <button
          style={toolbarButtonStyle}
          onClick={addModule}
        >
          + MODULE
        </button>

        {/* ADD SUBMODULE */}

        <button
          disabled={!activeModule}
          style={toolbarButtonStyle}
          onClick={() => {
            if (activeModule) {
              addSubmodule(activeModule.id);
            }
          }}
        >
          + SUBMODULE
        </button>

        <button
          style={toolbarButtonStyle}
          onClick={addFreeForm}
        >
          + FREE FORM
        </button>

        <div
          style={{
            width: 1,
            height: 30,
            background: "#ccc",
            margin: "0 5px",
          }}
        />

        <button
          style={toolbarButtonStyle}
          onClick={exportPromptJson}
        >
          Export to Prompt
        </button>

        <button
          style={toolbarButtonStyle}
          onClick={saveDiagram}
        >
          Share Diagram
        </button>

        <button
          style={toolbarButtonStyle}
          onClick={() =>
            fileInputRef.current?.click()
          }
        >
          Upload Diagram
        </button>

        <button
          style={toolbarButtonStyle}
          onClick={
            clearEntireDiagram
          }
        >
          Clear
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={
            loadDiagramFile
          }
          style={{
            display: "none",
          }}
        />

        <div
          style={{
            width: 1,
            height: 30,
            background: "#ccc",
            margin: "0 5px",
          }}
        />

        <label style={toolbarLabelStyle}>
          Connection

          <select
            style={toolbarSelectStyle}
            value={String(
              selectedEdge?.data
                ?.connectionStyle ??
                connectionStyle
            )}
            onChange={(e) => {
              const nextConnectionStyle =
                e.target.value as ConnectionStyle;

              setConnectionStyle(
                nextConnectionStyle
              );

              if (selectedEdge) {
                changeSelectedEdgeDirection(
                  nextConnectionStyle
                );
              }
            }}
          >
            <option value="line">
              Line ─
            </option>

            <option value="forward">
              Forward →
            </option>

            <option value="backward">
              Backward ←
            </option>

            <option value="both">
              Both ↔
            </option>
          </select>
        </label>

        {selectedEdge && (
          <>
            <div
              style={{
                width: 1,
                height: 30,
                background: "#ccc",
                margin: "0 5px",
              }}
            />

            <strong
              style={{
                fontSize: 16,
              }}
            >
              EDGE
            </strong>

            {/* DIRECTION */}

            <label
              style={toolbarLabelStyle}
            >
              Direction

              <select
                style={toolbarSelectStyle}
                value={String(
                  selectedEdge.data
                    ?.connectionStyle ??
                    "forward"
                )}
                onChange={(e) =>
                  changeSelectedEdgeDirection(
                    e.target
                      .value as ConnectionStyle
                  )
                }
              >
                <option value="line">
                  Line ─
                </option>

                <option value="forward">
                  Forward →
                </option>

                <option value="backward">
                  Backward ←
                </option>

                <option value="both">
                  Both ↔
                </option>
              </select>
            </label>

            {/* COLOR */}

            <label
              style={toolbarColorStyle}
            >
              Color

              <input
                type="color"
                style={toolbarColorStyle}
                value={String(
                  selectedEdge.data
                    ?.lineColor ??
                    "#555555"
                )}
                onChange={(e) => {
                  const color =
                    e.target.value;

                  const direction =
                    String(
                      selectedEdge.data
                        ?.connectionStyle ??
                        "forward"
                    ) as ConnectionStyle;

                  updateEdge(
                    selectedEdge.id,
                    {
                      style: {
                        ...selectedEdge.style,
                        stroke: color,
                        strokeWidth: 2,
                      },

                      markerStart:
                        direction ===
                          "backward" ||
                        direction === "both"
                          ? {
                              type:
                                MarkerType.ArrowClosed,
                              color,
                            }
                          : undefined,

                      markerEnd:
                        direction ===
                          "forward" ||
                        direction === "both"
                          ? {
                              type:
                                MarkerType.ArrowClosed,
                              color,
                            }
                          : undefined,

                      data: {
                        ...selectedEdge.data,
                        lineColor: color,
                      },
                    }
                  );
                }}
              />
            </label>

            {/* LINE STYLE */}

            <label
              style={toolbarLabelStyle}
            >
              Style

              <select
                style={toolbarSelectStyle}
                value={String(
                  selectedEdge.data
                    ?.lineStyle ??
                    "solid"
                )}
                onChange={(e) =>
                  changeSelectedEdgeLineStyle(
                    e.target.value as EdgeLineStyle
                  )
                }
              >
                <option value="solid">
                  Solid
                </option>

                <option value="dashed">
                  Dashed
                </option>

                <option value="dotted">
                  Dotted
                </option>
              </select>
            </label>

            {/* DELETE */}

            <button
              onClick={() => {
                deleteEdge(
                  selectedEdge.id
                );

                setSelectedEdgeId(
                  null
                );
              }}
              style={{
                ...toolbarButtonStyle,
                background: "#d33",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Delete Edge
            </button>
          </>
        )}

        {/* APPEARANCE CONTROLS */}

        {selectedNode && (
          <>
            <div
              style={{
                width: 1,
                height: 30,
                background: "#ccc",
                margin: "0 5px",
              }}
            />

            {/* FILL COLOR */}

            <label
              style={toolbarLabelStyle}
            >
              Fill

              <input
                type="color"
                value={
                  String(
                    selectedNode.data
                      .backgroundColor
                  )
                }
                onChange={(e) => {
                  useDiagramStore
                    .getState()
                    .updateNodeData(
                      selectedNode.id,
                      {
                        backgroundColor:
                          e.target.value,
                      }
                    );
                }}
              />
            </label>

            {/* BORDER COLOR */}

            <label
              style={toolbarLabelStyle}
            >
              Border

              <input
                type="color"
                value={
                  String(
                    selectedNode.data
                      .borderColor
                  )
                }
                onChange={(e) => {
                  useDiagramStore
                    .getState()
                    .updateNodeData(
                      selectedNode.id,
                      {
                        borderColor:
                          e.target.value,
                      }
                    );
                }}
              />
            </label>

            {/* BORDER STYLE */}

            <label
              style={toolbarLabelStyle}
            >
              Style

              <select
                value={
                  String(
                    selectedNode.data
                      .borderStyle
                  )
                }
                onChange={(e) => {
                  useDiagramStore
                    .getState()
                    .updateNodeData(
                      selectedNode.id,
                      {
                        borderStyle:
                          e.target.value as
                            | "solid"
                            | "dashed"
                            | "dotted",
                      }
                    );
                }}
              >
                <option value="solid">
                  Solid
                </option>

                <option value="dashed">
                  Dashed
                </option>

                <option value="dotted">
                  Dotted
                </option>
              </select>
            </label>
          </>
        )}

        {/* STATUS */}

        <div
          style={{
            marginLeft: 15,
            fontSize: 15,
            color: "#666",
          }}
        >
          {!selectedNode && (
            <>Select a MODULE or SUBMODULE</>
          )}

          {selectedNode?.type === "module" && (
            <>
              Selected MODULE:{" "}
              <strong>
                {String(selectedNode.data.title)}
              </strong>
            </>
          )}

          {selectedNode?.type === "submodule" &&
            activeModule && (
              <>
                Selected SUBMODULE inside{" "}
                <strong>
                  {String(activeModule.data.title)}
                </strong>
              </>
          )}

          {selectedNode?.type === "freeform" && (
            <>
              Selected FREE FORM:{" "}
              <strong>
                {String(
                  selectedNode.data.title
                )}
                </strong>
              </>
          )}

        </div>
      </div>

      {/* CANVAS */}

      <div
        style={{
          flex: 1,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => {
            setSelectedNode(node.id);
            setSelectedEdgeId(null);
          }}
          onEdgeClick={(_, edge) => {
            setSelectedEdgeId(edge.id);
            setSelectedNode(null);
          }}
          onPaneClick={() => {
            setSelectedNode(null)
            setSelectedEdgeId(null);
          }}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
