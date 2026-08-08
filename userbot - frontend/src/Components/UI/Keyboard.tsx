import { Delete } from "lucide-react";
import { useEffect, useState } from "react";

type KeyboardProps = {
  code: string[];
  length: number;
  index: number;
  status?: boolean;
  setNumber: (index: number, value: string[]) => void;
};

const KeyboardMap: [number, string][] = [
  [1, ""],
  [2, "ABC"],
  [3, "DEF"],
  [4, "GHI"],
  [5, "JKL"],
  [6, "MNO"],
  [7, "PQRS"],
  [8, "TUV"],
  [9, "WXYZ"],
  [2006, "none"],
  [0, "+"],
];

function Keyboard({
  code,
  setNumber,
  length,
  index,
  status = false,
}: KeyboardProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleNumber = (num: number) => {
    if (code.filter(Boolean).length < length && !loading) {
      const nx = [...code];
      nx[index] = String(num);
      let fIndex: number = nx.findIndex((v) => v === "");
      fIndex = fIndex === -1 ? length - 1 : fIndex;
      setNumber(fIndex, nx);
    }
  };

  const handleBackSpace = () => {
    if (loading) return;
    const nx = [...code];
    nx[index] = "";
    let fIndex = nx.findIndex((v) => v === "");
    fIndex = fIndex === -1 ? length - 1 : Math.max(fIndex - 1, 0);
    setNumber(fIndex, nx);
  };

  useEffect(() => {
    setLoading(status);
  }, [status]);

  return (
    <div className="w-full grid grid-cols-3 gap-1 mb-5 max-w-90 mx-auto">
      {KeyboardMap.map((item, index) => {
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleNumber(item[0])}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded-xl ${index === 0 ? "rounded-tl-3xl" : index === 2 ? "rounded-tr-3xl" : ""} ${item[0] === 2006 ? "invisible" : "bg-input-color visible"}`}
          >
            <h1 className="text-lg text-white font-medium">{item[0]}</h1>
            <p className="text-sm text-gray-500">{item[1]}</p>
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleBackSpace}
        className="flex items-center justify-center cursor-pointer rounded-xl rounded-br-3xl bg-input-color text-white"
      >
        <Delete size={20} />
      </button>
    </div>
  );
}

export default Keyboard;
