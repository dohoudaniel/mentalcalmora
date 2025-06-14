
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPassword: externalShowPassword, onTogglePassword, ...props }, ref) => {
    const [internalShowPassword, setInternalShowPassword] = useState(false);
    
    // Use external state if provided, otherwise use internal state
    const showPassword = externalShowPassword !== undefined ? externalShowPassword : internalShowPassword;
    const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={className}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={togglePassword}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
