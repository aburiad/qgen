import * as React from "react";

import { cn } from "./utils";

/**
 * Sanitize text by removing corrupted unicode escape sequences
 * Removes patterns like u09ac, u09ba, etc
 */
const sanitizeText = (text: any): string => {
  if (!text) return '';
  if (typeof text !== 'string') return text;
  return text.replace(/u[0-9a-fA-F]{4}/g, '').trim();
};

/**
 * Recursively sanitize children
 */
const sanitizeChildren = (children: any): any => {
  if (typeof children === 'string') {
    return sanitizeText(children);
  }
  if (Array.isArray(children)) {
    return children.map(sanitizeChildren);
  }
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {}, sanitizeChildren(children.props.children));
  }
  return children;
};

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h4">
>(({ className, children, ...props }, ref) => {
  return (
    <h4
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {sanitizeChildren(children)}
    </h4>
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {sanitizeChildren(children)}
    </p>
  );
});
CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
});
CardAction.displayName = "CardAction";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export {
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
};
