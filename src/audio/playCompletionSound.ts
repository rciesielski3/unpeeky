import { Audio } from "expo-av";

// React Native bundles static audio assets through require().
// eslint-disable-next-line @typescript-eslint/no-var-requires
const completionSound = require("../../assets/sounds/completion.wav");

let audioModePromise: Promise<void> | null = null;

function ensureAudioMode(): Promise<void> {
  audioModePromise ??= Audio.setAudioModeAsync({
    playsInSilentModeIOS: true
  }).catch((error: unknown) => {
    audioModePromise = null;
    throw error;
  });

  return audioModePromise;
}

export async function playCompletionSound(): Promise<void> {
  try {
    await ensureAudioMode();

    const { sound } = await Audio.Sound.createAsync(completionSound, {
      shouldPlay: true,
      volume: 0.7
    });

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        void sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn("Failed to play completion sound:", error);
  }
}
