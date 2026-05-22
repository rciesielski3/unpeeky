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
  goals: {
    title: "Unpeeky",
    subtitle: "Cele i postępy",
    settingsButton: "Ustawienia",
    emptyTitle: "Brak celów",
    emptyText: "Dodaj pierwszy cel i sprawdź pełną pętlę lokalnie.",
    newGoalButton: "Nowy cel"
  },
  settings: {
    title: "Ustawienia",
    premiumTitle: "Premium",
    premiumMeta: "Reklamy będą tylko w widoku rodzica",
    notificationTitle: "Powiadomienie",
    notificationMeta: "Codzienna godzina przypomnienia",
    notificationTimePlaceholder: "HH:MM",
    resetTitle: "Reset danych",
    resetMeta: "Usuń lokalne cele i postępy",
    resetButton: "Resetuj cele",
    backButton: "Wróć"
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
