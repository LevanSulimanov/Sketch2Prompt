import { create } from "zustand";
import type { Edge } from "@xyflow/react";

import type {
  DiagramNode,
  ModuleData,
  SubmoduleData,
  FreeFormData,
  FreeFormSection,
} from "../types/diagram";

interface DiagramState {
  nodes: DiagramNode[];
  edges: Edge[];
  selectedNodeId: string | null;

  addModule: () => void;
  addSubmodule: (parentId: string) => void;
  addFreeForm: () => void;
  addFreeFormSection: (nodeId: string) => void;

  updateFreeFormSection: (
    nodeId: string,
    sectionId: string,
    updates: Partial<FreeFormSection>
  ) => void;

  deleteFreeFormSection: (
    nodeId: string,
    sectionId: string
  ) => void;

  updateNodeData: (
    nodeId: string,
    data:
      | Partial<ModuleData>
      | Partial<SubmoduleData>
      | Partial<FreeFormData>
  ) => void;

  updateEdge: (
    edgeId: string,
    updates: Partial<Edge>
  ) => void;

  deleteNode: (nodeId: string) => void;

  deleteEdge: (edgeId: string) => void;

  setNodes: (nodes: DiagramNode[]) => void;
  setEdges: (edges: Edge[]) => void;

  setSelectedNode: (nodeId: string | null) => void;

  loadDiagram: (
    nodes: DiagramNode[],
    edges: Edge[]
  ) => void;

  clearDiagram: () => void;

}

let moduleCounter = 1;
let submoduleCounter = 1;
let freeFormCounter = 1;
let freeFormSectionCounter = 1;

/*
 * MODULE dimensions
 */
const MODULE_DEFAULT_WIDTH = 500;
const MODULE_DEFAULT_HEIGHT = 450;

/*
 * Area at top of MODULE occupied by:
 *
 * title
 * description
 * CONTENT label
 */
const MODULE_CONTENT_TOP = 150;

/*
 * SUBMODULE dimensions
 */
const SUBMODULE_WIDTH = 300;
const SUBMODULE_HEIGHT = 260;

/*
 * Spacing between SUBMODULEs
 */
const CHILD_GAP = 20;
const CHILD_MARGIN = 20;

const TOP_LEVEL_GAP = 40;

