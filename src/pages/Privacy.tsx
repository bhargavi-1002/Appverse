import { Link } from 'react-router-dom';
import { Cookie, Database, EyeOff, ShieldCheck, Trash2 } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useDocumentMeta } from '@/lib/seo';

export function PrivacyPage() {
  useDocumentMeta({
    title: 'Privacy',
    description:
      'AppVerse stores nothing about you on a server. Favourites, history and the install list live only in your own browser.',
    path: '/privacy',
  });

  return (
    <div className="av-container py-12">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Privacy"
          title="Nothing is collected"
          description="AppVerse has no accounts, no analytics and no server-side record of your visit."
        />

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Database size={18} className="text-subtle" aria-hidden="true" />
              What is stored on your device
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Three small lists live in your browser&apos;s local storage. They never leave the
              device, they are never uploaded, and they disappear when you clear site data.
            </p>
            <ul className="mt-4 space-y-3">
              {[
                {
                  name: 'Favourites',
                  detail:
                    'The applications you saved with the heart button. Used to populate the favourites page.',
                },
                {
                  name: 'Recently opened',
                  detail:
                    'The last dozen applications you opened, newest first. Used to show what you have been using.',
                },
                {
                  name: 'Install list',
                  detail:
                    'The applications you chose to track. It records your intent only — it cannot and does not detect what is actually installed on your device.',
                },
              ].map((item) => (
                <li key={item.name} className="rounded-lg border border-line bg-surface p-4">
                  <p className="font-display text-sm font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <EyeOff size={18} className="text-subtle" aria-hidden="true" />
              What is not collected
            </h2>
            <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-muted">
              {[
                'No analytics scripts, no tracking pixels and no advertising identifiers.',
                'No fingerprinting, no device profiling and no cross-site tracking.',
                'No cookies used for identification. The only cookie-like storage is the local list above.',
                'No third-party embeds that could profile you. Share images are generated on your device.',
                'No account, no email address, no sign-up.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Cookie size={18} className="text-subtle" aria-hidden="true" />
              Third-party applications
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              When you open an application from the catalogue, you leave AppVerse and visit a
              separately hosted site. That application has its own privacy policy and its own data
              practices — AppVerse has no visibility into them and is not responsible for them.
              AppVerse itself never proxies or mirrors their content.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Trash2 size={18} className="text-subtle" aria-hidden="true" />
              Clearing your data
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Clearing site data for appverse.vercel.app in your browser removes every list above
              immediately. Uninstalling the app removes the cached site as well.
            </p>
          </section>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm text-subtle">
          Questions?{' '}
          <a
            href="https://github.com/bhargavi-1002?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent-text underline-offset-4 hover:underline"
          >
            Raise an issue on GitHub
          </a>{' '}
          or read the{' '}
          <Link to="/about" className="font-medium text-accent-text underline-offset-4 hover:underline">
            about page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
