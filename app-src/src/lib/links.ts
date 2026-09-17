// Every outbound URL the app can open, in one place.
//
// The privacy policy and terms are served by GitHub Pages from this repo's docs/
// folder, so they are edited and deployed with the app rather than living in some
// console nobody remembers the password to.
//
// `appStoreId` is the numeric id of the App Store Connect record, which exists
// ahead of release so TestFlight and submission have somewhere to attach to. 1.0
// itself has not shipped yet (as of this writing it hasn't even been submitted),
// but the id does not change between the record's creation and release, so
// Settings shows the Rate row now rather than waiting on a launch that has no
// bearing on whether the link works.
export const LINKS = {
  privacy: 'https://cremacious.github.io/doughmate/',
  terms: 'https://cremacious.github.io/doughmate/terms.html',
  support: 'mailto:chrismackall3@gmail.com?subject=DoughMate',
  feedback: 'mailto:chrismackall3@gmail.com?subject=DoughMate%20feedback',
  /** Numeric App Store id, digits only, no leading "id". Set once the App Store Connect record exists. */
  appStoreId: '6802765361',
} as const;

/** Deep links straight to the review sheet rather than the store listing. */
export function reviewUrl(): string | null {
  if (!LINKS.appStoreId) {
    return null;
  }
  return `itms-apps://apps.apple.com/app/id${LINKS.appStoreId}?action=write-review`;
}
