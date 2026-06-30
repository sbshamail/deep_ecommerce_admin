import TabTable from "@/common/table/TabTable";
import { tabs } from "@/components/cui/table/demo/demo";
const page = () => {
  return (
    <div>
      {/* <MyTable /> */}
      <TabTable tabs={tabs} />
    </div>
  );
};

export default page;
