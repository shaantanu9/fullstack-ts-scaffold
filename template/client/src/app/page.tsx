import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';

// The Navbar and <main> wrapper come from app/layout.tsx — this page renders
// only its own content to avoid a duplicate navbar and nested <main>.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          {APP_CONFIG.name}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          A production-ready monorepo boilerplate with TypeScript, Prisma, PostgreSQL, Redis, JWT
          authentication, Tailwind CSS, and Zustand state management.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href={ROUTES.REGISTER}>
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href={ROUTES.LOGIN}>
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>🔐 Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              JWT-based auth with access and refresh tokens, stored securely in Redis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🗄️ Database</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              PostgreSQL with Prisma ORM for type-safe database queries and migrations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Redis caching, rate limiting, helmet security headers, and PM2 clustering.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
