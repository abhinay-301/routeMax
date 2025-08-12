import { forwardRef, useImperativeHandle, useRef } from "react";
import Select from "react-select";
import useMyStore from "../store/route-store";

const RouteTypeEditor = forwardRef((props: any, ref) => {
  const valueRef = useRef(props.value);
  const updateRouteType = useMyStore.getState().updateRouteType;

  const options = [
    { value: "City", label: "City" },
    { value: "Trap", label: "Trap" },
  ];

  useImperativeHandle(ref, () => ({
    getValue: () => valueRef.current,
  }));

  // updating Route Type in Store
  const handleChange = (selectedOption: any) => {
    valueRef.current = selectedOption.value;
    props.stopEditing();

    const routeName = props.data?.Route;
    if (routeName) {
      updateRouteType(routeName, selectedOption.value);
    }
  };

  return (
    <div style={{ padding: "4px" }}>
      <Select
        options={options}
        defaultValue={options.find((opt) => opt.value === props.value)}
        onChange={handleChange}
        menuPortalTarget={document.body} // fixes menu overflow in grid
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          container: (base) => ({ ...base, minWidth: 120 }),
        }}
      />
    </div>
  );
});

export default RouteTypeEditor;
