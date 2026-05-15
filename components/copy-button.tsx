"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export function CopyButton({
  value,
  label = "Copy",
  className,
  variant = "secondary",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden />
          {label}
        </>
      )}
    </Button>
  );
}
