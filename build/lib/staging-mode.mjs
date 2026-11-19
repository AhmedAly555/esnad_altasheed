// The single place that decides what a staging deploy changes. Everything else asks this module.
export const isStagingDeploy = () => process.env.ESNAD_STAGING === "1";

const NOINDEX = "noindex, nofollow";

/** Staging overrides the page's own robots value; production keeps it. */
export const effectiveRobots = (robots) => (isStagingDeploy() ? NOINDEX : robots);

export const stagingRobotsTxt = "User-agent: *\nDisallow: /\n";
export const stagingHeaders = `/*\n  X-Robots-Tag: ${NOINDEX}\n`;
