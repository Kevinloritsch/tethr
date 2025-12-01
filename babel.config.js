module.exports = function (api) {
  const isTest = api.env('test');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [!isTest && 'react-native-reanimated/plugin', 'module:react-native-dotenv'].filter(
      Boolean
    ),
  };
};
