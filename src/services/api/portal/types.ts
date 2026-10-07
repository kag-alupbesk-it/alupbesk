export interface PortalConfig {
  appName: string;
  manifestUrl: string;
  loginUrl: string;
  registerUrl: string;
  installation: {
    type: "pwa";
    secureOriginRequired: true;
    windows: { available: boolean; instructions: string[] };
    mobile: { available: boolean; instructions: string[] };
  };
}
