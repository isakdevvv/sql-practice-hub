export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  method: HttpMethod;
  path: string;
  headers: ApiHeader[];
  body: string;
  /** Whether the body should be sent as JSON (Content-Type: application/json). */
  bodyJson: boolean;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  contentType: string;
  /** Headers as a flat list — order preserved. */
  headers: { key: string; value: string }[];
  /** Body as a string. JSON bodies are pretty-printed for display. */
  body: string;
  /** True if the response body parsed as JSON. */
  isJson: boolean;
  /** Round-trip duration in milliseconds. */
  durationMs: number;
}

/** A pre-baked example request the user can pick from a dropdown. */
export interface ApiPreset {
  id: string;
  label: string;
  description: string;
  request: ApiRequest;
}
