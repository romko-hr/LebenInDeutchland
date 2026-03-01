const words = [
  { rank: 1, word: 'deutsch', translation: 'німецький; німецькі громадяни', category: 'descriptor', frequency: 80, variants: 5 },
  { rank: 2, word: 'jahr', translation: 'рік', category: 'time', frequency: 57, variants: 3 },
  { rank: 3, word: 'müssen', translation: 'мусити; бути зобовʼязаним', category: 'verb', frequency: 42, variants: 2, isAux: true },
  { rank: 4, word: 'werden', translation: 'ставати; утворює майбутній і пасив', category: 'verb', frequency: 40, variants: 3, isAux: true },
  { rank: 5, word: 'bundesrepublik', translation: 'федеративна республіка', category: 'institution', frequency: 39, variants: 1 },
  { rank: 6, word: 'wählen', translation: 'обирати; голосувати', category: 'verb', frequency: 37, variants: 3 },
  { rank: 7, word: 'dürfen', translation: 'мати право; бути дозволеним', category: 'verb', frequency: 36, variants: 2, isAux: true },
  { rank: 8, word: 'partei', translation: 'політична партія', category: 'institution', frequency: 36, variants: 2 },
  { rank: 9, word: 'staat', translation: 'держава', category: 'institution', frequency: 34, variants: 3 },
  { rank: 10, word: 'ddr', translation: 'НДР', category: 'history', frequency: 31, variants: 1 },
  { rank: 11, word: 'bundestag', translation: 'Бундестаг; федеральний парламент', category: 'institution', frequency: 30, variants: 2 },
  { rank: 12, word: 'alle', translation: 'усі; всі громадяни', category: 'linker', frequency: 29, variants: 2 },
  { rank: 13, word: 'bürger', translation: 'громадянин; громадяни', category: 'people', frequency: 29, variants: 3 },
  { rank: 14, word: 'bundesland', translation: 'федеральна земля', category: 'place', frequency: 28, variants: 3 },
  { rank: 15, word: 'bundespräsident', translation: 'федеральний президент', category: 'institution', frequency: 27, variants: 3 },
  { rank: 16, word: 'gehören', translation: 'належати; входити до складу', category: 'verb', frequency: 26, variants: 3 },
  { rank: 17, word: 'bundeskanzler', translation: 'федеральний канцлер', category: 'institution', frequency: 24, variants: 2 },
  { rank: 18, word: 'land', translation: 'країна; земля', category: 'place', frequency: 23, variants: 2 },
  { rank: 19, word: 'wahl', translation: 'вибори; голосування', category: 'institution', frequency: 23, variants: 2 },
  { rank: 20, word: 'europäisch', translation: 'європейський', category: 'descriptor', frequency: 21, variants: 3 },
  { rank: 21, word: 'bedeutet', translation: 'означає', category: 'verb', frequency: 20, variants: 1 },
  { rank: 22, word: 'gesetz', translation: 'закон', category: 'institution', frequency: 20, variants: 3 },
  { rank: 23, word: 'sein', translation: 'бути', category: 'verb', frequency: 20, variants: 2, isAux: true },
  { rank: 24, word: 'viel', translation: 'багато', category: 'linker', frequency: 20, variants: 3 },
  { rank: 25, word: 'frau', translation: 'жінка; пані', category: 'people', frequency: 19, variants: 2 },
  { rank: 26, word: 'haben', translation: 'мати', category: 'verb', frequency: 19, variants: 1, isAux: true },
  { rank: 27, word: 'kind', translation: 'дитина', category: 'people', frequency: 18, variants: 3 },
  { rank: 28, word: 'mensch', translation: 'людина', category: 'people', frequency: 18, variants: 2 },
  { rank: 29, word: 'weil', translation: 'тому що', category: 'linker', frequency: 18, variants: 1 },
  { rank: 30, word: 'arbeitgeber', translation: 'роботодавець', category: 'people', frequency: 16, variants: 3 },
  { rank: 31, word: 'berlin', translation: 'Берлін', category: 'place', frequency: 16, variants: 2 },
  { rank: 32, word: 'recht', translation: 'право; юридична норма', category: 'institution', frequency: 16, variants: 2 },
  { rank: 33, word: 'regierung', translation: 'уряд', category: 'institution', frequency: 16, variants: 1 },
  { rank: 34, word: 'arbeit', translation: 'праця; робота', category: 'people', frequency: 15, variants: 2 },
  { rank: 35, word: 'gehen', translation: 'йти; відбуватися', category: 'verb', frequency: 15, variants: 2 },
  { rank: 36, word: 'können', translation: 'могти', category: 'verb', frequency: 15, variants: 1, isAux: true },
  { rank: 37, word: 'richter', translation: 'суддя', category: 'people', frequency: 15, variants: 3 },
  { rank: 38, word: 'abgeordnete', translation: 'депутат; депутатка', category: 'people', frequency: 14, variants: 2 },
  { rank: 39, word: 'bayern', translation: 'Баварія', category: 'place', frequency: 14, variants: 1 },
  { rank: 40, word: 'deutschland', translation: 'Німеччина', category: 'place', frequency: 14, variants: 1 },
  { rank: 41, word: 'wann', translation: 'коли', category: 'time', frequency: 14, variants: 1 },
  { rank: 42, word: 'heißen', translation: 'називатися', category: 'verb', frequency: 13, variants: 2 },
  { rank: 43, word: 'nennen', translation: 'називати', category: 'verb', frequency: 13, variants: 2 },
  { rank: 44, word: 'parlament', translation: 'парламент', category: 'institution', frequency: 13, variants: 2 },
  { rank: 45, word: 'union', translation: 'союз; обʼєднання', category: 'institution', frequency: 13, variants: 1 },
  { rank: 46, word: 'aufgabe', translation: 'завдання; тестове питання', category: 'linker', frequency: 12, variants: 2 },
  { rank: 47, word: 'bekommen', translation: 'отримувати', category: 'verb', frequency: 12, variants: 2 },
  { rank: 48, word: 'bundesregierung', translation: 'федеральний уряд', category: 'institution', frequency: 12, variants: 1 },
  { rank: 49, word: 'demokratisch', translation: 'демократичний', category: 'descriptor', frequency: 12, variants: 3 },
  { rank: 50, word: 'frei', translation: 'вільний; вільно', category: 'descriptor', frequency: 12, variants: 3 },
  { rank: 51, word: 'gegen', translation: 'проти', category: 'linker', frequency: 12, variants: 1 },
  { rank: 52, word: 'minister', translation: 'міністр', category: 'institution', frequency: 12, variants: 3 },
  { rank: 53, word: 'schule', translation: 'школа', category: 'institution', frequency: 12, variants: 2 },
  { rank: 54, word: 'arbeitnehmer', translation: 'найманий працівник', category: 'people', frequency: 11, variants: 2 },
  { rank: 55, word: 'bundesrat', translation: 'Бундесрат; палата земель', category: 'institution', frequency: 11, variants: 1 },
  { rank: 56, word: 'eu', translation: 'ЄС; Європейський Союз', category: 'institution', frequency: 11, variants: 1 },
  { rank: 57, word: 'geben', translation: 'давати; існувати', category: 'verb', frequency: 11, variants: 2 },
  { rank: 58, word: 'gericht', translation: 'суд', category: 'institution', frequency: 11, variants: 2 },
  { rank: 59, word: 'meinungsfreiheit', translation: 'свобода слова', category: 'institution', frequency: 11, variants: 1 },
  { rank: 60, word: 'möchte', translation: 'хотів би', category: 'verb', frequency: 11, variants: 1 },
  { rank: 61, word: 'tun', translation: 'робити', category: 'verb', frequency: 11, variants: 1 },
  { rank: 62, word: 'weltkrieg', translation: 'світова війна', category: 'history', frequency: 11, variants: 3 },
  { rank: 63, word: 'eltern', translation: 'батьки', category: 'people', frequency: 10, variants: 1 },
  { rank: 64, word: 'entscheiden', translation: 'вирішувати', category: 'verb', frequency: 10, variants: 2 },
  { rank: 65, word: 'grundgesetz', translation: 'Основний закон; конституція Німеччини', category: 'institution', frequency: 10, variants: 2 },
  { rank: 66, word: 'meisten', translation: 'більшість; найбільше', category: 'linker', frequency: 10, variants: 1 },
  { rank: 67, word: 'ministerpräsident', translation: 'премʼєр-міністр землі', category: 'institution', frequency: 10, variants: 4 },
  { rank: 68, word: 'person', translation: 'особа; людина', category: 'people', frequency: 10, variants: 2 },
  { rank: 69, word: 'sowjetunion', translation: 'Радянський Союз', category: 'history', frequency: 10, variants: 1 },
  { rank: 70, word: 'sozial', translation: 'соціальний', category: 'descriptor', frequency: 10, variants: 2 },
  { rank: 71, word: 'usa', translation: 'США', category: 'place', frequency: 10, variants: 1 },
  { rank: 72, word: 'zweit', translation: 'другий', category: 'time', frequency: 10, variants: 2 },
  { rank: 73, word: 'christlich', translation: 'християнський', category: 'descriptor', frequency: 9, variants: 4 },
  { rank: 74, word: 'einwohner', translation: 'мешканець; населення', category: 'people', frequency: 9, variants: 2 },
  { rank: 75, word: 'frankreich', translation: 'Франція', category: 'place', frequency: 9, variants: 1 },
  { rank: 76, word: 'gebiet', translation: 'територія; область', category: 'place', frequency: 9, variants: 2 },
  { rank: 77, word: 'jüdisch', translation: 'єврейський', category: 'descriptor', frequency: 9, variants: 3 },
  { rank: 78, word: 'machen', translation: 'робити', category: 'verb', frequency: 9, variants: 1 },
  { rank: 79, word: 'mehr', translation: 'більше', category: 'linker', frequency: 9, variants: 1 },
  { rank: 80, word: 'großbritannien', translation: 'Велика Британія', category: 'place', frequency: 8, variants: 1 },
  { rank: 81, word: 'heutig', translation: 'сучасний; сьогоднішній', category: 'descriptor', frequency: 8, variants: 3 },
  { rank: 82, word: 'republik', translation: 'республіка', category: 'institution', frequency: 8, variants: 1 },
  { rank: 83, word: 'volk', translation: 'народ', category: 'people', frequency: 8, variants: 2 },
  { rank: 84, word: 'vom', translation: 'від; з боку', category: 'linker', frequency: 8, variants: 1 },
  { rank: 85, word: 'warschau', translation: 'Варшава', category: 'place', frequency: 8, variants: 2 },
  { rank: 86, word: 'abkürzung', translation: 'скорочення; абревіатура', category: 'linker', frequency: 7, variants: 1 },
  { rank: 87, word: 'bundestagswahl', translation: 'вибори до Бундестагу', category: 'institution', frequency: 7, variants: 2 },
  { rank: 88, word: 'chef', translation: 'керівник', category: 'people', frequency: 7, variants: 2 },
  { rank: 89, word: 'demokratie', translation: 'демократія', category: 'institution', frequency: 7, variants: 1 },
  { rank: 90, word: 'demonstration', translation: 'демонстрація; протест', category: 'history', frequency: 7, variants: 2 },
  { rank: 91, word: 'früher', translation: 'раніше', category: 'time', frequency: 7, variants: 2 },
  { rank: 92, word: 'mann', translation: 'чоловік', category: 'people', frequency: 7, variants: 1 },
  { rank: 93, word: 'monarchie', translation: 'монархія', category: 'history', frequency: 7, variants: 1 },
  { rank: 94, word: 'politik', translation: 'політика', category: 'institution', frequency: 7, variants: 2 },
  { rank: 95, word: 'polizei', translation: 'поліція', category: 'institution', frequency: 7, variants: 1 },
  { rank: 96, word: 'rot', translation: 'червоний', category: 'descriptor', frequency: 7, variants: 1 },
  { rank: 97, word: 'sachsen', translation: 'Саксонія', category: 'place', frequency: 7, variants: 1 },
  { rank: 98, word: 'vertrag', translation: 'договір; угода', category: 'institution', frequency: 7, variants: 1 },
  { rank: 99, word: 'zeit', translation: 'час', category: 'time', frequency: 7, variants: 1 },
  { rank: 100, word: 'behörde', translation: 'орган влади; відомство', category: 'institution', frequency: 6, variants: 1 },
  { rank: 101, word: 'bezahlt', translation: 'оплачений; сплачений', category: 'verb', frequency: 6, variants: 2 },
  { rank: 102, word: 'bundesratspräsident', translation: 'голова Бундесрату', category: 'institution', frequency: 6, variants: 2 },
  { rank: 103, word: 'bundestagspräsident', translation: 'голова Бундестагу', category: 'institution', frequency: 6, variants: 2 },
  { rank: 104, word: 'bundesverfassungsgericht', translation: 'Федеральний конституційний суд', category: 'institution', frequency: 6, variants: 2 },
  { rank: 105, word: 'bundesversammlung', translation: 'Федеральні збори', category: 'institution', frequency: 6, variants: 1 },
  { rank: 106, word: 'dafür', translation: 'за це; на користь цього', category: 'linker', frequency: 6, variants: 1 },
  { rank: 107, word: 'dazu', translation: 'до цього; з цього приводу', category: 'linker', frequency: 6, variants: 1 },
  { rank: 108, word: 'diktatur', translation: 'диктатура', category: 'history', frequency: 6, variants: 1 },
  { rank: 109, word: 'erst', translation: 'лише; спочатку', category: 'time', frequency: 6, variants: 1 },
  { rank: 110, word: 'fraktion', translation: 'парламентська фракція', category: 'institution', frequency: 6, variants: 2 },
  { rank: 111, word: 'gewalt', translation: 'влада; сила; насильство', category: 'institution', frequency: 6, variants: 1 },
  { rank: 112, word: 'grundrecht', translation: 'основне право', category: 'institution', frequency: 6, variants: 2 },
  { rank: 113, word: 'grün', translation: 'зелений', category: 'descriptor', frequency: 6, variants: 2 },
  { rank: 114, word: 'helmut', translation: 'Гельмут', category: 'people', frequency: 6, variants: 1 },
  { rank: 115, word: 'hessen', translation: 'Гессен', category: 'place', frequency: 6, variants: 1 },
  { rank: 116, word: 'leben', translation: 'жити; життя', category: 'verb', frequency: 6, variants: 1 },
  { rank: 117, word: 'mein', translation: 'мій; моя; моє', category: 'linker', frequency: 6, variants: 2 },
  { rank: 118, word: 'mindestens', translation: 'щонайменше', category: 'linker', frequency: 6, variants: 1 },
  { rank: 119, word: 'mitglied', translation: 'член; учасник', category: 'people', frequency: 6, variants: 1 },
  { rank: 120, word: 'nationalsozialisten', translation: 'націонал-соціалісти; нацисти', category: 'history', frequency: 6, variants: 1 },
  { rank: 121, word: 'ordnungsamt', translation: 'відомство громадського порядку', category: 'institution', frequency: 6, variants: 2 },
  { rank: 122, word: 'polen', translation: 'Польща', category: 'place', frequency: 6, variants: 1 },
  { rank: 123, word: 'schwarz', translation: 'чорний', category: 'descriptor', frequency: 6, variants: 1 },
  { rank: 124, word: 'stelle', translation: 'посада; місце служби', category: 'institution', frequency: 6, variants: 1 },
  { rank: 125, word: 'teilnehmen', translation: 'брати участь', category: 'verb', frequency: 6, variants: 2 },
  { rank: 126, word: 'verfassung', translation: 'конституція', category: 'institution', frequency: 6, variants: 1 },
  { rank: 127, word: 'wahlhelfer', translation: 'помічник на виборах; член виборчої комісії', category: 'people', frequency: 6, variants: 3 },
  { rank: 128, word: 'zusammen', translation: 'разом; спільно', category: 'linker', frequency: 6, variants: 1 },
  { rank: 129, word: 'öffentlich', translation: 'публічний; відкритий для всіх', category: 'descriptor', frequency: 6, variants: 5 },
  { rank: 130, word: 'alt', translation: 'старий; давній', category: 'descriptor', frequency: 5, variants: 2 },
  { rank: 131, word: 'alter', translation: 'вік', category: 'time', frequency: 5, variants: 1 },
  { rank: 132, word: 'besatzungszone', translation: 'окупаційна зона', category: 'history', frequency: 5, variants: 1 },
  { rank: 133, word: 'bestimmt', translation: 'певний; конкретно визначений', category: 'descriptor', frequency: 5, variants: 3 },
  { rank: 134, word: 'bestraft', translation: 'покараний; підлягає покаранню', category: 'verb', frequency: 5, variants: 1 },
  { rank: 135, word: 'bild', translation: 'зображення; картинка', category: 'linker', frequency: 5, variants: 2 },
  { rank: 136, word: 'bundesstaat', translation: 'федеративна держава', category: 'institution', frequency: 5, variants: 1 },
  { rank: 137, word: 'bürgermeister', translation: 'мер; бургомістр', category: 'institution', frequency: 5, variants: 2 },
  { rank: 138, word: 'cdu', translation: 'ХДС; Християнсько-демократичний союз', category: 'institution', frequency: 5, variants: 1 },
  { rank: 139, word: 'csu', translation: 'ХСС; Християнсько-соціальний союз', category: 'institution', frequency: 5, variants: 1 },
  { rank: 140, word: 'deshalb', translation: 'тому; з цієї причини', category: 'linker', frequency: 5, variants: 1 },
  { rank: 141, word: 'ehrenamtlich', translation: 'на громадських засадах; волонтерський', category: 'descriptor', frequency: 5, variants: 3 },
  { rank: 142, word: 'ende', translation: 'кінець; завершення', category: 'time', frequency: 5, variants: 1 },
  { rank: 143, word: 'exekutive', translation: 'виконавча влада', category: 'institution', frequency: 5, variants: 1 },
  { rank: 144, word: 'falsch', translation: 'неправильний; хибний', category: 'descriptor', frequency: 5, variants: 4 },
  { rank: 145, word: 'geld', translation: 'гроші', category: 'linker', frequency: 5, variants: 1 },
  { rank: 146, word: 'gelten', translation: 'діяти; бути чинним', category: 'verb', frequency: 5, variants: 1 },
  { rank: 147, word: 'gemeinde', translation: 'громада; муніципалітет', category: 'place', frequency: 5, variants: 1 },
  { rank: 148, word: 'gleich', translation: 'рівний; однаковий', category: 'descriptor', frequency: 5, variants: 2 },
  { rank: 149, word: 'hitler', translation: 'Гітлер', category: 'history', frequency: 5, variants: 1 },
  { rank: 150, word: 'kanzler', translation: 'канцлер', category: 'institution', frequency: 5, variants: 3 },
  { rank: 151, word: 'mauer', translation: 'стіна; насамперед Берлінська стіна', category: 'history', frequency: 5, variants: 1 },
  { rank: 152, word: 'meinung', translation: 'думка; погляд', category: 'institution', frequency: 5, variants: 2 },
  { rank: 153, word: 'nachbarland', translation: 'сусідня країна', category: 'place', frequency: 5, variants: 1 },
  { rank: 154, word: 'nachfrage', translation: 'уточнювальне запитання', category: 'linker', frequency: 5, variants: 1 },
  { rank: 155, word: 'nato', translation: 'НАТО', category: 'institution', frequency: 5, variants: 1 },
  { rank: 156, word: 'nichts', translation: 'нічого', category: 'linker', frequency: 5, variants: 1 },
  { rank: 157, word: 'pakt', translation: 'пакт; міжнародна угода', category: 'institution', frequency: 5, variants: 1 },
  { rank: 158, word: 'parlaments', translation: 'парламентський; парламенту', category: 'institution', frequency: 5, variants: 1 },
  { rank: 159, word: 'politisch', translation: 'політичний', category: 'descriptor', frequency: 5, variants: 2 },
  { rank: 160, word: 'sozialversicherung', translation: 'соціальне страхування', category: 'institution', frequency: 5, variants: 2 },
  { rank: 161, word: 'spanien', translation: 'Іспанія', category: 'place', frequency: 5, variants: 1 },
  { rank: 162, word: 'sprechen', translation: 'говорити; висловлюватися', category: 'verb', frequency: 5, variants: 2 },
  { rank: 163, word: 'stehen', translation: 'стояти; бути зазначеним', category: 'verb', frequency: 5, variants: 1 },
  { rank: 164, word: 'stimmen', translation: 'голоси; голосувати', category: 'institution', frequency: 5, variants: 1 },
  { rank: 165, word: 'weiß', translation: 'білий', category: 'descriptor', frequency: 5, variants: 1 },
  { rank: 166, word: 'zwei', translation: 'два', category: 'time', frequency: 5, variants: 1 },
  { rank: 167, word: 'adenauer', translation: 'Аденауер', category: 'people', frequency: 4, variants: 1 },
  { rank: 168, word: 'adolf', translation: 'Адольф', category: 'people', frequency: 4, variants: 1 },
  { rank: 169, word: 'andere', translation: 'інший; інші', category: 'linker', frequency: 4, variants: 1 },
  { rank: 170, word: 'anderen', translation: 'іншим; інших', category: 'linker', frequency: 4, variants: 1 },
  { rank: 171, word: 'angebot', translation: 'пропозиція', category: 'linker', frequency: 4, variants: 1 },
  { rank: 172, word: 'arbeiten', translation: 'працювати', category: 'verb', frequency: 4, variants: 1 },
  { rank: 173, word: 'außenminister', translation: 'міністр закордонних справ', category: 'institution', frequency: 4, variants: 2 },
  { rank: 174, word: 'begriff', translation: 'поняття; термін', category: 'linker', frequency: 4, variants: 1 },
  { rank: 175, word: 'beispiel', translation: 'приклад', category: 'linker', frequency: 4, variants: 1 },
  { rank: 176, word: 'beitritt', translation: 'вступ; приєднання', category: 'institution', frequency: 4, variants: 1 },
  { rank: 177, word: 'beruf', translation: 'професія', category: 'people', frequency: 4, variants: 1 },
  { rank: 178, word: 'brandenburg', translation: 'Бранденбург', category: 'place', frequency: 4, variants: 1 },
  { rank: 179, word: 'brandt', translation: 'Брандт', category: 'people', frequency: 4, variants: 1 },
  { rank: 180, word: 'buslinie', translation: 'автобусний маршрут', category: 'place', frequency: 4, variants: 1 },
  { rank: 181, word: 'bündnis', translation: 'союз; коаліція', category: 'institution', frequency: 4, variants: 1 },
  { rank: 182, word: 'dadurch', translation: 'завдяки цьому; через це', category: 'linker', frequency: 4, variants: 1 },
  { rank: 183, word: 'denn', translation: 'тому що; адже', category: 'linker', frequency: 4, variants: 1 },
  { rank: 184, word: 'eigene', translation: 'власний; власна', category: 'linker', frequency: 4, variants: 1 },
  { rank: 185, word: 'einheit', translation: 'єдність; обʼєднання', category: 'history', frequency: 4, variants: 1 },
  { rank: 186, word: 'erhalten', translation: 'отримувати; зберігати', category: 'verb', frequency: 4, variants: 1 },
  { rank: 187, word: 'europa', translation: 'Європа', category: 'place', frequency: 4, variants: 1 },
  { rank: 188, word: 'fernseher', translation: 'телевізор', category: 'linker', frequency: 4, variants: 1 },
  { rank: 189, word: 'fest', translation: 'сталий; закріплений', category: 'descriptor', frequency: 4, variants: 1 },
  { rank: 190, word: 'finanzamt', translation: 'податкова служба', category: 'institution', frequency: 4, variants: 1 },
  { rank: 191, word: 'firma', translation: 'компанія; фірма', category: 'institution', frequency: 4, variants: 1 },
  { rank: 192, word: 'flagge', translation: 'прапор', category: 'descriptor', frequency: 4, variants: 1 },
  { rank: 193, word: 'freund', translation: 'друг', category: 'people', frequency: 4, variants: 3 },
  { rank: 194, word: 'führerschein', translation: 'водійське посвідчення', category: 'institution', frequency: 4, variants: 1 },
  { rank: 195, word: 'gastarbeiter', translation: 'гастарбайтер; запрошений працівник', category: 'people', frequency: 4, variants: 2 },
  { rank: 196, word: 'gegründet', translation: 'заснований; створений', category: 'verb', frequency: 4, variants: 1 },
  { rank: 197, word: 'hürde', translation: 'барʼєр; поріг', category: 'linker', frequency: 4, variants: 1 },
  { rank: 198, word: 'ihrem', translation: 'їхньому; її/його (давальний відмінок)', category: 'linker', frequency: 4, variants: 1 },
  { rank: 199, word: 'juden', translation: 'євреї', category: 'people', frequency: 4, variants: 1 },
  { rank: 200, word: 'judikative', translation: 'судова влада', category: 'institution', frequency: 4, variants: 1 }
];

