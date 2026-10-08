export interface PortalConfig {
  appName: string;
  manifestUrl: string;
  loginUrl: string;
  registerUrl: string;
  installation: {
    type: "pwa";
    secureOriginRequired: true;
    windows: { available: false; instructions: string[] };
    mobile: { available: false; instructions: string[] };
  };
}

export function getPortalConfig(): PortalConfig {
  return {
    appName: "ALUPBESK",
    manifestUrl: "/manifest.json",
    loginUrl: "/login",
    registerUrl: "/register",
    installation: {
      type: "pwa",
      secureOriginRequired: true,
      windows: {
        available: false,
        instructions: [
          "Buka halaman ini dengan Chrome atau Microsoft Edge.",
          "Pilih ikon Instal aplikasi di address bar atau menu browser.",
        ],
      },
      mobile: {
        available: false,
        instructions: [
          "Android: buka menu browser lalu pilih Instal aplikasi atau Tambahkan ke layar utama.",
          "iPhone/iPad: buka menu Bagikan di Safari lalu pilih Tambahkan ke Layar Utama.",
        ],
      },
    },
  };
}
