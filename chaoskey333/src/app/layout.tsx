import type { Metadata } from "next";

const environment = process.env.NEXT_PUBLIC_ENV || 'production';

export const metadata: Metadata = {
  title: "ChaosKey333 Vault",
  description:
    "Secure vault environment for ChaosKey333",
  ...(environment === 'preview' || environment === 'vault-test' ? {
    robots: 'noindex,nofollow'
  } : {})
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {(environment === 'preview' || environment === 'vault-test') && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
            .min-h-screen { min-height: 100vh; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .bg-gray-50 { background-color: #f9fafb; }
            .max-w-md { max-width: 28rem; }
            .w-full { width: 100%; }
            .space-y-8 > * + * { margin-top: 2rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .text-center { text-align: center; }
            .text-3xl { font-size: 1.875rem; }
            .text-sm { font-size: 0.875rem; }
            .font-extrabold { font-weight: 800; }
            .text-gray-900 { color: #111827; }
            .text-gray-600 { color: #4b5563; }
            .text-red-600 { color: #dc2626; }
            .rounded-md { border-radius: 0.375rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .border { border-width: 1px; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-transparent { border-color: transparent; }
            .bg-indigo-600 { background-color: #4f46e5; }
            .text-white { color: #ffffff; }
            input, button { width: 100%; padding: 0.5rem; margin: 0.5rem 0; }
            button { background: #4f46e5; color: white; border: none; cursor: pointer; }
            button:hover { background: #4338ca; }
            button:disabled { opacity: 0.5; cursor: not-allowed; }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
