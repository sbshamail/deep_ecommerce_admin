import { cn } from "@/lib/utils";
import { ClassNameType } from "@/types/common_types";
import { Maximize } from "lucide-react";

export interface FullScreenTableType {
  fullScreen?: boolean;
  setFullScreen?: (b: boolean) => void;
  iconSize?: number;
  className?: ClassNameType;
}
const FullScreenTable = ({
  fullScreen = false,
  setFullScreen,
  iconSize = 16,
  className,
}: FullScreenTableType) => {
  return (
    setFullScreen && (
      <div>
        <Maximize
          onClick={() => setFullScreen(!fullScreen)}
          className={cn(" hover:scale-105 ", className)}
          size={iconSize}
        />
      </div>
    )
  );
};

export default FullScreenTable;
