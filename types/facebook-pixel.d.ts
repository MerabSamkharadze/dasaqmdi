interface FacebookPixelEvent {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  status?: string;
  [key: string]: unknown;
}

type FbqFunction = {
  (action: "init", pixelId: string): void;
  (action: "track", event: string, params?: FacebookPixelEvent): void;
  (action: "trackCustom", event: string, params?: FacebookPixelEvent): void;
  (action: "consent", mode: string): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

interface Window {
  fbq: FbqFunction;
  _fbq: FbqFunction;
}
