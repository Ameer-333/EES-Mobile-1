
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-md", // Maintained a subtle default shadow
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 md:p-6", className)} // Adjusted padding
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement, // Corrected to HTMLDivElement as it's a div wrapper
  React.HTMLAttributes<HTMLHeadingElement> // Props for an H-element semantic
>(({ className, ...props }, ref) => (
  // Changed to h3 for semantic correctness, but props are for div
  <h3
    ref={ref as React.Ref<HTMLHeadingElement>} // Cast ref if needed, or use a div and style as h3
    className={cn(
      "text-xl md:text-2xl font-semibold leading-tight tracking-tight", // Adjusted sizes
      className
    )}
    {...(props as React.HTMLAttributes<HTMLHeadingElement>)} // Cast props
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement, // Corrected to HTMLDivElement
  React.HTMLAttributes<HTMLParagraphElement> // Props for a p-element semantic
>(({ className, ...props }, ref) => (
  <p
    ref={ref as React.Ref<HTMLParagraphElement>} // Cast ref
    className={cn("text-sm text-muted-foreground", className)}
    {...(props as React.HTMLAttributes<HTMLParagraphElement>)} // Cast props
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 md:p-6 pt-0", className)} {...props} /> // Adjusted padding
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 md:p-6 pt-0", className)} // Adjusted padding
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
