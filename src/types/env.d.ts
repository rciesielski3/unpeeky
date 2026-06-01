declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
