export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.25)_0,_transparent_45%),radial-gradient(circle_at_bottom_left,_hsl(var(--secondary)/0.25)_0,_transparent_40%)]">
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
