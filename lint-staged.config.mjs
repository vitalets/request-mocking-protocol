export default {
  // `examples/` are self-contained sub-projects with their own toolchains, so
  // the leading `+(!(examples)/)` only matches ts/js files whose path segments
  // are all outside any `examples` directory.
  '+(!(examples)/)*.{ts,js}': [
    'eslint --fix --no-warn-ignored',
    'prettier --write --ignore-unknown',
  ],
  '!(*.{ts,js})': ['prettier --write --ignore-unknown'],
};
