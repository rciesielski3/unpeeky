# Unpeeky Next Feature Roadmap

## Status Pierwotnego Planu

Cel początkowy: dodać aplikację do Google Play, spiąć reklamy i przygotować płatności Premium teraz albo po przetworzeniu konfiguracji w Google Play.

### Zrealizowane w repo

- Aplikacja MVP jest gotowa kodowo: tworzenie celów, zdjęcie nagrody, kafelki postępu, widok dziecka, zatwierdzanie PIN-em rodzica, tryb pierwszego uruchomienia i trwały zapis lokalny.
- Reklamy są spięte przez `react-native-google-mobile-ads`.
- Reklamy są renderowane tylko w widokach rodzica przez `ParentAdSlot`.
- Premium usuwa reklamy lokalnie przez `isPremium`.
- RevenueCat jest dodany przez `react-native-purchases`.
- Zakup Premium jest podpięty do produktu `unpeeky_premium_lifetime`.
- Startup entitlement sync aktualizuje lokalny status Premium.
- Nieaktywny entitlement odróżnia się od niedostępności API przez `status: "not_active"`.
- Ustawienia Premium mają user-facing komunikat zamiast technicznego `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.
- Przycisk `Przywróć zakup` został usunięty z UI zgodnie z decyzją produktową.
- Android target/compile SDK jest ustawiony na API 35.
- `google-play-service-account*.json`, env-y i keystore są ignorowane przez git.
- `UNPEEKY_VERSION_CODE` jest podbite do `3`, więc kolejny AAB nie powinien kolidować z użytym już kodem `2`.
- Ekran zatwierdzania zadania ma podpowiedź “PIN znajdziesz w Opcjach” bez pokazywania prawdziwego PIN-u.

### Zrealizowane poza repo lub w toku

- Google Play app istnieje i build został wrzucony ręcznie do przetwarzania.
- Service account JSON istnieje lokalnie.
- RevenueCat public key jest dostępny lokalnie.

### Jeszcze do potwierdzenia przed pełnym release

- Produkt Google Play `unpeeky_premium_lifetime` jest aktywny i widoczny dla builda na internal track.
- RevenueCat ma produkt przypięty do entitlement `premium`.
- EAS environment `preview` albo `production` ma ustawiony `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.
- Test zakupu na koncie license tester przechodzi end to end.
- Jeśli restore ma nie być wspierany w UI, opis Premium i review notes nie obiecują restore.
- Po zaakceptowaniu przez review sklepu: zbudować i wrzucić AAB z `versionCode >= 3`.

## Zasada Pracy

- Każdy quick win idzie na osobnym branchu odbitym od `main`.
- Każdy PR zostaje jako draft albo ready for review, ale bez automatycznego merge.
- Po każdym PR: `npm run format:check`, `npm run typecheck`, `npm run lint`.
- Build AAB robimy tylko po zmergowaniu małych PR-ów, które mają sens dla sklepu.
- Nie dokładamy ciężkich feature’ów w trakcie aktywnego Google Play review, chyba że naprawiają błąd blokujący release.

## Najbliższy Release Candidate

### RC-1: Settings and Premium UX Fix

Branch: `fix/settings-premium-ux`

Zakres:

- Wyszarzona godzina powiadomień po wyłączeniu przypomnienia.
- Oddzielny stan `isReminderEnabled` od `notificationTime`.
- PIN rodzica nie wychodzi poza kartę.
- Premium nie pokazuje technicznego komunikatu RevenueCat.
- Brak przycisku restore.
- Android `versionCode=3`.

Weryfikacja:

- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- EAS internal AAB i upload do Google Play.

Decyzja:

- Ten PR warto domknąć jako następny, bo usuwa realne problemy ze screenshotów i odblokowuje kolejny upload.

## Quick Win Backlog

### 1. Empty States and First Goal Guidance

Cel: użytkownik po pierwszym uruchomieniu od razu wie, co zrobić.

Zakres:

- Dodać pusty stan na ekranie celów, gdy nie ma żadnego celu.
- Krótki tekst: “Dodaj pierwszy cel z nagrodą”.
- Główny przycisk prowadzi do zakładki `Dodaj`.
- Jeśli free limit jest osiągnięty, pusty stan nie powinien zachęcać do dodania celu, tylko do Premium.

Pliki:

- `src/screens/GoalsScreen.tsx`
- `src/i18n/strings.ts`

Ryzyko: niskie.

Weryfikacja:

- Start bez celów.
- Start z jednym aktywnym celem.
- Start z free limitem bez Premium.

### 2. Safer Premium Paywall Copy

Cel: Premium wygląda bardziej sklep-ready i mniej jak developer/debug flow.

