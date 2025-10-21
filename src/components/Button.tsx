import { Pressable, PressableProps, Text } from 'react-native';
import React from 'react';
import { cn } from '../utils/cn';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  theme?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
} & PressableProps;

// from SDK 53 (React 19) onwards, forwardRef is no longer needed, as ref is now a prop
export function Button({ title, onPress, theme = 'primary', disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mb-4 flex-row items-center justify-center rounded-md border px-5 py-3',
        theme === 'primary' && 'border-[#007AFF] bg-[#007AFF]',
        theme === 'secondary' && 'border-gray-300 bg-white',
        theme === 'tertiary' && 'border-transparent bg-transparent',
        disabled && 'opacity-50'
      )}
      disabled={disabled}
      {...rest}>
      <Text
        className={cn(
          'text-lg font-semibold tracking-wider',
          theme === 'secondary' && 'text-black',
          theme === 'primary' && 'text-white',
          theme === 'tertiary' && 'text-gray-800'
        )}>
        {title} {disabled}
      </Text>
    </Pressable>
  );
}
