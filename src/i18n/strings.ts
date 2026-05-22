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
    cameraButton: "Zrób zdjęcie",
    galleryButton: "Wybierz z galerii",
    cameraPermissionDenied: "Aparat wymaga zgody w ustawieniach telefonu.",
    galleryPermissionDenied: "Galeria wymaga zgody w ustawieniach telefonu.",
    saveButton: "Zapisz cel",
    backButton: "Wróć"
  },
  child: {
    greeting: (childName: string) => `Hej, ${childName}!`,
    reward: (rewardName: string) => `Nagroda: ${rewardName}`,
    progress: (completedTasks: number, totalTasks: number) => `${completedTasks} z ${totalTasks} kafelków odkrytych`,
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
    notificationMeta: "18:00 codziennie",
    backButton: "Wróć"
  }
} as const;
