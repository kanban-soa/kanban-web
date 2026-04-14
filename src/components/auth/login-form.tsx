import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00000014_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="text-xs font-semibold tracking-[0.32em] text-muted-foreground">
          kan.bn
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue to your workspace.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-border/60 bg-card/80 p-6 text-left shadow-sm backdrop-blur">
          <Button className="h-10 w-full gap-2 bg-foreground text-background hover:bg-foreground/90">
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21.6 12.227c0-.818-.073-1.605-.21-2.363H12v4.47h5.386a4.6 4.6 0 0 1-1.996 3.018v2.504h3.23c1.89-1.742 2.98-4.31 2.98-7.629Z" />
              <path d="M12 22c2.7 0 4.963-.895 6.617-2.43l-3.23-2.505c-.9.603-2.05.96-3.387.96-2.604 0-4.807-1.759-5.596-4.122H3.07v2.59A10 10 0 0 0 12 22Z" />
              <path d="M6.404 13.903a6.004 6.004 0 0 1 0-3.806v-2.59H3.07a10.002 10.002 0 0 0 0 8.986l3.334-2.59Z" />
              <path d="M12 6.975c1.47 0 2.789.505 3.827 1.496l2.87-2.87C16.958 3.99 14.699 3 12 3a10 10 0 0 0-8.93 5.507l3.334 2.59C7.193 8.734 9.396 6.975 12 6.975Z" />
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                className="h-10"
              />
            </div>
            <Button variant="outline" className="h-10 w-full">
              Continue with magic link
            </Button>
            <Button asChild variant="secondary" className="h-10 w-full">
              <Link href="/workspaces/default/boards">Continue as guest</Link>
            </Button>
          </form>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
