import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      react: path.join(__dirname, "node_modules/react"),
      "react-dom": path.join(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.join(__dirname, "node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(__dirname, "node_modules/react/jsx-dev-runtime.js"),
    };

    return config;
  },
};

export default nextConfig;
