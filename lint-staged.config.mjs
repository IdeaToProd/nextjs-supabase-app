const config = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write", () => "tsc --noEmit"],
  "*.{js,jsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,yml,yaml}": ["prettier --write"],
};

export default config;