Zakres:

- Ukryć product id z modala Premium albo przenieść go pod `__DEV__`.
- Dodać krótki tekst “Jednorazowy zakup”.
- Zostawić prosty komunikat niedostępności zakupu, gdy RevenueCat/Google Play jeszcze nie odpowiada.

Pliki:

- `src/screens/SettingsScreen.tsx`
- `src/i18n/strings.ts`

Ryzyko: niskie.

Weryfikacja:

- Premium bez env key.
- Premium z aktywnym `isPremium`.
- Modal na małym Android screenie.

### 3. Goal Templates for Faster Creation

Cel: dodawanie celu jest szybsze i mniej puste poznawczo.

Zakres:

- Dodać kilka chipów z nazwami nagród: “Lego”, “Rower”, “Książka”, “Wycieczka”.
- Kliknięcie chipa uzupełnia nazwę nagrody, ale nie nadpisuje ręcznie wpisanego tekstu bez intencji użytkownika.
- Nie zmieniać zdjęcia ani liczby zadań.

Pliki:

- `src/screens/AddGoalScreen.tsx`
- `src/i18n/strings.ts`

Ryzyko: niskie.

Weryfikacja:

- Tap na chip przy pustym polu.
- Edycja tekstu po wybraniu chipa.
- Mobile layout bez overlapów.

### 4. Parent PIN Quality of Life — done locally

Cel: rodzic mniej się gubi przy zatwierdzaniu zadania.

Zakres:

- [x] W ekranie zatwierdzania dodać subtelny tekst: “PIN znajdziesz w Opcjach”.
- [x] Po błędnym PIN-ie pokazać krótką informację zwrotną.
- [x] Nie pokazywać prawdziwego PIN-u poza ustawieniami.

Pliki:

- `src/screens/ApproveTaskScreen.tsx`
- `src/i18n/strings.ts`
- `src/domain/settings.test.ts`

Ryzyko: niskie.

Weryfikacja:

- [x] `npm run test:unit`
- [x] `npm run format:check`
- [x] `npm run typecheck`
- [x] `npm run lint`

### 5. Completion Moment Polish

Cel: ukończenie celu ma bardziej satysfakcjonujący, ale nieinwazyjny moment.

Zakres:

- Doprecyzować tekst modala ukończenia celu.
- Dodać przycisk “Zobacz cele” albo “Dodaj kolejny cel”.
- Upewnić się, że modal nie wraca po zmianie celu albo edycji celu.

Pliki:

- `src/screens/ChildScreen.tsx`
- `src/i18n/strings.ts`

Ryzyko: średnio-niskie, bo dotyka flow ukończenia.

Weryfikacja:

- Cel ukończony pierwszy raz.
- Ukończony cel edytowany na nieukończony i ukończony ponownie.
- Przejście między celami.

### 6. Local Backup / Export Lite

Cel: zmniejszyć ryzyko utraty lokalnych danych bez budowania kont użytkowników.

Zakres:

- Dodać w ustawieniach przycisk “Eksportuj dane”.
- Eksportuje JSON z celami i ustawieniami do share sheet.
- Import zostawić na później, żeby nie rozdmuchać zakresu.

Pliki:

- `src/storage/appStorage.ts`
- `src/screens/SettingsScreen.tsx`
- `src/i18n/strings.ts`

Ryzyko: średnie, bo wymaga dodatkowej biblioteki albo Expo sharing.

Weryfikacja:

- Eksport przy braku celów.
- Eksport z kilkoma celami.
- Brak crasha, gdy share API jest niedostępne.

## Rekomendowana Kolejność

1. Wypchnąć mały PR `Parent PIN Quality of Life`, bez mieszania zmian release/build.
2. Jako następny quick win zrobić `Completion Moment Polish`, bo jest lokalny i nie dotyka Google Play/RevenueCat.
3. Zbudować AAB z `versionCode=3` i wrzucić do Google Play dopiero po domknięciu małych PR-ów, jeśli review wymaga nowego builda.
4. Poczekać na status review/przetwarzania.
5. Po akceptacji internal/review zrobić store/launch cleanup.
6. Dopiero po stabilnym release rozważyć export/import albo większy onboarding.

## Nie Robić Teraz

- Nie dodawać kont użytkowników.
- Nie budować synchronizacji między urządzeniami.
- Nie dodawać importu danych przed eksportem.
- Nie zmieniać architektury storage bez realnej potrzeby.
- Nie dodawać subskrypcji, dopóki lifetime product nie przejdzie testów.
- Nie mieszać kilku quick winów w jednym PR, jeśli nie są zależne od siebie.
