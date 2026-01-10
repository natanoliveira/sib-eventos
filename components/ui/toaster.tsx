"use client"

// import { info, error } from "console"
// import { icons, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      // icons={{
      //   success: <CircleCheckIcon className="size-4" />,
      //   info: <InfoIcon className="size-4" />,
      //   warning: <TriangleAlertIcon className="size-4" />,
      //   error: <OctagonXIcon className="size-4" />,
      //   loading: <Loader2Icon className="size-4 animate-spin" />,
      // }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-gray-400 group-[.toast]:hover:text-gray-900 group-[.toast]:border-0 group-[.toast]:hover:bg-gray-100",
          error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200",
          success: "group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200",
          warning: "group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900 group-[.toast]:border-yellow-200",
          info: "group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 group-[.toast]:border-blue-200",
        },
        closeButton: true,
      }}
      {...props}
    />
  )
}

export { Toaster }
