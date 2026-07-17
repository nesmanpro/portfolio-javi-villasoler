"use client";

import { useEffect, useState } from "react";
import { strapiFetch } from "@/lib/strapi";

/**
 * Generic CMS-content hook — the reusable core of the template.
 *
 * Renders instantly with `fallback` (so the site works with the CMS down
 * or during SSR), fetches the endpoint once per session, maps the API
 * shape to the view model with `transform`, and caches the result in
 * memory so navigating between pages never refetches.
 *
 * To reuse in another project you only change the endpoint + contract:
 *   const { data } = useStrapiContent("menu", {
 *     transform: (api: ApiMenu) => ({ items: api.items }),
 *     fallback: { items: [] },
 *   });
 */

const memoryCache = new Map<string, unknown>();

export interface StrapiContentState<TView> {
  /** View-model data: fallback first, CMS data once loaded */
  data: TView;
  /** True once `data` comes from the CMS instead of the fallback */
  isFromCms: boolean;
  /** Network/HTTP error, if the CMS could not be reached */
  error: Error | null;
}

export function useStrapiContent<TApi, TView>(
  endpoint: string,
  {
    query,
    transform,
    fallback,
  }: {
    query?: Record<string, string>;
    transform: (api: TApi) => TView;
    fallback: TView;
  }
): StrapiContentState<TView> {
  const cacheKey = `${endpoint}?${JSON.stringify(query ?? {})}`;

  const [state, setState] = useState<StrapiContentState<TView>>(() =>
    memoryCache.has(cacheKey)
      ? { data: memoryCache.get(cacheKey) as TView, isFromCms: true, error: null }
      : { data: fallback, isFromCms: false, error: null }
  );

  useEffect(() => {
    if (memoryCache.has(cacheKey)) return;
    let alive = true;
    strapiFetch<TApi>(endpoint, { query })
      .then((api) => {
        if (api == null) return;
        const view = transform(api);
        memoryCache.set(cacheKey, view);
        if (alive) setState({ data: view, isFromCms: true, error: null });
      })
      .catch((error: Error) => {
        if (alive) setState((prev) => ({ ...prev, error }));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- transform/fallback are stable per call site
  }, [cacheKey]);

  return state;
}
