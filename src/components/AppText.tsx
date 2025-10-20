import { Text } from 'react-native';
import { cn } from '../utils/cn';

type AppTextProps = {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'heading';
  bold?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary';
  center?: boolean;
  className?: string;
};

export function AppText({
  children,
  size = 'medium',
  bold = false,
  color = 'primary',
  center = false,
  className,
}: AppTextProps) {
  return (
    <Text
      className={cn(
        size === 'small' && 'mb-2 text-sm',
        size === 'medium' && 'mb-3 text-base',
        size === 'large' && 'mb-4 text-lg',
        size === 'heading' && 'mb-5 text-xl',
        bold && 'font-bold',
        color === 'primary' && 'text-black',
        color === 'secondary' && 'text-gray-500',
        color === 'tertiary' && 'text-gray-400',
        center && 'text-center',
        className
      )}>
      {children}
    </Text>
  );
}
