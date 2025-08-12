import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import useMyStore from "../store/route-store";

const StatusRadioEditor = forwardRef((props: any, ref) => {
  const valueRef = useRef(props.value); // Store current value in a ref
  const { updateRoutesStatus } = useMyStore();

  useImperativeHandle(ref, () => ({
    getValue: () => valueRef.current, // Ag-Grid will get this value
  }));

const handleChange = (newValue: string) => {
  valueRef.current = newValue;
  props.stopEditing(); // Let Ag-Grid commit the new value
  console.log(newValue);

  const routeName = props.data?.Route; // ✅ Safely access route name
  if (routeName) {
    updateRoutesStatus(routeName, newValue);
  }
};


  return (
    <div style={{ display: "flex", gap: "10px", padding: "4px" }}>
      <label>
        <input
          type="radio"
          value="Locked"
          checked={valueRef.current === "Locked"}
          onChange={() => handleChange("Locked")}
        />
        Locked
      </label>
      <label>
        <input
          type="radio"
          value="Unlocked"
          checked={valueRef.current === "Unlocked"}
          onChange={() => handleChange("Unlocked")}
        />
        Unlocked
      </label>
    </div>
  );
});

export default StatusRadioEditor;
