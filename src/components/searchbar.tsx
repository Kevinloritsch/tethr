import { View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  value,
  autoFocus = false,
}: SearchBarProps) {
  const [internal, setInternal] = useState(value);
  const lastSearched = useRef(value);
  useEffect(() => {
    setInternal(value);
  }, [value, setInternal]);
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internal === lastSearched.current) return;

      lastSearched.current = internal;
      onSearch(internal);
    }, 350);

    return () => clearTimeout(handler);
  }, [internal, onSearch]);

  const handleClear = () => {
    setInternal('');
    lastSearched.current = '';
    onSearch('');
  };

  return (
    <View className="w-10/12 flex-row items-center rounded-2xl bg-tethr-gray px-4 py-2">
      <Ionicons name="search" size={20} color="#ffffff60" />

      <TextInput
        className="ml-2 flex-1 text-white"
        placeholder={placeholder}
        placeholderTextColor="#ffffff60"
        value={internal}
        onChangeText={setInternal}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />

      {internal.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <Ionicons name="close-circle" size={20} color="#ffffff60" />
        </TouchableOpacity>
      )}
    </View>
  );
}
