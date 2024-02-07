"use client";

import * as React from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "./dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 dark:[&_[cmdk-group-heading]]:text-slate-400">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

function SearchIcon() {
  return (
    <div className="absolute w-6 h-6 pl-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M21.07 16.83L19 14.71C18.5547 14.2868 17.9931 14.0063 17.3872 13.9047C16.7813 13.8032 16.1589 13.8851 15.6 14.14L14.7 13.24C15.7605 11.8229 16.2449 10.0567 16.0555 8.29684C15.8662 6.537 15.0172 4.91423 13.6794 3.7552C12.3417 2.59618 10.6145 1.98696 8.84565 2.05019C7.07678 2.11341 5.39754 2.84439 4.14596 4.09597C2.89438 5.34755 2.1634 7.0268 2.10017 8.79567C2.03695 10.5645 2.64617 12.2917 3.80519 13.6294C4.96421 14.9672 6.58699 15.8162 8.34683 16.0055C10.1067 16.1949 11.8729 15.7106 13.29 14.65L14.18 15.54C13.8951 16.0996 13.793 16.7346 13.8881 17.3553C13.9831 17.9761 14.2706 18.5513 14.71 19L16.83 21.12C17.3925 21.6818 18.155 21.9974 18.95 21.9974C19.745 21.9974 20.5075 21.6818 21.07 21.12C21.3557 20.8406 21.5828 20.5069 21.7378 20.1386C21.8928 19.7702 21.9726 19.3746 21.9726 18.975C21.9726 18.5754 21.8928 18.1798 21.7378 17.8114C21.5828 17.4431 21.3557 17.1094 21.07 16.83ZM12.59 12.59C11.8902 13.288 10.9993 13.7629 10.0297 13.9549C9.06017 14.1468 8.05549 14.047 7.14259 13.6682C6.2297 13.2894 5.44955 12.6485 4.9007 11.8265C4.35185 11.0046 4.05893 10.0384 4.05893 9.05C4.05893 8.06163 4.35185 7.09544 4.9007 6.27347C5.44955 5.45149 6.2297 4.81062 7.14259 4.43182C8.05549 4.05301 9.06017 3.95325 10.0297 4.14515C10.9993 4.33706 11.8902 4.812 12.59 5.51C13.0556 5.97446 13.4251 6.52621 13.6771 7.13367C13.9292 7.74112 14.0589 8.39233 14.0589 9.05C14.0589 9.70768 13.9292 10.3589 13.6771 10.9663C13.4251 11.5738 13.0556 12.1255 12.59 12.59ZM19.66 19.66C19.567 19.7537 19.4564 19.8281 19.3346 19.8789C19.2127 19.9297 19.082 19.9558 18.95 19.9558C18.818 19.9558 18.6873 19.9297 18.5654 19.8789C18.4436 19.8281 18.333 19.7537 18.24 19.66L16.12 17.54C16.0263 17.447 15.9519 17.3364 15.9011 17.2146C15.8503 17.0927 15.8242 16.962 15.8242 16.83C15.8242 16.698 15.8503 16.5673 15.9011 16.4454C15.9519 16.3236 16.0263 16.213 16.12 16.12C16.213 16.0263 16.3236 15.9519 16.4454 15.9011C16.5673 15.8503 16.698 15.8242 16.83 15.8242C16.962 15.8242 17.0927 15.8503 17.2146 15.9011C17.3364 15.9519 17.447 16.0263 17.54 16.12L19.66 18.24C19.7537 18.333 19.8281 18.4436 19.8789 18.5654C19.9296 18.6873 19.9558 18.818 19.9558 18.95C19.9558 19.082 19.9296 19.2127 19.8789 19.3346C19.8281 19.4564 19.7537 19.567 19.66 19.66Z"
        fill="black"
      />
    </svg>
    </div>
  );
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className=" relative flex items-center border border-[#B7B1A6] bg-white"  cmdk-input-wrapper="">
    <SearchIcon></SearchIcon>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-12 w-full py-3 pl-10 text-base font-medium focus:border focus:border-black outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-slate-950 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 dark:text-slate-50 dark:[&_[cmdk-group-heading]]:text-slate-400",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-slate-200 dark:bg-slate-800", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center px-2 py-2.5 outline-none aria-selected:bg-[#42FF77] aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-slate-500 dark:text-slate-400",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