const categoryMeta = {
  verb: {
    label: 'Дієслово',
    accent: 'var(--c-verb)',
    context: 'Часто трапляється у правилах, правах, обовʼязках і формулюваннях закону.'
  },
  institution: {
    label: 'Інституція',
    accent: 'var(--c-institution)',
    context: 'Ключове слово для державних органів, права, виборів і політичної системи.'
  },
  people: {
    label: 'Люди',
    accent: 'var(--c-people)',
    context: 'Соціальна лексика про громадян, працівників, сімʼю та ролі в суспільстві.'
  },
  place: {
    label: 'Місце',
    accent: 'var(--c-place)',
    context: 'Географія Німеччини, федеральні землі та країни в історичному контексті.'
  },
  history: {
    label: 'Історія',
    accent: 'var(--c-history)',
    context: 'Терміни для історичних періодів, режимів, воєн і політичних подій.'
  },
  descriptor: {
    label: 'Опис',
    accent: 'var(--c-descriptor)',
    context: 'Прикметники та ознаки, які описують державу, суспільство або політичні явища.'
  },
  linker: {
    label: 'Службове слово',
    accent: 'var(--c-linker)',
    context: 'Частотне слово, яке зʼєднує думки, пояснює умови або уточнює формулювання.'
  },
  time: {
    label: 'Час',
    accent: 'var(--c-descriptor)',
    context: 'Орієнтири в часі: роки, послідовність подій, хронологія й питання про час.'
  }
};

