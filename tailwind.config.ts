import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                border: "var(--border-color)",
                "chat-bg": "var(--chat-bg)",
                "message-user": "var(--message-user)",
                "message-ai": "var(--message-ai)",
                accent: "var(--accent)",
                "accent-hover": "var(--accent-hover)",
                "sidebar-bg": "var(--sidebar-bg)",
            },
        },
    },
    plugins: [],
};
export default config;
