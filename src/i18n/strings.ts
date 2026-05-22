export const strings = {
  app: {
    loading: "Ladowanie..."
  },
  addGoal: {
    title: "Nowy cel",
    childNamePlaceholder: "Imie dziecka",
    rewardNamePlaceholder: "Nazwa nagrody",
    tileCountLabel: "Liczba kafelkow",
    photoStepLabel: "1. Zdjecie nagrody",
    photoPlaceholder: "Zrob zdjecie lub wybierz z galerii",
    cameraButton: "Zrob zdjecie",
    galleryButton: "Wybierz z galerii",
    cameraPermissionDenied: "Aparat wymaga zgody w ustawieniach telefonu.",
    galleryPermissionDenied: "Galeria wymaga zgody w ustawieniach telefonu.",
    saveButton: "Zapisz cel",
    backButton: "Wroc"
  },
  child: {
    greeting: (childName: string) => `Hej, ${childName}!`,
    reward: (rewardName: string) => `Nagroda: ${rewardName}`,
    progress: (completedTasks: number, totalTasks: number) => `${completedTasks} z ${totalTasks} kafelkow odkrytych`,
    completeButton: "Nagroda gotowa",
    approveTaskButton: "Zatwierdz zadanie",
    backToParentButton: "Wroc do rodzica"
  },
  goals: {
    title: "Unpeeky",
    subtitle: "Cele i postepy",
    settingsButton: "Ustawienia",
    emptyTitle: "Brak celow",
    emptyText: "Dodaj pierwszy cel i sprawdz pelna petle lokalnie.",
    newGoalButton: "Nowy cel"
  },
  settings: {
    title: "Ustawienia",
    premiumTitle: "Premium",
    premiumMeta: "Reklamy beda tylko w widoku rodzica",
    notificationTitle: "Powiadomienie",
    notificationMeta: "18:00 codziennie",
    backButton: "Wroc"
  }
} as const;
