import { useDiagramStore } from "../store/diagramStore";

export default function Toolbar() {
  const addModule = useDiagramStore((state) => state.addModule);

  return (
    <div className="toolbar">
      <button onClick={addModule}>
        + Module Box
      </button>

      <div className="toolbar-separator" />

      <button disabled>
        + Submodule Box
      </button>

      <button disabled>
        + Free Form Box
      </button>

      <div className="toolbar-spacer" />

      <span className="toolbar-hint">
        Double-click a module to rename it
      </span>
    </div>
  );
}
