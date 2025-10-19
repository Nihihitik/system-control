"use client";

import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  toggleAriaLabelShow?: string;
  toggleAriaLabelHide?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInputImpl(
  { className, toggleAriaLabelShow = "Показать пароль", toggleAriaLabelHide = "Скрыть пароль", ...props },
  ref
) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        className={clsx("pr-10", className)}
        ref={ref}
        type={show ? "text" : "password"}
        {...props}
      />
      <Button
        className="-translate-y-1/2 absolute right-1 top-1/2 h-8 w-8 p-0"
        aria-label={show ? toggleAriaLabelHide : toggleAriaLabelShow}
        onClick={() => setShow((s) => !s)}
        type="button"
        variant="ghost"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
});
