import type { Metadata } from "next";
import "./globals.css";
import { inter, manrope } from "@/fonts";

export const metadata: Metadata = {
    title: "TEMPCLIP - Ephemeral Clipboard",
    description:
        "Securely move snippets and links between devices. Data disappears instantly when the session expires.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${manrope.variable} antialiased`}
        >
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add,add_circle,arrow_forward,blur_on,bolt,content_copy,delete_sweep,download,history,home,hub,lock,login,qr_code_2,timer,verified_user&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
