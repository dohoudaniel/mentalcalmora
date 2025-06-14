
export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "One special character",
    test: (password: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  },
];

export const checkPasswordStrength = (password: string) => {
  const passedRequirements = passwordRequirements.filter(req => req.test(password));
  const score = passedRequirements.length;
  
  let strength: 'weak' | 'medium' | 'strong';
  let color: string;
  
  if (score < 3) {
    strength = 'weak';
    color = 'red';
  } else if (score < 5) {
    strength = 'medium';
    color = 'yellow';
  } else {
    strength = 'strong';
    color = 'green';
  }
  
  return {
    score,
    strength,
    color,
    passedRequirements: passedRequirements.length,
    totalRequirements: passwordRequirements.length,
    isValid: score === passwordRequirements.length,
  };
};
