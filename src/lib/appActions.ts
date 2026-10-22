import type { AppEntry } from '@/data/schema';
import { Download, Eye, Play } from 'lucide-react';

export type PrimaryAction =
  | { kind: 'open'; label: string; to: string; icon: typeof Play; canInstall: boolean }
  | { kind: 'source'; label: string; href: string; icon: typeof Download; canInstall: boolean }
  | { kind: 'details'; label: string; to: string; icon: typeof Eye; canInstall: boolean };

/**
 * Decide which call to action an app should show.
 *
 * The rule is simple and deliberately conservative: an "Install" action only
 * appears when there is something real to install. Everything else opens in
 * the browser or points at the source.
 */
export function resolvePrimaryAction(app: AppEntry): PrimaryAction {
  const hasLiveApp = Boolean(app.liveUrl) && app.deploymentStatus === 'live';
  const hasRealInstaller =
    app.installationType === 'apk' ||
    app.installationType === 'desktop' ||
    (app.installationType === 'pwa' && app.verificationStatus === 'verified');

  if (hasLiveApp) {
    return {
      kind: 'open',
      label: 'Open app',
      to: `/launch/${app.slug}`,
      icon: Play,
      canInstall: hasRealInstaller,
    };
  }

  if (app.repositoryUrl) {
    return {
      kind: 'source',
      label: app.installationType === 'github' ? 'View source' : 'View project',
      href: app.repositoryUrl,
      icon: Download,
      canInstall: hasRealInstaller,
    };
  }

  return {
    kind: 'details',
    label: 'View details',
    to: `/apps/${app.slug}`,
    icon: Eye,
    canInstall: hasRealInstaller,
  };
}
