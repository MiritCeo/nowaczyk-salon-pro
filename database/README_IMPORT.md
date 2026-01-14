# 📦 Import bazy danych - Instrukcja

## 📁 Dostępne pliki

### 1. `import.sql` - **ZALECANY** ⭐
Kompletny import z danymi testowymi:
- ✅ Wszystkie tabele
- ✅ Dane testowe (klienci, pojazdy, usługi, wizyty)
- ✅ Użytkownicy testowi
- ✅ Gotowy do testowania

**Użyj tego pliku jeśli:**
- Chcesz przetestować aplikację
- Potrzebujesz przykładowych danych
- Instalujesz aplikację po raz pierwszy

### 2. `import_empty.sql` - Produkcja
Import bez danych testowych:
- ✅ Wszystkie tabele
- ✅ Tylko użytkownik administrator (admin@nowaczyk.pl)
- ❌ Brak danych testowych

**Użyj tego pliku jeśli:**
- Instalujesz na produkcji
- Chcesz czystą bazę bez danych testowych
- Masz już własne dane do zaimportowania

### 3. `schema.sql` - Tylko struktura
Tylko definicje tabel (bez danych)

### 4. `seed.sql` - Tylko dane testowe
Tylko dane testowe (wymaga istniejących tabel)

## 🚀 Jak zaimportować

### Metoda 1: phpMyAdmin (ZALECANA)

1. **Utwórz bazę danych:**
   - W panelu hostingu (cPanel/Plesk) utwórz nową bazę MySQL
   - Zapisz nazwę bazy, użytkownika i hasło

2. **Otwórz phpMyAdmin:**
   - Przejdź do phpMyAdmin w panelu hostingu
   - Wybierz utworzoną bazę danych (po lewej stronie)

3. **Import:**
   - Kliknij zakładkę **"Import"** (u góry)
   - Kliknij **"Wybierz plik"**
   - Wybierz plik `import.sql` lub `import_empty.sql`
   - Sprawdź czy **"Częściowe importy"** jest włączone (jeśli plik jest duży)
   - Kliknij **"Wykonaj"** (na dole)

4. **Sprawdź wynik:**
   - Powinno pojawić się: "Import został wykonany pomyślnie"
   - Sprawdź czy tabele zostały utworzone (po lewej stronie)

### Metoda 2: Przez terminal (SSH)

```bash
# Połącz się z serwerem przez SSH
ssh uzytkownik@serwer.pl

# Przejdź do katalogu z plikiem SQL
cd /ścieżka/do/pliku

# Zaimportuj
mysql -u nazwa_uzytkownika -p nazwa_bazy < import.sql
# Wpisz hasło gdy zostaniesz poproszony
```

### Metoda 3: Przez panel hostingu

Niektóre hostingi mają opcję importu bezpośrednio w panelu:
- cPanel: **MySQL Databases** → **phpMyAdmin** → **Import**
- Plesk: **Databases** → **phpMyAdmin** → **Import**

## ✅ Po imporcie

### 1. Sprawdź tabele

W phpMyAdmin powinny być widoczne:
- ✅ `employees`
- ✅ `clients`
- ✅ `cars`
- ✅ `services`
- ✅ `appointments`
- ✅ `notifications`

### 2. Sprawdź dane (jeśli użyłeś import.sql)

```sql
-- Sprawdź użytkowników
SELECT id, name, email, role FROM employees;

-- Sprawdź klientów
SELECT COUNT(*) as total_clients FROM clients;

-- Sprawdź usługi
SELECT COUNT(*) as total_services FROM services;
```

### 3. Zaloguj się

Jeśli użyłeś `import.sql`:
- **Email:** `michal@nowaczyk.pl`
- **Hasło:** `password123`

Jeśli użyłeś `import_empty.sql`:
- **Email:** `admin@nowaczyk.pl`
- **Hasło:** `password123`

### 4. ⚠️ ZMIEŃ HASŁA!

**WAŻNE:** Po pierwszym logowaniu zmień hasła wszystkich użytkowników!

## 🔧 Rozwiązywanie problemów

### Błąd: "Table already exists"

**Rozwiązanie:**
- Usuń istniejące tabele przed importem
- Lub użyj `DROP TABLE IF EXISTS` przed `CREATE TABLE`

### Błąd: "Access denied"

**Rozwiązanie:**
- Sprawdź czy użytkownik bazy ma uprawnienia do tworzenia tabel
- Skontaktuj się z hostingiem

### Błąd: "Foreign key constraint fails"

**Rozwiązanie:**
- Upewnij się, że importujesz w kolejności: employees → clients → cars → services → appointments
- Plik `import.sql` już ma właściwą kolejność

### Błąd: "Unknown collation"

**Rozwiązanie:**
- Upewnij się, że baza używa `utf8mb4_unicode_ci`
- Sprawdź wersję MySQL (wymagane 5.7+)

## 📝 Uwagi

- **Rozmiar pliku:** Jeśli plik jest większy niż limit w phpMyAdmin, użyj metody przez SSH
- **Czas importu:** Duże pliki mogą wymagać kilku minut
- **Backup:** Zawsze rób backup przed importem na produkcji!

## 🔒 Bezpieczeństwo

Po imporcie:
1. ✅ Zmień hasła wszystkich użytkowników
2. ✅ Usuń pliki importu z serwera (lub zabezpiecz)
3. ✅ Sprawdź uprawnienia do plików SQL

---

**Powodzenia z importem! 🚀**
