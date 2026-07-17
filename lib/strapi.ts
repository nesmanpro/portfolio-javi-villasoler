/**
 * Minimal, project-agnostic Strapi REST client.
 *
 * Reusable in any project: point NEXT_PUBLIC_STRAPI_URL at a Strapi
 * instance and call `strapiFetch("endpoint")`. Everything specific to
 * THIS site (endpoints, contracts, transforms, fallbacks) lives in
 * lib/content.ts — swap that file and the client keeps working.
 */

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1338";

export interface StrapiListMeta {
  pagination?: { page: number; pageSize: number; pageCount: number; total: number };
}

interface StrapiEnvelope<T> {
  data: T;
  meta?: StrapiListMeta;
}

export class StrapiError extends Error {
  constructor(
    public status: number,
    public endpoint: string
  ) {
    super(`Strapi responded ${status} for ${endpoint}`);
  }
}

/**
 * Fetch `/api/<endpoint>` and unwrap Strapi's `{ data }` envelope.
 * Works in server and client components. `query` accepts Strapi REST
 * params (populate, filters, sort, fields…).
 */
export async function strapiFetch<T>(
  endpoint: string,
  {
    query,
    revalidateSeconds = 60,
  }: { query?: Record<string, string>; revalidateSeconds?: number } = {}
): Promise<T> {
  const url = new URL(`/api/${endpoint.replace(/^\/+/, "")}`, STRAPI_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) throw new StrapiError(res.status, endpoint);
  const json = (await res.json()) as StrapiEnvelope<T>;
  return json.data;
}

/** Resolve a Strapi media object or relative upload path to an absolute URL. */
export function strapiMediaUrl(
  media: { url?: string } | string | null | undefined
): string | undefined {
  const url = typeof media === "string" ? media : media?.url;
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}
