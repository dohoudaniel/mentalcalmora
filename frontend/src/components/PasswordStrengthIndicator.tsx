import { Check, X } from 'lucide-react';
import { passwordRequirements, checkPasswordStrength } from '@/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

const PasswordStrengthIndicator = ({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) => {
  const { strength, color, score, totalRequirements } = checkPasswordStrength(password);

  const getStrengthColor = () => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / totalRequirements) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${color === 'red' ? 'text-red-600' : color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
          {getStrengthText()}
        </span>
      </div>

      {showRequirements && (
        <div className="space-y-1">
          {passwordRequirements.map((requirement, index) => {
            const isPassed = requirement.test(password);
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                {isPassed ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
                  {requirement.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
