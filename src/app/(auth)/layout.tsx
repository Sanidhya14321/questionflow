export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-scene flex flex-col items-center justify-center min-h-screen p-5 sm:p-8">
      <main className="auth-panel w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