const iconMarkup = {
  verb: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h10"></path>
      <path d="M10 6l6 6-6 6"></path>
      <path d="M19 5v14"></path>
    </svg>
  `,
  institution: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9l9-4 9 4"></path>
      <path d="M5 10v8"></path>
      <path d="M10 10v8"></path>
      <path d="M14 10v8"></path>
      <path d="M19 10v8"></path>
      <path d="M3 20h18"></path>
    </svg>
  `,
  people: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3"></circle>
      <circle cx="16.5" cy="9" r="2.5"></circle>
      <path d="M4 19c0-3 2.5-5 5-5s5 2 5 5"></path>
      <path d="M13 19c.2-2.2 1.9-3.8 4.2-3.8S21 16.8 21 19"></path>
    </svg>
  `,
  place: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-4.8 6-10a6 6 0 1 0-12 0c0 5.2 6 10 6 10z"></path>
      <circle cx="12" cy="11" r="2.2"></circle>
    </svg>
  `,
  history: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8"></circle>
      <path d="M12 8v5l3 2"></path>
    </svg>
  `,
  descriptor: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.4 4.8L20 9l-4 3.8.9 5.2L12 15.5 7.1 18l.9-5.2L4 9l5.6-1.2z"></path>
    </svg>
  `,
  linker: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8h8"></path>
      <path d="M8 16h8"></path>
      <path d="M6 12h12"></path>
      <circle cx="4" cy="12" r="1.3"></circle>
      <circle cx="20" cy="12" r="1.3"></circle>
    </svg>
  `,
  time: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8"></circle>
      <path d="M12 7v5l3 2"></path>
    </svg>
  `
};

