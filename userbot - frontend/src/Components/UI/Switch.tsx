interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-5.75 w-11 rounded-full cursor-pointer ${checked ? "bg-blue-400" : "bg-gray-500"} transition-colors duration-300`}
    >
      <span
        className={`absolute top-1/2 left-0.5 -translate-y-1/2 ${checked ? "translate-x-5.5" : ""} rounded-full block size-4.5 bg-white transition-all duration-300`}
      ></span>
    </button>
  );
}

export default Switch;
