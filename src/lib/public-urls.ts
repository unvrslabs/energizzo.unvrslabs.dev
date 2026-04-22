const DEFAULT_PUBLIC_SITE_URL = "https://ildispaccio.energy";
const DEFAULT_ADMIN_SITE_URL = "https://dash.ildispaccio.energy";

export function getPublicSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL;
  return (envUrl ?? DEFAULT_PUBLIC_SITE_URL).replace(/\/$/, "");
}

export function getAdminSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_ADMIN_SITE_URL ?? process.env.ADMIN_SITE_URL;
  return (envUrl ?? DEFAULT_ADMIN_SITE_URL).replace(/\/$/, "");
}

export function getSurveyUrl(token: string): string {
  return `${getPublicSiteUrl()}/invito-network/${token}`;
}

export function getPodcastInviteUrl(token: string): string {
  return `${getPublicSiteUrl()}/podcast/invito/${token}`;
}

export function getGuestDashboardUrl(guestId: string): string {
  return `${getAdminSiteUrl()}/dashboard/podcast/ospiti/${guestId}`;
}
