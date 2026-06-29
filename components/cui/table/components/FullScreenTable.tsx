import { Maximize } from "lucide-react";

export interface FullScreenTableType {
  fullScreen?: boolean;
  setFullScreen?: (b: boolean) => void;
}
const FullScreenTable = ({
  fullScreen = false,
  setFullScreen,
}: FullScreenTableType) => {
  return (
    setFullScreen && (
      <div>
        <Maximize
          onClick={() => setFullScreen(!fullScreen)}
          className="text-[2em] hover:scale-105 "
        />
      </div>
    )
  );
};

export default FullScreenTable;
