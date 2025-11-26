module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      'module:react-native-dotenv',
      ...(isTest ? [] : ['react-native-reanimated/plugin', 'react-native-worklets/plugin']),
    ],
  };
};
