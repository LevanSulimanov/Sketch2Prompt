import type { Node } from "@xyflow/react";

export type BoxType =
  | "module"
  | "submodule"
  | "freeform";

export type BorderStyle =
  | "solid"
  | "dashed"
  | "dotted";

export type ConnectionStyle =
  | "line"
  | "forward"
  | "backward"
  | "both";

export interface BoxAppearance {
  backgroundColor: string;
  borderColor: string;
  borderStyle: BorderStyle;
}

export interface ModuleData
  extends BoxAppearance {
  type: "module";

  title: string;
  description: string;
}

export interface SubmoduleData
  extends BoxAppearance {
  type: "submodule";

  title: string;

  inp: string;
  desc: string;
  ret: string;
  exc: string;
}

export interface FreeFormSection {
  id: string;
  title: string;
  content: string;
}

export interface FreeFormData
  extends BoxAppearance {
  type: "freeform";

  title: string;

  sections: FreeFormSection[];
}

export type DiagramNodeData =
  | ModuleData
  | SubmoduleData
  | FreeFormData;

export type DiagramNode =
  Node<DiagramNodeData>;
