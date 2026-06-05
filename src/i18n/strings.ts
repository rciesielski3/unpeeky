export const strings = {
  app: {
    loading: "Ładowanie...",
    loadingTitle: "Unpeeky",
    loadingMeta: "Odkrywamy nagrody..."
  },
  modeSelection: {
    title: "Jak będzie działać Unpeeky?",
    subtitle: "Wybierz tryb na start. Możesz zmienić go później w ustawieniach.",
    singleDeviceTitle: "Jeden telefon",
    singleDeviceMeta: "Rodzic zatwierdza PIN-em, dziecko odkrywa kafelek na tym samym telefonie.",
    twoDevicesTitle: "Dwa telefony",
    twoDevicesMeta: "Przygotowane pod późniejszy tryb z telefonem dziecka i powiadomieniami.",
    note: "Tryb dwóch telefonów w MVP korzysta jeszcze z lokalnego widoku dziecka.",
    continueButton: "Kontynuuj"
  },
  addGoal: {
    title: "Dodaj nowy cel",
    subtitle: "Utwórz nagrodę",
    editTitle: "Edytuj cel",
    childNamePlaceholder: "Np. Kuba",
    rewardNamePlaceholder: "Np. Hulajnoga, Zabawka, Wyjście do kina",
    tileCountLabel: "Liczba kafelków",
    photoStepLabel: "1. Zdjęcie nagrody",
    rewardStepLabel: "2. Nazwa nagrody",
    taskStepLabel: "3. Liczba zadań",
    avatarStepLabel: "4. Wybierz awatar",
    childStepLabel: "5. Imię dziecka",
    photoPlaceholder: "Zrób zdjęcie\nlub wybierz z galerii",
    photoEmptyLabel: "📷",
    cameraButton: "Zrób zdjęcie",
    galleryButton: "Wybierz z galerii",
    cameraPermissionDenied: "Aparat wymaga zgody w ustawieniach telefonu.",
    galleryPermissionDenied: "Galeria wymaga zgody w ustawieniach telefonu.",
    imagePickerError: "Nie udało się wybrać zdjęcia. Spróbuj ponownie.",
    photoRequired: "Dodaj zdjęcie nagrody.",
    rewardNameRequired: "Wpisz nazwę nagrody.",
    childNameRequired: "Wpisz imię dziecka.",
    avatarLabel: "Wybierz awatar",
    saveButton: "Zapisz cel ✓",
    updateButton: "Zapisz zmiany ✓",
    backButton: "Wróć"
  },
  child: {
    subtitle: "Odkrywasz nagrodę",
    greeting: (childName: string) => `Hej, ${childName}!`,
    reward: (rewardName: string) => `Nagroda: ${rewardName}`,
    progress: (completedTasks: number, totalTasks: number) => `${completedTasks} z ${totalTasks} kafelków odkrytych`,
    remaining: (remainingTasks: number) => `Jeszcze ${remainingTasks} i nagroda Twoja!`,
    encouragementTitle: "Jeszcze trochę!",
    pickTileHint: "Wybierz kafelek na obrazku, żeby odkryć nagrodę.",
    completedTitle: "Brawo!",
    completedBody: "Nagroda jest odkryta. Czas świętować!",
    completeButton: "Nagroda gotowa",
    rejectButton: "Odrzuć",
    approveTaskButton: "Zatwierdź zadanie",
    backToParentButton: "Wróć do rodzica",
    soundButton: "Dźwięk"
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
    greeting: "Cześć, Mama! 👋",
    title: "Twoje cele",
    subtitle: "Twoje nagrody",
    settingsButton: "Ustawienia",
    infoButton: "Informacje o aplikacji",
    infoTitle: "Małe kroki, wielka radość",
    infoBody:
      "Unpeeky pomaga zamienić codzienne zadania w spokojną zabawę. Dziecko odkrywa nagrodę kawałek po kawałku, a rodzic widzi postęp bez presji.",
    infoClose: "Rozumiem",
    emptyTitle: "Brak celów",
    emptyText: "Dodaj pierwszy cel i sprawdź pełną pętlę lokalnie.",
    newGoalButton: "Nowy cel",
    freeLimitTitle: "Limit darmowych celów",
    freeLimitText: (goalLimit: number) =>
      `Darmowa wersja pozwala mieć ${goalLimit} aktywne cele. Włącz Premium w ustawieniach, żeby dodać więcej.`,
    freeLimitButton: "Otwórz ustawienia",
    completedBadge: "Ukończone",
    editButton: "Edytuj",
    deleteButton: "Usuń",
    deleteTitle: "Usunąć cel?",
    deleteMeta: (rewardName: string) => `Cel "${rewardName}" i jego postęp zostaną usunięte z tego telefonu.`,
    thumbnailLabel: (rewardName: string) => `Zdjęcie nagrody: ${rewardName}`,
    cardProgress: (childName: string, completedTasks: number, totalTasks: number) =>
      `${childName} - ${completedTasks}/${totalTasks}`,
    tasksTotal: (totalTasks: number) => ` / ${totalTasks} ${getPolishTaskLabel(totalTasks)}`
  },
  navigation: {
    goals: "Cele",
    add: "Dodaj",
    child: "Dziecko",
    settings: "Opcje"
  },
  settings: {
    title: "Ustawienia",
    subtitle: "Dostosuj aplikację",
    dailyReminderTitle: "Codzienne przypomnienie",
    premiumTitle: "Premium",
    premiumMeta: "Reklamy będą tylko w widoku rodzica",
    premiumVersionTitle: "Wersja Premium",
    premiumVersionMeta: "Odblokuj wszystkie awatary, nielimitowane cele i usuń reklamy.",
    premiumUpgradeButton: "Przejdź na Premium",
    premiumActiveButton: "Premium aktywny",
    premiumModalTitle: "Odblokuj Premium",
    premiumModalMeta: "Jednorazowy zakup odblokuje nielimitowane cele i usunie reklamy z widoków rodzica.",
    premiumModalDisclosure:
      "W MVP aktywacja jest lokalna. Przed publikacją ten przycisk zostanie podłączony do zakupu w sklepie.",
    premiumProductLabel: "Produkt",
    premiumPurchaseError: "Nie udało się włączyć Premium. Spróbuj ponownie.",
    premiumRestoreError: "Nie udało się przywrócić Premium. Spróbuj ponownie.",
    premiumActivateButton: "Włącz Premium",
    premiumActivatingButton: "Włączanie...",
    premiumRestoreButton: "Przywróć zakup",
    premiumRestoringButton: "Przywracanie...",
    premiumCloseButton: "Może później",
    aboutApp: "O aplikacji",
    aboutTitle: "O Unpeeky",
    aboutBody:
      "Unpeeky pomaga rodzicom motywować dzieci małymi krokami. Zdjęcie nagrody odkrywa się kafelek po kafelku po zatwierdzonych zadaniach.",
    creatorEyebrow: "Created by",
    creatorName: "Rafał Ciesielski",
    creatorMeta: "Product design, engineering and mobile development.",
    creatorContactButton: "Contact",
    creatorContactUrl: "https://rciesielski.dev/contact",
    creatorContactError: "Nie udało się otworzyć strony kontaktowej.",
    aboutClose: "Zamknij",
    notificationTitle: "Powiadomienie",
    notificationMeta: "Codzienna godzina przypomnienia",
    notificationsSectionTitle: "POWIADOMIENIA",
    notificationTimePlaceholder: "HH:MM",
    notificationTimePickerTitle: "Wybierz godzinę",
    notificationTimePickerClose: "Gotowe",
    notificationTimeError: "Wpisz godzinę w formacie HH:MM.",
    parentPinTitle: "PIN rodzica",
    parentPinMeta: "4 cyfry do zatwierdzania zadań",
    parentPinPlaceholder: "PIN",
    parentPinError: "PIN musi mieć dokładnie 4 cyfry.",
    generateParentPinButton: "Nowy PIN",
    appModeTitle: "Tryb działania",
    appModeMeta: "Możesz przełączyć tryb w dowolnym momencie.",
    appModeSingleDevice: "Jeden telefon",
    appModeSingleDeviceMeta: "Rodzic zatwierdza PIN-em, dziecko odkrywa na tym samym telefonie.",
    appModeTwoDevices: "Dwa telefony",
    appModeTwoDevicesMeta: "Przygotowane pod późniejsze powiadomienia na telefon dziecka.",
    tileColorTitle: "Motyw kolorów",
    tileColorMeta: "Wybierz pastelowy kolor zasłony zdjęcia.",
    resetTitle: "Reset danych",
    resetMeta: "Usuń lokalne cele i postępy",
    resetButton: "Resetuj cele",
    accountSectionTitle: "KONTO",
    notificationScheduled: "Przypomnienie zapisane.",
    notificationDenied: "Powiadomienia wymagają zgody w ustawieniach telefonu.",
    notificationError: "Nie udało się zapisać przypomnienia.",
    backButton: "Wróć"
  },
  notifications: {
    title: "Unpeeky",
    body: "Hej! Tata/Mama czeka na Twoje dzisiejsze zadanie."
  },
  ads: {
    placeholderLabel: "Miejsce na reklamę",
    placeholderTitle: "Baner reklamowy",
    placeholderText: "W tej wersji MVP reklamę może wyświetlać tylko rodzic.",
    loadingTitle: "Ładowanie reklamy"
  },
  premium: {
    activeBadge: "ON",
    inactiveBadge: "UP",
    activeTitle: "Premium aktywny",
    activeMeta: "Limit celów i reklamy są wyłączone.",
    inactiveTitle: "Premium",
    inactiveMeta: "Odblokuj nielimitowane cele i ukryj reklamy w widoku rodzica.",
    benefits: ["Nielimitowane cele", "Bez reklam", "Wsparcie rozwoju aplikacji"],
    price: "9 zł",
    priceMeta: "jednorazowo"
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
  },
  tileColors: {
    lavender: "Lawenda",
    mint: "Mięta",
    peach: "Brzoskwinia",
    rose: "Róż",
    sky: "Niebo",
    vanilla: "Wanilia",
    lilac: "Lilia",
    lime: "Limonka"
  }
} as const;

function getPolishTaskLabel(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (count === 1) {
    return "zadanie";
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "zadania";
  }

  return "zadań";
}
