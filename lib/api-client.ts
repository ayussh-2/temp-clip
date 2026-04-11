import type {
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionResponse,
  UpdateSessionRequest,
  UpdateSessionResponse,
  DeleteSessionResponse,
  ApiError,
} from "@/types/session";

type RequestInterceptor = (
  config: RequestInit,
) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = <T>(response: Response, data: T) => T | Promise<T>;
type ErrorInterceptor = (error: ApiError) => void | Promise<void>;

class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(
    config: RequestInit,
  ): Promise<RequestInit> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  private async applyResponseInterceptors<T>(
    response: Response,
    data: T,
  ): Promise<T> {
    let modifiedData = data;
    for (const interceptor of this.responseInterceptors) {
      modifiedData = await interceptor(response, modifiedData);
    }
    return modifiedData;
  }

  private async applyErrorInterceptors(error: ApiError): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const modifiedConfig = await this.applyRequestInterceptors(config);

    const response = await fetch(`${this.baseUrl}${endpoint}`, modifiedConfig);

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      await this.applyErrorInterceptors(error);
      throw error;
    }

    return this.applyResponseInterceptors(response, data);
  }

  async createSession(
    body: CreateSessionRequest = {},
  ): Promise<CreateSessionResponse> {
    return this.request<CreateSessionResponse>("/session", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getSession(code: string): Promise<GetSessionResponse> {
    return this.request<GetSessionResponse>(`/session/${code.toUpperCase()}`, {
      method: "GET",
    });
  }

  async updateSession(
    code: string,
    body: UpdateSessionRequest,
  ): Promise<UpdateSessionResponse> {
    return this.request<UpdateSessionResponse>(
      `/session/${code.toUpperCase()}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    );
  }

  async deleteSession(code: string): Promise<DeleteSessionResponse> {
    return this.request<DeleteSessionResponse>(
      `/session/${code.toUpperCase()}`,
      {
        method: "DELETE",
      },
    );
  }

  getStreamUrl(code: string): string {
    return `${this.baseUrl}/session/${code.toUpperCase()}/stream`;
  }
}

export const apiClient = new ApiClient();

apiClient.addRequestInterceptor((config) => {
  console.log("[API Request]", config.method, config);
  return config;
});

apiClient.addResponseInterceptor((response, data) => {
  console.log("[API Response]", response.status, data);
  return data;
});

apiClient.addErrorInterceptor((error) => {
  console.error("[API Error]", error.error.code, error.error.message);
});
