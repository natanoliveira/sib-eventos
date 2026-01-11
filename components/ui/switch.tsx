"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    // <SwitchPrimitive.Root
    //   data-slot="switch"
    //   className={cn(
    //     "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    //     className,
    //   )}
    //   {...props}
    // >
    //   <SwitchPrimitive.Thumb
    //     data-slot="switch-thumb"
    //     className={cn(
    //       "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
    //     )}
    //   />
    // </SwitchPrimitive.Root>

    // Estiloso Premium
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-[1.15rem] w-9 shrink-0 items-center rounded-full border",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200",
        "dark:data-[state=unchecked]:bg-input/80",
        "transition-all duration-500 ease-out",
        "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white dark:bg-card",
          "transition-transform duration-500 ease-out",
          // movimento
          "data-[state=checked]:translate-x-[calc(100%-1px)] data-[state=unchecked]:translate-x-0",
          // sombra premium maior
          "shadow-[0_4px_10px_rgba(0,0,0,0.28)]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
