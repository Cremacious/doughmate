// Every outbound URL the app can open, in one place.
//
// The privacy policy and terms are served by GitHub Pages from this repo's docs/
// folder, so they are edited and deployed with the app rather than living in some
// console nobody remembers the password to.
//
// `appStoreId` is empty until the App Store Connect record exists. Settings hides
// the review row while it is, which is the right behaviour anyway: a Rate row that
// opens a dead App Store page is worse than no Rate row.
export const LINKS = {
  privacy: 'https://cremacious.github.io/doughmate/',
  terms: 'https://cremacious.github.io/doughmate/terms.html',
  support: 'mailto:chrismackall3@gmail.com?subject=DoughMate',
  feedback: 'mailto:chrismackall3@gmail.com?subject=DoughMate%20feedback',
  /** Numeric App Store id, digits only, no leading "id". Empty until 1.0 is created. */
  appStoreId: '6802765361',
} as const;

/** Deep links straight to the review sheet rather than the store listing. */
export function reviewUrl(): string | null {
  if (!LINKS.appStoreId) {
    return null;
  }
  return `itms-apps://apps.apple.com/app/id${LINKS.appStoreId}?action=write-review`;
}
