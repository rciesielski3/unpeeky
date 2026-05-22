export const strings = {
  app: {
    loading: "Ładowanie..."
  },
  addGoal: {
    title: "Nowy cel",
    childNamePlaceholder: "Imię dziecka",
    rewardNamePlaceholder: "Nazwa nagrody",
    tileCountLabel: "Liczba kafelków",
    photoStepLabel: "1. Zdjęcie nagrody",
    photoPlaceholder: "Zrób zdjęcie lub wybierz z galerii",
    photoEmptyLabel: "Zdjęcie",
    cameraButton: "Zrób zdjęcie",
    galleryButton: "Wybierz z galerii",
    cameraPermissionDenied: "Aparat wymaga zgody w ustawieniach telefonu.",
    galleryPermissionDenied: "Galeria wymaga zgody w ustawieniach telefonu.",
    imagePickerError: "Nie udało się wybrać zdjęcia. Spróbuj ponownie.",
    avatarLabel: "Wybierz avatar",
    saveButton: "Zapisz cel",
    backButton: "Wróć"
  },
  child: {
    greeting: (childName: string) => `Hej, ${childName}!`,
    reward: (rewardName: string) => `Nagroda: ${rewardName}`,
    progress: (completedTasks: number, totalTasks: number) => `${completedTasks} z ${totalTasks} kafelków odkrytych`,
    remaining: (remainingTasks: number) => `Jeszcze ${remainingTasks} i nagroda Twoja!`,
    encouragementTitle: "Jeszcze trochę!",
    completedTitle: "Brawo!",
    completedBody: "Nagroda jest odkryta. Czas świętować!",
    completeButton: "Nagroda gotowa",
    approveTaskButton: "Zatwierdź zadanie",
    backToParentButton: "Wróć do rodzica"
  },
  approveTask: {
    title: "Zatwierdź zadanie",
    subtitle: "Rodzic potwierdza postęp",
    pinTitle: "PIN rodzica",
    pinMeta: "Wpisz PIN, żeby zatwierdzić zadanie",
    pinPlaceholder: "0000",
    pinError: "PIN jest niepoprawny.",
    progress: (completedTasks: number, totalTasks: number) => `${completedTasks} z ${totalTasks} zadań`,
    remaining: (remainingTasks: number) => `Zostało ${remainingTasks}`,
    approveButton: "Zatwierdź zadanie",
    childViewButton: "Pokaż widok dziecka",
    completeButton: "Cel ukończony",
    backButton: "Wróć"
  },
  goals: {
    title: "Unpeeky",
    subtitle: "Cele i postępy",
    settingsButton: "Ustawienia",
    emptyTitle: "Brak celów",
    emptyText: "Dodaj pierwszy cel i sprawdź pełną pętlę lokalnie.",
    newGoalButton: "Nowy cel",
    thumbnailLabel: (rewardName: string) => `Zdjęcie nagrody: ${rewardName}`,
    cardProgress: (childName: string, completedTasks: number, totalTasks: number) =>
      `${childName} - ${completedTasks}/${totalTasks}`
  },
  settings: {
    title: "Ustawienia",
    premiumTitle: "Premium",
    premiumMeta: "Reklamy będą tylko w widoku rodzica",
    notificationTitle: "Powiadomienie",
    notificationMeta: "Codzienna godzina przypomnienia",
    notificationTimePlaceholder: "HH:MM",
    notificationTimeError: "Wpisz godzinę w formacie HH:MM.",
    parentPinTitle: "PIN rodzica",
    parentPinMeta: "4 cyfry do zatwierdzania zadań",
    parentPinPlaceholder: "1234",
    parentPinError: "PIN musi mieć dokładnie 4 cyfry.",
    resetTitle: "Reset danych",
    resetMeta: "Usuń lokalne cele i postępy",
    resetButton: "Resetuj cele",
    notificationScheduled: "Przypomnienie zapisane.",
    notificationDenied: "Powiadomienia wymagają zgody w ustawieniach telefonu.",
    notificationError: "Nie udało się zapisać przypomnienia.",
    backButton: "Wróć"
  },
  notifications: {
    title: "Unpeeky",
    body: "Hej! Tata/Mama czeka na Twoje dzisiejsze zadanie."
  },
  avatars: {
    dino: "Dino",
    unicorn: "Jednorożec",
    rocket: "Rakieta",
    panda: "Panda",
    lion: "Lew",
    fox: "Lis",
    rabbit: "Królik",
    frog: "Żaba",
    dolphin: "Delfin",
    butterfly: "Motyl",
    star: "Gwiazdka",
    rainbow: "Tęcza"
  }
} as const;
