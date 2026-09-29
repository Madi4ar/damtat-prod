// Датасет блюд для MVP «Персонального помощника по готовке».
// Все данные — демонстрационные (условные цены в ₸, условное КБЖУ).

// Ингредиенты-«стапл»: считаются, что почти всегда есть дома,
// поэтому не мешают сценарию «Из того, что есть дома».
const PANTRY_STAPLES = [
  'соль', 'специи', 'перец', 'сахар', 'вода', 'масло растительное',
  'оливковое масло', 'масло для фритюра'
];

function isPantryItem(name) {
  const n = name.toLowerCase();
  return PANTRY_STAPLES.some((p) => n.includes(p));
}

const DISHES = [
  {
    id: 'chicken-veg', name: 'Куриное филе с овощами', category: 'main', emoji: '🍗',
    cuisine: 'european', time: 30, servings: 2, baseCost: 2900,
    kbju: { cal: 480, protein: 42, fat: 18, carbs: 36 },
    ingredients: [
      { name: 'куриное филе', qty: 400, unit: 'г' },
      { name: 'кабачки', qty: 200, unit: 'г' },
      { name: 'морковь', qty: 100, unit: 'г' },
      { name: 'перец болгарский', qty: 150, unit: 'г' },
      { name: 'масло растительное', qty: 30, unit: 'мл' },
      { name: 'соль', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Нарежьте куриное филе кубиками и обжарьте на растительном масле до золотистой корочки.',
      'Добавьте нарезанные овощи и готовьте на среднем огне 12–15 минут.',
      'Посолите, поперчите по вкусу и подавайте горячим.',
    ],
  },
  {
    id: 'lagman', name: 'Лагман', category: 'main', emoji: '🍜',
    cuisine: 'asian', time: 50, servings: 4, baseCost: 15600,
    kbju: { cal: 560, protein: 28, fat: 20, carbs: 68 },
    ingredients: [
      { name: 'лапша', qty: 400, unit: 'г' },
      { name: 'говядина', qty: 400, unit: 'г' },
      { name: 'морковь', qty: 150, unit: 'г' },
      { name: 'лук', qty: 150, unit: 'г' },
      { name: 'перец болгарский', qty: 150, unit: 'г' },
      { name: 'помидоры', qty: 200, unit: 'г' },
      { name: 'чеснок', qty: 20, unit: 'г' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Нарежьте мясо соломкой и обжарьте до румяной корочки.',
      'Добавьте лук, морковь, перец, чеснок и томите 10 минут.',
      'Добавьте помидоры и немного воды, тушите 20 минут.',
      'Отдельно отварите лапшу, подавайте с соусом и зеленью.',
    ],
  },
  {
    id: 'fish-potato', name: 'Запечённая рыба с картофелем', category: 'main', emoji: '🐟',
    cuisine: 'european', time: 40, servings: 2, baseCost: 9000,
    kbju: { cal: 510, protein: 38, fat: 22, carbs: 40 },
    ingredients: [
      { name: 'филе рыбы', qty: 400, unit: 'г' },
      { name: 'картофель', qty: 500, unit: 'г' },
      { name: 'лимон', qty: 0.5, unit: 'шт' },
      { name: 'масло растительное', qty: 20, unit: 'мл' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Нарежьте картофель кружочками и выложите на противень.',
      'Сверху выложите рыбу, сбрызните маслом и лимонным соком.',
      'Запекайте при 200°C 30 минут.',
    ],
  },
  {
    id: 'chicken-rice', name: 'Курица с рисом', category: 'main', emoji: '🍚',
    cuisine: 'other', time: 35, servings: 2, baseCost: 7000,
    kbju: { cal: 540, protein: 36, fat: 16, carbs: 55 },
    ingredients: [
      { name: 'курица', qty: 400, unit: 'г' },
      { name: 'рис', qty: 300, unit: 'г' },
      { name: 'морковь', qty: 100, unit: 'г' },
      { name: 'лук', qty: 100, unit: 'г' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Обжарьте курицу до золотистого цвета.',
      'Добавьте лук и морковь, обжарьте 5 минут.',
      'Добавьте рис и воду, тушите под крышкой 20 минут.',
    ],
  },
  {
    id: 'pasta-veg', name: 'Паста с овощами', category: 'main', emoji: '🍝',
    cuisine: 'italian', time: 25, servings: 2, baseCost: 5600,
    kbju: { cal: 430, protein: 14, fat: 12, carbs: 68 },
    ingredients: [
      { name: 'макароны', qty: 300, unit: 'г' },
      { name: 'кабачки', qty: 150, unit: 'г' },
      { name: 'помидоры', qty: 200, unit: 'г' },
      { name: 'чеснок', qty: 10, unit: 'г' },
      { name: 'оливковое масло', qty: 20, unit: 'мл' },
      { name: 'сыр', qty: 50, unit: 'г' },
    ],
    steps: [
      'Отварите макароны до состояния аль денте.',
      'Обжарьте чеснок и овощи на оливковом масле.',
      'Смешайте с пастой, посыпьте тёртым сыром.',
    ],
  },
  {
    id: 'plov', name: 'Плов', category: 'main', emoji: '🍛',
    cuisine: 'asian', time: 60, servings: 6, baseCost: 30000,
    kbju: { cal: 560, protein: 20, fat: 18, carbs: 75 },
    ingredients: [
      { name: 'рис', qty: 700, unit: 'г' },
      { name: 'говядина', qty: 800, unit: 'г' },
      { name: 'морковь', qty: 600, unit: 'г' },
      { name: 'лук', qty: 300, unit: 'г' },
      { name: 'масло растительное', qty: 100, unit: 'мл' },
      { name: 'чеснок', qty: 30, unit: 'г' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Обжарьте мясо до корочки, добавьте лук и морковь.',
      'Тушите зирвак 20 минут, добавьте специи и чеснок.',
      'Выложите промытый рис, залейте водой и томите под крышкой 30–40 минут.',
    ],
  },
  {
    id: 'beshbarmak', name: 'Бешбармак', category: 'main', emoji: '🍖',
    cuisine: 'kazakh', time: 110, servings: 10, baseCost: 30000,
    kbju: { cal: 650, protein: 40, fat: 30, carbs: 50 },
    ingredients: [
      { name: 'мука', qty: 800, unit: 'г' },
      { name: 'говядина', qty: 2000, unit: 'г' },
      { name: 'лук', qty: 400, unit: 'г' },
      { name: 'яйца', qty: 1, unit: 'шт' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Отварите мясо до готовности с луком и специями.',
      'Замесите тесто, раскатайте и отварите в бульоне.',
      'Выложите тесто, мясо и лук на большое блюдо, полейте соусом.',
    ],
  },
  {
    id: 'baursaki', name: 'Баурсаки', category: 'snack', emoji: '🍩',
    cuisine: 'kazakh', time: 40, servings: 10, baseCost: 6000,
    kbju: { cal: 320, protein: 6, fat: 14, carbs: 42 },
    ingredients: [
      { name: 'мука', qty: 1000, unit: 'г' },
      { name: 'молоко', qty: 300, unit: 'мл' },
      { name: 'дрожжи', qty: 10, unit: 'г' },
      { name: 'сахар', qty: 30, unit: 'г' },
      { name: 'масло для фритюра', qty: 500, unit: 'мл' },
    ],
    steps: [
      'Замесите дрожжевое тесто и дайте подойти 1 час.',
      'Раскатайте, нарежьте кусочками.',
      'Обжарьте во фритюре до золотистого цвета.',
    ],
  },
  {
    id: 'meat-plate', name: 'Мясная закуска', category: 'snack', emoji: '🥓',
    cuisine: 'kazakh', time: 15, servings: 10, baseCost: 8000,
    kbju: { cal: 250, protein: 18, fat: 20, carbs: 2 },
    ingredients: [
      { name: 'казы', qty: 500, unit: 'г' },
      { name: 'говядина отварная', qty: 300, unit: 'г' },
    ],
    steps: ['Нарежьте мясные продукты тонкими ломтиками и выложите на блюдо.'],
  },
  {
    id: 'achik-chuchuk', name: 'Салат «Ачик-чучук»', category: 'salad', emoji: '🍅',
    cuisine: 'kazakh', time: 15, servings: 6, baseCost: 3000,
    kbju: { cal: 60, protein: 2, fat: 1, carbs: 10 },
    ingredients: [
      { name: 'помидоры', qty: 500, unit: 'г' },
      { name: 'лук', qty: 200, unit: 'г' },
      { name: 'зелень', qty: 30, unit: 'г' },
    ],
    steps: ['Нарежьте помидоры и лук тонкими кольцами, посолите, перемешайте с зеленью.'],
  },
  {
    id: 'olivie', name: 'Салат «Оливье»', category: 'salad', emoji: '🥗',
    cuisine: 'other', time: 30, servings: 6, baseCost: 4200,
    kbju: { cal: 280, protein: 8, fat: 20, carbs: 18 },
    ingredients: [
      { name: 'картофель', qty: 400, unit: 'г' },
      { name: 'морковь', qty: 150, unit: 'г' },
      { name: 'яйца', qty: 4, unit: 'шт' },
      { name: 'колбаса', qty: 200, unit: 'г' },
      { name: 'горошек консервированный', qty: 200, unit: 'г' },
      { name: 'майонез', qty: 150, unit: 'г' },
    ],
    steps: [
      'Отварите картофель, морковь и яйца, нарежьте кубиками.',
      'Добавьте колбасу и горошек, заправьте майонезом.',
    ],
  },
  {
    id: 'fruit-plate', name: 'Фруктовая тарелка', category: 'dessert', emoji: '🍇',
    cuisine: 'other', time: 15, servings: 10, baseCost: 7000,
    kbju: { cal: 90, protein: 1, fat: 0, carbs: 22 },
    ingredients: [
      { name: 'яблоки', qty: 500, unit: 'г' },
      { name: 'виноград', qty: 400, unit: 'г' },
      { name: 'апельсины', qty: 500, unit: 'г' },
    ],
    steps: ['Вымойте и нарежьте фрукты, красиво разложите на блюде.'],
  },
  {
    id: 'kompot', name: 'Компот из сухофруктов', category: 'drink', emoji: '🥤',
    cuisine: 'other', time: 20, servings: 10, baseCost: 2500,
    kbju: { cal: 80, protein: 0, fat: 0, carbs: 20 },
    ingredients: [
      { name: 'сухофрукты', qty: 300, unit: 'г' },
      { name: 'сахар', qty: 100, unit: 'г' },
      { name: 'вода', qty: 2, unit: 'л' },
    ],
    steps: ['Залейте сухофрукты водой, добавьте сахар и варите 15 минут.'],
  },
  {
    id: 'omelet', name: 'Омлет с сыром', category: 'main', emoji: '🍳',
    cuisine: 'other', time: 15, servings: 2, baseCost: 1600,
    kbju: { cal: 320, protein: 20, fat: 24, carbs: 4 },
    ingredients: [
      { name: 'яйца', qty: 4, unit: 'шт' },
      { name: 'сыр', qty: 100, unit: 'г' },
      { name: 'молоко', qty: 50, unit: 'мл' },
      { name: 'масло растительное', qty: 10, unit: 'мл' },
    ],
    steps: [
      'Взбейте яйца с молоком и солью.',
      'Вылейте на разогретую сковороду, посыпьте тёртым сыром.',
      'Готовьте под крышкой 5–7 минут.',
    ],
  },
  {
    id: 'buckwheat-chicken', name: 'Гречка с курицей', category: 'main', emoji: '🌾',
    cuisine: 'other', time: 30, servings: 2, baseCost: 5200,
    kbju: { cal: 450, protein: 34, fat: 10, carbs: 50 },
    ingredients: [
      { name: 'гречка', qty: 300, unit: 'г' },
      { name: 'куриное филе', qty: 300, unit: 'г' },
      { name: 'лук', qty: 80, unit: 'г' },
      { name: 'морковь', qty: 80, unit: 'г' },
    ],
    steps: [
      'Обжарьте курицу с луком и морковью.',
      'Отварите гречку отдельно и смешайте с курицей.',
    ],
  },
  {
    id: 'dimlyama', name: 'Дымляма', category: 'main', emoji: '🍲',
    cuisine: 'asian', time: 70, servings: 4, baseCost: 16000,
    kbju: { cal: 500, protein: 26, fat: 20, carbs: 55 },
    ingredients: [
      { name: 'говядина', qty: 500, unit: 'г' },
      { name: 'картофель', qty: 500, unit: 'г' },
      { name: 'капуста', qty: 400, unit: 'г' },
      { name: 'помидоры', qty: 300, unit: 'г' },
      { name: 'перец болгарский', qty: 200, unit: 'г' },
    ],
    steps: [
      'Выложите слоями мясо и овощи в казан.',
      'Тушите на медленном огне под крышкой 50–60 минут без добавления воды.',
    ],
  },
  {
    id: 'caesar', name: 'Салат «Цезарь» с курицей', category: 'main', emoji: '🥙',
    cuisine: 'european', time: 25, servings: 2, baseCost: 5400,
    kbju: { cal: 420, protein: 32, fat: 22, carbs: 20 },
    ingredients: [
      { name: 'куриное филе', qty: 250, unit: 'г' },
      { name: 'салат айсберг', qty: 150, unit: 'г' },
      { name: 'сыр', qty: 50, unit: 'г' },
      { name: 'гренки', qty: 50, unit: 'г' },
      { name: 'помидоры черри', qty: 100, unit: 'г' },
    ],
    steps: [
      'Обжарьте куриное филе и нарежьте полосками.',
      'Смешайте с листьями салата, гренками и помидорами.',
      'Заправьте соусом цезарь, посыпьте сыром.',
    ],
  },
  {
    id: 'manty', name: 'Манты', category: 'main', emoji: '🥟',
    cuisine: 'asian', time: 90, servings: 10, baseCost: 18000,
    kbju: { cal: 480, protein: 22, fat: 26, carbs: 40 },
    ingredients: [
      { name: 'мука', qty: 800, unit: 'г' },
      { name: 'говядина', qty: 1000, unit: 'г' },
      { name: 'лук', qty: 500, unit: 'г' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Замесите тесто и дайте ему отдохнуть 30 минут.',
      'Приготовьте начинку из мяса и лука.',
      'Слепите манты и готовьте на пару 40–45 минут.',
    ],
  },
  {
    id: 'chicken-soup', name: 'Лёгкий куриный суп', category: 'main', emoji: '🍲',
    cuisine: 'other', time: 40, servings: 4, baseCost: 6000,
    kbju: { cal: 280, protein: 22, fat: 10, carbs: 20 },
    ingredients: [
      { name: 'курица', qty: 500, unit: 'г' },
      { name: 'картофель', qty: 300, unit: 'г' },
      { name: 'морковь', qty: 100, unit: 'г' },
      { name: 'лук', qty: 100, unit: 'г' },
      { name: 'вермишель', qty: 80, unit: 'г' },
      { name: 'зелень', qty: 20, unit: 'г' },
    ],
    steps: [
      'Отварите курицу до готовности, достаньте и разберите на волокна.',
      'В бульон добавьте картофель, морковь и лук, варите 15 минут.',
      'Добавьте вермишель и курицу, варите ещё 5 минут.',
    ],
  },
  {
    id: 'gulyash', name: 'Гуляш с картофельным пюре', category: 'main', emoji: '🍖',
    cuisine: 'european', time: 45, servings: 4, baseCost: 9600,
    kbju: { cal: 460, protein: 28, fat: 20, carbs: 38 },
    ingredients: [
      { name: 'говядина', qty: 600, unit: 'г' },
      { name: 'картофель', qty: 600, unit: 'г' },
      { name: 'лук', qty: 150, unit: 'г' },
      { name: 'томатная паста', qty: 50, unit: 'г' },
      { name: 'специи', qty: 1, unit: 'по вкусу' },
    ],
    steps: [
      'Обжарьте мясо с луком, добавьте томатную пасту и немного воды.',
      'Тушите 30–35 минут до мягкости мяса.',
      'Отдельно отварите картофель и разомните в пюре.',
    ],
  },
];

const CUISINE_LABELS = {
  kazakh: 'Казахская',
  asian: 'Азиатская',
  european: 'Европейская',
  italian: 'Итальянская',
  other: 'Домашняя',
};
