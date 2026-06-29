"use client";
import Table from "@/components/cui/table";
import { demoColumns, demoData } from "@/components/cui/table/demo/demo";
import { useState } from "react";
const Page = () => {
  //table fullscreen state
  const [fullScreen, setFullScreen] = useState(false);
  return (
    <div>
      <Table
        striped={true}
        data={demoData}
        columns={demoColumns}
        showPagination={true}
        tableWrapperClass={
          !fullScreen ? "!max-h-[calc(100vh-350px)] overflow-y-auto" : ""
        }
      />
    </div>
  );
};

export default Page;
