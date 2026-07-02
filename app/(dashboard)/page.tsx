import TabTable from "@/common/table/TabTable";
import { tabs } from "@/components/cui/table/demo/demo";
const page = () => {
  return (
    <div className="min-w-0">
      {/* <MyTable /> */}
      <TabTable tabs={tabs} />
    </div>
  );
};

export default page;
