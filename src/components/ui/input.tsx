import * as React from "react"

import { cn, isRTL } from "@/lib/utils"
import { useParams } from "next/navigation"
import { Locale } from "@/types"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    rtlAware?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, rtlAware = true, ...props }, ref) => {
        const params = useParams();
        const locale = params?.locale as Locale;
        const rtl = rtlAware ? isRTL(locale) : false;

        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    rtl && "text-right",
                    className
                )}
                dir={rtl ? "rtl" : "ltr"}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }