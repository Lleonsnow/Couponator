export const ALL_CITIES = "Все города";

export const CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Красноярск",
  "Челябинск",
  "Самара",
  "Уфа",
  "Ростов-на-Дону",
  "Краснодар",
  "Омск",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Барнаул",
  "Ижевск",
  "Махачкала",
  "Хабаровск",
  "Ульяновск",
  "Иркутск",
  "Владивосток",
  "Ярославль",
  "Кемерово",
  "Томск",
  "Набережные Челны",
  "Севастополь",
  "Ставрополь",
  "Оренбург",
  "Новокузнецк",
  "Рязань",
  "Балашиха",
  "Пенза",
  "Чебоксары",
  "Липецк",
  "Калининград",
  "Астрахань",
  "Тула",
  "Тверь",
  "Киров",
  "Сочи",
];

const STORAGE_KEY = "city";

export function getStoredCity(): string {
  if (typeof window === "undefined") return "Москва";
  const s = localStorage.getItem(STORAGE_KEY);
  return s && (s === ALL_CITIES || CITIES.includes(s)) ? s : "Москва";
}

export function setStoredCity(city: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, city);
}
