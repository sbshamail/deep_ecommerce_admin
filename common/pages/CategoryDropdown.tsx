"use client";
import { CategoryTreeNode } from "@/types/product_types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CategoryTableProps {
  categories: CategoryTreeNode[];
}
const CategoryDropdown = ({ categories }: CategoryTableProps) => {
  const [subCat, setSubCat] = useState<CategoryTreeNode | null>(null);
  return (
    <div className="w-max">
      <div className=" relative  shadow">
        <div className="flex flex-col overflow-auto">
          {categories &&
            categories?.length > 0 &&
            categories?.map((content: CategoryTreeNode, index: number) => (
              <Link
                key={index}
                // onClick={() => handleRoute(`?categories=${content.name}`)}
                href={`/product/?categories=${content.name}` || "#"}
              >
                <div
                  className="relative w-full px-2 py-3  cursor-pointer hover:bg-accent"
                  onMouseEnter={() => setSubCat(content)}
                >
                  <div className="flex items-center space-x-2 justify-between ">
                    <div className="flex items-center space-x-2">
                      {content?.icon ? (
                        <content.icon />
                      ) : (
                        content?.image && (
                          <Image
                            alt={content.name}
                            src={content.image.original}
                            width={40}
                            height={40}
                            className="w-8 h-8 aspect-square"
                          />
                        )
                      )}
                      <span className="text-sm">{content.name}</span>
                    </div>
                    {content?.children && <ChevronRight />}
                  </div>
                </div>
              </Link>
            ))}
        </div>
        {subCat?.children ? (
          <div
            onMouseLeave={() => setSubCat(null)}
            className="absolute left-full top-0"
            style={{
              width: `calc(190px * ${Math.min(subCat.children.length, 3)})`,
            }}
          >
            <div className="shadow flex flex-wrap ">
              {subCat?.children?.map(
                (subContent: CategoryTreeNode, index: number) => (
                  <div key={index} className=" w-[190px] ">
                    <Link href={"#"}>
                      <div className="w-full p-2 flex items-center space-x-2  py-3 cursor-pointer hover:bg-accent">
                        {subContent?.icon ? (
                          <subContent.icon />
                        ) : (
                          subContent?.image && (
                            <Image
                              alt={subContent.name}
                              src={subContent.image.original}
                              width={40}
                              height={40}
                              className="w-8 h-8 aspect-square"
                            />
                          )
                        )}
                        <span className="text-sm font-bold  ">
                          {subContent.name}
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-col ">
                      {subContent?.children?.map(
                        (item: CategoryTreeNode, index: number) => (
                          <Link key={index} href={"#"}>
                            <div className="p-2 text-sm cursor-pointer hover:underline">
                              {item.name}
                            </div>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CategoryDropdown;
