import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn, isRTL } from "@/lib/utils"
import { useParams } from "next/navigation"
import { Locale } from "@/types"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                accent: "border-transparent bg-accent text-white hover:bg-accent/80",
                gold: "border-transparent bg-background-gold text-neutral-900 hover:bg-background-gold/80",
                sale: "border-transparent bg-accent text-white hover:bg-accent/80",
                new: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                featured: "border-transparent bg-background-gold text-neutral-900 hover:bg-background-gold/80",
                outOfStock: "border-transparent bg-neutral-500 text-white hover:bg-neutral-500/80",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    rtlAware?: boolean
}

function Badge({
    className,
    variant,
    rtlAware = true,
    ...props
}: BadgeProps) {
    const params = useParams();
    const locale = params?.locale as Locale;
    const rtl = rtlAware ? isRTL(locale) : false;

    return (
        <div
            className={cn(badgeVariants({ variant }), className)}
            dir={rtl ? "rtl" : "ltr"}
            {...props}
        />
    )
}

export { Badge, badgeVariants }