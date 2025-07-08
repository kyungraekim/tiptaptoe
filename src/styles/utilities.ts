import { theme } from './theme';

export const createFlexStyle = (
  direction: 'row' | 'column' = 'row',
  align: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 'center',
  justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' = 'flex-start',
  gap: keyof typeof theme.spacing = 'md'
) => ({
  display: 'flex',
  flexDirection: direction,
  alignItems: align,
  justifyContent: justify,
  gap: theme.spacing[gap],
});

export const createButtonStyle = (
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  disabled = false
) => {
  const baseStyle = {
    borderRadius: theme.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: theme.typography.fontWeights.medium,
    border: '1px solid',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    transition: 'all 0.15s ease',
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.gray[700],
      borderColor: theme.colors.gray[300],
    },
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      borderColor: theme.colors.success,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.white,
      borderColor: theme.colors.danger,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.gray[700],
      borderColor: 'transparent',
    },
  };

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.fontSizes.sm,
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSizes.md,
    },
    lg: {
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize: theme.typography.fontSizes.lg,
    },
  };

  return {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };
};

export const createInputStyle = (
  hasError = false,
  hasIcon = false
) => ({
  width: '100%',
  padding: hasIcon ? `${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} 36px` : `${theme.spacing.sm} ${theme.spacing.md}`,
  border: `1px solid ${hasError ? theme.colors.danger : theme.colors.gray[300]}`,
  borderRadius: theme.borderRadius.md,
  fontSize: theme.typography.fontSizes.md,
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s ease',
});

export const createCardStyle = (
  padding: keyof typeof theme.spacing = 'lg',
  shadow: keyof typeof theme.shadows = 'md'
) => ({
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing[padding],
  boxShadow: theme.shadows[shadow],
});

export const createOverlayStyle = (zIndex: keyof typeof theme.zIndex = 'overlay') => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: theme.zIndex[zIndex],
});

export const createLabelStyle = () => ({
  display: 'block',
  fontSize: theme.typography.fontSizes.md,
  fontWeight: theme.typography.fontWeights.medium,
  color: theme.colors.gray[700],
});

export const createHelperTextStyle = (isError = false) => ({
  fontSize: theme.typography.fontSizes.sm,
  color: isError ? theme.colors.danger : theme.colors.gray[500],
});

export const createSpacingStyle = (
  margin?: keyof typeof theme.spacing,
  padding?: keyof typeof theme.spacing
) => ({
  ...(margin && { margin: theme.spacing[margin] }),
  ...(padding && { padding: theme.spacing[padding] }),
});