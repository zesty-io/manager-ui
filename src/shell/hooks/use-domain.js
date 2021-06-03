import { useGetDomainsQuery } from "shell/services/accounts";

export function useDomain() {
  const domainsQuery = useGetDomainsQuery();
  const domains = domainsQuery.data;

  // Let WebEngine figure out https & www settings
  const format = domain => `http://${domain}`;

  if (Array.isArray(domains) && domains.length) {
    /**
     * By default when an instance is created it gets a .zesty.dev domain
     * linked to the 'dev' branch. We look for a domain record which is neither.
     * That is most likely the primary domain.
     */

    const prodDomains = domains
      .filter(domain => domain.branch !== "dev")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const customDomain = prodDomains.find(
      domain => !domain.domain.includes(".zesty.dev")
    );

    if (customDomain) {
      return format(customDomain.domain);
    } else {
      if (prodDomains.length) {
        // This is most likely a .zesty.dev domain which has been pointed at 'live'
        // Useful for demo instances which do not mind a zesty vanity domain
        return format(prodDomains[0].domain);
      } else {
        // No domain has been pointed at 'live' branch
        return null;
      }
    }
  } else {
    // No domains are configured.
    // Most likely an older instance before .zesty.dev domains were auto created
    return null;
  }
}
