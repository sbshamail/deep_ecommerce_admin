import { CalendarDays } from "lucide-react";
import React, { FC } from "react";
import InputDatePicker from "../../InputDatePicker";

export interface FromToDateFilterTypes {
  fromDate?: Date;
  setFromDate?: React.Dispatch<React.SetStateAction<Date | undefined>>;
  toDate?: Date;
  setToDate?: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
const FromToDateFilter: FC<FromToDateFilterTypes> = ({
  fromDate,
  setFromDate = () => {},
  toDate,
  setToDate = () => {},
}) => {
  return (
    <div className="flex  items-center select-none">
      <div>
        <CalendarDays />
      </div>
      <InputDatePicker selectedDate={fromDate} setSelectedDate={setFromDate} />
      -
      <InputDatePicker selectedDate={toDate} setSelectedDate={setToDate} />
    </div>
  );
};

export default FromToDateFilter;
