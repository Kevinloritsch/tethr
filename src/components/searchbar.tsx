import { View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View className="w-11/12 flex-row items-center rounded-2xl bg-tethr-gray px-4 py-2">
      <Ionicons name="search" size={20} color="#ffffff60" />

      <TextInput
        className="ml-2 flex-1 text-white"
        placeholder={placeholder}
        placeholderTextColor="#ffffff60"
        value={query}
        onChangeText={handleChange}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <Ionicons name="close-circle" size={20} color="#ffffff60" />
        </TouchableOpacity>
      )}
    </View>
  );
}
