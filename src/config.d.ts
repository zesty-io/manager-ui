export {};

declare global {
  interface AppConfig {
    ENV: string;
    API_INSTANCE: string;
    API_INSTANCE_PROTOCOL: string;
    AMPLITUDE_API_KEY: string;
    DOMAIN: string;
  }

  interface Window {
    CONFIG: AppConfig;
    zesty?: any;
    zestyStore?: any;
    randomQuote?: { quote: string; quotee: string };
  }
}
