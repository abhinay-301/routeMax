// src/components/StatusRadioEditor.jsx
import { forwardRef, useState, useImperativeHandle } from "react";

const StatusRadioEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  return (
    <div style={{ display: "flex", gap: "10px", padding: "4px" }}>
      <label>
        <input
          type="radio"
          value="Locked"
          checked={value === "Locked"}
          onChange={() => setValue("Locked")}
        />
        Locked
      </label>
      <label>
        <input
          type="radio"
          value="Unlocked"
          checked={value === "Unlocked"}
          onChange={() => setValue("Unlocked")}
        />
        Unlocked
      </label>
    </div>
  );
});

export default StatusRadioEditor;
