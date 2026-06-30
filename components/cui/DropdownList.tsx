import React, { FC } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChildrenType, ClassNameType } from "@/types/common_types";
import { twMerge } from "tailwind-merge";
import { Button } from "../ui/button";

export interface ContentItem {
  [key: string]: unknown;
  Icon?: React.ElementType;
  title?: string | number;
  click?: () => void;
  className?: ClassNameType;
  contentClass?: ClassNameType;
  contentId?: string;
}
export interface DropdownListProps {
  Trigger?: () => React.ReactNode;
  contents?: ContentItem[];
  children?: ChildrenType;
  contentId?: string; //use for key title in contents,
  contentsWrapClass?: ClassNameType;
  contentClass?: ClassNameType;
}

export interface ContentListType {
  content: ContentItem;
  contentId?: string; //use for key title in contents,
  contentClass?: ClassNameType;
  contentsWrapClass?: ClassNameType;
}

// Inside Dropdown
export const ContentList: FC<ContentListType> = ({
  content,
  contentClass,
  contentId = "title",
}) => {
  const handleToggle = (click?: () => void) => {
    if (click) {
      click();
    }
  };
  const Icon = content?.Icon;
  return (
    <span
      className={twMerge(
        `w-full   flex items-center space-x-2 cursor-pointer hover:bg-accent`,
        ` ${contentClass}`,
        `${content.className}`,
      )}
      onClick={() => handleToggle(content?.click)}
    >
      {Icon && <Icon />}

      <span className="text-sm px-2 py-1">
        {content[contentId] as React.ReactNode}
      </span>
    </span>
  );
};
const DropdownList = ({
  Trigger,
  children,
  contents,
  contentClass,
  contentId,
  contentsWrapClass,
}: DropdownListProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {Trigger ? Trigger() : <Button variant="outline">Open popover</Button>}
      </PopoverTrigger>
      <PopoverContent className={cn(" m-0 p-0", contentsWrapClass)}>
        <div className=" flex flex-col select-none w-full">
          {children
            ? children
            : contents?.map((content: ContentItem, key: number) => (
                <span key={key} className="">
                  <ContentList
                    content={content}
                    contentClass={content?.contentClass || contentClass}
                    contentId={content?.contentId || contentId}
                  />
                </span>
              ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DropdownList;