function findEmptyTopLevelPosition(
  nodes: DiagramNode[],
  width: number,
  height: number
) {
  const topLevelNodes = nodes.filter(
    (node) => !node.parentId
  );

  const startX = 80;
  const startY = 80;

  const stepX = 600;
  const stepY = 550;

  for (let row = 0; row < 100; row++) {
    for (let col = 0; col < 100; col++) {
      const x =
        startX + col * stepX;

      const y =
        startY + row * stepY;

      const overlaps =
        topLevelNodes.some((node) => {
          const nodeWidth =
            Number(
              node.width ??
              node.style?.width
            ) || 350;

          const nodeHeight =
            Number(
              node.height ??
              node.style?.height
            ) || 300;

          const left1 = x;
          const right1 =
            x + width;

          const top1 = y;
          const bottom1 =
            y + height;

          const left2 =
            node.position.x;

          const right2 =
            node.position.x +
            nodeWidth;

          const top2 =
            node.position.y;

          const bottom2 =
            node.position.y +
            nodeHeight;

          return !(
            right1 +
              TOP_LEVEL_GAP <
              left2 ||
            left1 >
              right2 +
                TOP_LEVEL_GAP ||
            bottom1 +
              TOP_LEVEL_GAP <
              top2 ||
            top1 >
              bottom2 +
                TOP_LEVEL_GAP
          );
        });

      if (!overlaps) {
        return {
          x,
          y,
        };
      }
    }
  }

  return {
    x: startX,
    y: startY,
  };
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  /*
   * --------------------------------------------------
   * ADD MODULE
   * --------------------------------------------------
   */
  addModule: () => {
    const number = moduleCounter++;
    const id = `module-${number}`;

    const position =
      findEmptyTopLevelPosition(
        get().nodes,
        MODULE_DEFAULT_WIDTH,
        MODULE_DEFAULT_HEIGHT
      );

    const newNode: DiagramNode = {
      id,

      type: "module",

      position,

      style: {
        width: MODULE_DEFAULT_WIDTH,
        height: MODULE_DEFAULT_HEIGHT,
      },

      data: {
        type: "module",
        title: `MODULE ${number}`,
        description: "",

        backgroundColor: "#ffffff",
        borderColor: "#333333",
        borderStyle: "solid",
      },
    };

    set((state) => ({
      nodes: [
        ...state.nodes,
        newNode,
      ],

      selectedNodeId: id,
    }));
  },

  /*
   * --------------------------------------------------
   * ADD SUBMODULE
   * --------------------------------------------------
   */
  addSubmodule: (parentId) => {
    set((state) => {
      const parent = state.nodes.find(
        (node) =>
          node.id === parentId &&
          node.type === "module"
      );

      if (!parent) {
        return state;
      }

      /*
       * Find only direct children of this MODULE.
       */
      const siblings = state.nodes.filter(
        (node) =>
          node.parentId === parentId &&
          node.type === "submodule"
      );

      const number = submoduleCounter++;
      const id = `submodule-${number}`;

      /*
       * --------------------------------------------------
       * SIMPLE GRID LAYOUT
       * --------------------------------------------------
       *
       * We place SUBMODULEs left-to-right.
       *
       * If there isn't enough horizontal room,
       * we start a new row.
       */

      const parentWidth =
        typeof parent.width === "number"
          ? parent.width
          : typeof parent.style?.width === "number"
          ? parent.style.width
          : MODULE_DEFAULT_WIDTH;

      const usableWidth =
        parentWidth - CHILD_MARGIN * 2;

      const columns = Math.max(
        1,
        Math.floor(
          (usableWidth + CHILD_GAP) /
            (SUBMODULE_WIDTH + CHILD_GAP)
        )
      );

      const index = siblings.length;

      const column = index % columns;
      const row = Math.floor(index / columns);

      const x =
        CHILD_MARGIN +
        column * (SUBMODULE_WIDTH + CHILD_GAP);

      const y =
        MODULE_CONTENT_TOP +
        row * (SUBMODULE_HEIGHT + CHILD_GAP);

      const newNode: DiagramNode = {
        id,

        type: "submodule",

        /*
         * Real React Flow parent relationship.
         */
        parentId,

        /*
         * Position relative to MODULE.
         */
        position: {
          x,
          y,
        },

        style: {
          width: SUBMODULE_WIDTH,
          height: SUBMODULE_HEIGHT,
        },

        /*
         * Child cannot be dragged outside parent.
         */
        extent: "parent",

        /*
         * If a node approaches the parent's edge,
         * React Flow can enlarge the parent.
         */
        expandParent: true,

        data: {
          type: "submodule",
          title: `SUBMODULE ${number}`,

          inp: "",
          desc: "",
          ret: "",
          exc: "",

          backgroundColor: "#ffffff",
          borderColor: "#555555",
          borderStyle: "solid",
        },
      };

      /*
       * --------------------------------------------------
       * MAKE SURE MODULE IS TALL ENOUGH
       * --------------------------------------------------
       */

      const requiredHeight =
        y +
        SUBMODULE_HEIGHT +
        CHILD_MARGIN;

      const currentHeight =
        typeof parent.height === "number"
          ? parent.height
          : typeof parent.style?.height === "number"
          ? parent.style.height
          : MODULE_DEFAULT_HEIGHT;

      const updatedNodes = state.nodes.map((node) => {
        if (node.id !== parentId) {
          return node;
        }

        if (requiredHeight <= currentHeight) {
          return node;
        }

        return {
          ...node,

          style: {
            ...node.style,
            height: requiredHeight,
          },
        };
      });

      return {
        nodes: [...updatedNodes, newNode],
        selectedNodeId: id,
      };
    });
  },

  /*
  * --------------------------------------------------
  * ADD FREE FORM BOX
  * --------------------------------------------------
  */
  addFreeForm: () => {
    const number = freeFormCounter++;
    const id = `freeform-${number}`;

    const width = 340;
    const height = 300;

    const position =
      findEmptyTopLevelPosition(
        get().nodes,
        width,
        height
      );

    const newNode: DiagramNode = {
      id,

      type: "freeform",

      position,

      style: {
        width,
        height,
      },

      data: {
        type: "freeform",

        title: `FREE FORM ${number}`,

        sections: [
          {
            id: `freeform-section-${freeFormSectionCounter++}`,
            title: "SECTION 1",
            content: "",
          },
        ],

        backgroundColor: "#ffffff",
        borderColor: "#555555",
        borderStyle: "solid",
      },
    };

    set((state) => ({
      nodes: [
        ...state.nodes,
        newNode,
      ],

      selectedNodeId: id,
    }));
  },

  /*
   * --------------------------------------------------
   * UPDATE NODE DATA
   * --------------------------------------------------
   */
  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,

              data: {
                ...node.data,
                ...data,
              },
            }
          : node
      ),
    }));
  },

  /*
  * --------------------------------------------------
  * ADD FREE FORM SECTION
  * --------------------------------------------------
  */
  addFreeFormSection: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (
          node.id !== nodeId ||
          node.data.type !== "freeform"
        ) {
          return node;
        }

        const newSection: FreeFormSection = {
          id: `freeform-section-${freeFormSectionCounter++}`,

          title: `SECTION ${
            node.data.sections.length + 1
          }`,

          content: "",
        };

        return {
          ...node,

          data: {
            ...node.data,

            sections: [
              ...node.data.sections,
              newSection,
            ],
          },
        };
      }),
    }));
  },

  /*
  * --------------------------------------------------
  * UPDATE FREE FORM SECTION
  * --------------------------------------------------
  */
  updateFreeFormSection: (
    nodeId,
    sectionId,
    updates
  ) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (
          node.id !== nodeId ||
          node.data.type !== "freeform"
        ) {
          return node;
        }

        return {
          ...node,

          data: {
            ...node.data,

            sections:
              node.data.sections.map(
                (section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        ...updates,
                      }
                    : section
              ),
          },
        };
      }),
    }));
  },

  /*
  * --------------------------------------------------
  * UPDATE EDGE
  * --------------------------------------------------
  */
  updateEdge: (edgeId, updates) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              ...updates,
            }
          : edge
      ),
    }));
  },

  /*
  * --------------------------------------------------
  * DELETE EDGE
  * --------------------------------------------------
  */
  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter(
        (edge) => edge.id !== edgeId
      ),
    }));
  },

  /*
  * --------------------------------------------------
  * DELETE FREE FORM SECTION
  * --------------------------------------------------
  */
  deleteFreeFormSection: (
    nodeId,
    sectionId
  ) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (
          node.id !== nodeId ||
          node.data.type !== "freeform"
        ) {
          return node;
        }

        return {
          ...node,

          data: {
            ...node.data,

            sections:
              node.data.sections.filter(
                (section) =>
                  section.id !== sectionId
              ),
          },
        };
      }),
    }));
  },

  /*
   * --------------------------------------------------
   * DELETE NODE
   * --------------------------------------------------
   *
   * Recursive:
   *
   * deleting MODULE
   * deletes all children.
   */
  deleteNode: (nodeId) => {
    set((state) => {
      const idsToDelete = new Set<string>([
        nodeId,
      ]);

      let foundMore = true;

      while (foundMore) {
        foundMore = false;

        for (const node of state.nodes) {
          if (
            node.parentId &&
            idsToDelete.has(node.parentId) &&
            !idsToDelete.has(node.id)
          ) {
            idsToDelete.add(node.id);
            foundMore = true;
          }
        }
      }

      return {
        nodes: state.nodes.filter(
          (node) => !idsToDelete.has(node.id)
        ),

        edges: state.edges.filter(
          (edge) =>
            !idsToDelete.has(edge.source) &&
            !idsToDelete.has(edge.target)
        ),

        selectedNodeId:
          state.selectedNodeId &&
          idsToDelete.has(state.selectedNodeId)
            ? null
            : state.selectedNodeId,
      };
    });
  },

  /*
   * --------------------------------------------------
   * SETTERS
   * --------------------------------------------------
   */

  setNodes: (nodes) =>
    set({
      nodes,
    }),

  setEdges: (edges) =>
    set({
      edges,
    }),

  setSelectedNode: (nodeId) =>
    set({
      selectedNodeId: nodeId,
    }),

  loadDiagram: (nodes, edges) => {
    let highestModule = 0;
    let highestSubmodule = 0;
    let highestFreeForm = 0;
    let highestSection = 0;

    for (const node of nodes) {
      if (node.id.startsWith("module-")) {
        const number = Number(
          node.id.replace("module-", "")
        );

        if (Number.isFinite(number)) {
          highestModule = Math.max(
            highestModule,
            number
          );
        }
      }

      if (node.id.startsWith("submodule-")) {
        const number = Number(
          node.id.replace("submodule-", "")
        );

        if (Number.isFinite(number)) {
          highestSubmodule = Math.max(
            highestSubmodule,
            number
          );
        }
      }

      if (node.id.startsWith("freeform-")) {
        const number = Number(
          node.id.replace("freeform-", "")
        );

        if (Number.isFinite(number)) {
          highestFreeForm = Math.max(
            highestFreeForm,
            number
          );
        }
      }

      if (node.data.type === "freeform") {
        for (const section of node.data.sections) {
          const match = section.id.match(
            /^freeform-section-(\d+)$/
          );

          if (match) {
            highestSection = Math.max(
              highestSection,
              Number(match[1])
            );
          }
        }
      }
    }

    moduleCounter = highestModule + 1;
    submoduleCounter = highestSubmodule + 1;
    freeFormCounter = highestFreeForm + 1;
    freeFormSectionCounter = highestSection + 1;

    set({
      nodes,
      edges,
      selectedNodeId: null,
    });
  },

  clearDiagram: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  },

}));
