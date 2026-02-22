import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#3b82f6", hover: "#2563eb", light: "#eff6ff" },
      },
    },
  },
  plugins: [],
} satisfies Config;