const searchInput = document.querySelector('#search-input');
const auxToggle = document.querySelector('#aux-toggle');
const auxList = document.querySelector('#aux-list');
const cardGrid = document.querySelector('#card-grid');
const resultCount = document.querySelector('#result-count');

let auxOnly = false;
let voiceCache = [];

function loadVoices() {
  if (!('speechSynthesis' in window)) {
    voiceCache = [];
    return;
  }

  voiceCache = window.speechSynthesis.getVoices();
}

function getGermanVoice() {
  return (
    voiceCache.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('de')) ||
    null
  );
}

function speakWord(word) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  loadVoices();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'de-DE';
  utterance.rate = 0.92;
  utterance.pitch = 1;

  const voice = getGermanVoice();
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function renderAuxiliaryList() {
  const auxiliaryWords = words.filter((entry) => entry.isAux);
  auxList.innerHTML = auxiliaryWords
    .map(
      (entry) => `
        <div class="aux-chip">
          <div class="aux-chip__top">
            <span class="aux-chip__word">${entry.word}</span>
            <span class="aux-chip__freq">${entry.frequency}</span>
          </div>
          <div class="aux-chip__translation">${entry.translation}</div>
        </div>
      `
    )
    .join('');
}

function buildCard(entry) {
  const meta = categoryMeta[entry.category];
  const card = document.createElement('article');
  card.className = 'flashcard';
  card.style.setProperty('--accent', meta.accent);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Картка для слова ${entry.word}`);

  card.innerHTML = `
    <div class="flashcard__inner">
      <div class="flashcard__face flashcard__face--front">
        <div class="flashcard__top">
          <span class="flashcard__badge">#${entry.rank}</span>
          <div class="flashcard__controls">
            <button class="flashcard__audio" type="button" aria-label="Вимова слова ${entry.word}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 9v6h4l5 4V5L9 9H5z"></path>
                <path d="M17 9a4 4 0 0 1 0 6"></path>
                <path d="M19 6a8 8 0 0 1 0 12"></path>
              </svg>
            </button>
            <div class="flashcard__icon">${iconMarkup[entry.category]}</div>
          </div>
        </div>
        <p class="flashcard__word">${entry.word}</p>
        <p class="flashcard__hint">Клік для перекладу, кнопка звуку для вимови</p>
        <div class="flashcard__meta">
          <span>Частота: ${entry.frequency}</span>
          <span>Форм: ${entry.variants}</span>
        </div>
        <p class="flashcard__tag">${meta.label}</p>
      </div>
      <div class="flashcard__face flashcard__face--back">
        <div>
          <div class="flashcard__top">
            <p class="flashcard__badge">#${entry.rank}</p>
            <button class="flashcard__audio" type="button" aria-label="Вимова слова ${entry.word}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 9v6h4l5 4V5L9 9H5z"></path>
                <path d="M17 9a4 4 0 0 1 0 6"></path>
                <path d="M19 6a8 8 0 0 1 0 12"></path>
              </svg>
            </button>
          </div>
          <p class="flashcard__translation">${entry.translation}</p>
        </div>
        <p class="flashcard__context">${meta.context}</p>
      </div>
    </div>
  `;

  card.querySelectorAll('.flashcard__audio').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      speakWord(entry.word);
    });
  });

  card.addEventListener('click', (event) => {
    if (event.target.closest('.flashcard__audio')) {
      return;
    }

    card.classList.toggle('is-flipped');
  });

  card.addEventListener('keydown', (event) => {
    if (event.target.closest('.flashcard__audio')) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.classList.toggle('is-flipped');
    }
  });

  return card;
}

function getFilteredWords() {
  const query = searchInput.value.trim().toLowerCase();
  return words.filter((entry) => {
    const matchesAux = !auxOnly || entry.isAux;
    const matchesQuery =
      !query ||
      entry.word.toLowerCase().includes(query) ||
      entry.translation.toLowerCase().includes(query);
    return matchesAux && matchesQuery;
  });
}

function renderDeck() {
  const filtered = getFilteredWords();
  resultCount.textContent = `Показано ${filtered.length} з ${words.length} карток.`;
  cardGrid.innerHTML = '';

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Нічого не знайдено. Спробуй інше слово або скинь фільтр.';
    cardGrid.append(empty);
    return;
  }

  filtered.forEach((entry) => {
    cardGrid.append(buildCard(entry));
  });
}

searchInput.addEventListener('input', renderDeck);

auxToggle.addEventListener('click', () => {
  auxOnly = !auxOnly;
  auxToggle.setAttribute('aria-pressed', String(auxOnly));
  renderDeck();
});

renderAuxiliaryList();
renderDeck();
