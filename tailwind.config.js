/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Public Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "#2E7D32", dark: "#1B5E20", soft: "#E8F5E9" },
        accent: { DEFAULT: "#1976D2", soft: "#E3F2FD" },
        /** Superfícies inspiradas no layout Stitch / FieldOps */
        surface: {
          dark: "#121212",
          page: "#F5F5F5",
          input: "#E8E8E8",
          card: "#FFFFFF",
          elevated: "#EEEEEE",
        },
        stitch: {
          info: "#E3F2FD",
          infoBorder: "#90CAF9",
          infoText: "#1565C0",
        },
      },
      boxShadow: {
        stitch: "0 4px 24px rgba(0,0,0,0.08), 0 12px 48px rgba(0,0,0,0.06)",
        nav: "0 -8px 32px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
