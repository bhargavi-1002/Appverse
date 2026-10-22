import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { PwaUpdateToast } from '@/components/PwaUpdateToast';
import { AppCardSkeleton } from '@/components/Skeleton';

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('@/pages/Explore').then((m) => ({ default: m.ExplorePage })));
const AppDetailPage = lazy(() =>
  import('@/pages/AppDetail').then((m) => ({ default: m.AppDetailPage })),
);
const LaunchPage = lazy(() => import('@/pages/Launch').then((m) => ({ default: m.LaunchPage })));
const InstallationsPage = lazy(() =>
  import('@/pages/Installations').then((m) => ({ default: m.InstallationsPage })),
);
const FavoritesPage = lazy(() =>
  import('@/pages/Favorites').then((m) => ({ default: m.FavoritesPage })),
);
const AboutPage = lazy(() => import('@/pages/About').then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('@/pages/Privacy').then((m) => ({ default: m.PrivacyPage })));
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage })),
);
const NotFoundPage = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="av-container py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppCardSkeleton />
        <AppCardSkeleton />
        <AppCardSkeleton />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/apps/:slug" element={<AppDetailPage />} />
              <Route path="/launch/:slug" element={<LaunchPage />} />
              <Route path="/install" element={<InstallationsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <PwaUpdateToast />
    </BrowserRouter>
  );
}
