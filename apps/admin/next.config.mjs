import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    const reactDir = path.dirname(require.resolve("react/package.json"));
    const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      react: reactDir,
      "react-dom": reactDomDir,
      "react/jsx-runtime": path.join(reactDir, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(reactDir, "jsx-dev-runtime.js"),
    };

    return config;
  },
};

export default nextConfig;
