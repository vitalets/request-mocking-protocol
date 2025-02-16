export default {
  '*.{ts,js}': ['eslint --fix --no-warn-ignored', 'prettier --write --ignore-unknown'],
  '!(*.{ts,js})': ['prettier --write --ignore-unknown'],
};
