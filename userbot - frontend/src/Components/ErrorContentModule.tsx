import { AlertTriangleIcon } from "lucide-react";
import useErrorStore from "../Hook/useErrorStore";
import { useLanguage } from "../Hook/useLanguage";

function ErrorContentModule() {
  const errorTxt = useErrorStore((state) => state.errors);
  const { t, ready } = useLanguage("ErrorContentModule");

  if (ready) return;

  return (
    <div className="fixed left-1/2 bottom-5 -translate-x-1/2 w-full max-w-125">
      {errorTxt.map((item, index) => {
        const reverseIndex = errorTxt.length - 1 - index;
        return (
          <div
            key={item.id}
            className="bg-[#461901] w-full max-w-4/5 p-1.5 border border-[#6c2702] rounded-sm flex flex-col gap-1"
            style={{
              position: "absolute",
              right: `calc(25px - ${reverseIndex * 10}px)`,
              bottom: 20 * reverseIndex,
              zIndex: 10 - reverseIndex,
              opacity: 1 - reverseIndex / 10,
            }}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangleIcon className="size-4 text-white shrink-0" />
              <h1 className="text-sm text-white font-medium line-clamp-1">
                {t("ops")}
              </h1>
            </div>
            <p className="text-xs line-clamp-2 pl-6">{t(item.txt)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default ErrorContentModule;
