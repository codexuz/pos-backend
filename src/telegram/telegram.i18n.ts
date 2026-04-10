export type Lang = 'en' | 'uz' | 'ru';

const t = {
  // ─── General ──────────────────────────────────────────────────────
  cancelled: { en: '❌ Cancelled.', uz: '❌ Bekor qilindi.', ru: '❌ Отменено.' },
  back: { en: '🔙 Back', uz: '🔙 Orqaga', ru: '🔙 Назад' },
  cancel: { en: '❌ Cancel', uz: '❌ Bekor', ru: '❌ Отмена' },
  yes: { en: '✅ Yes', uz: '✅ Ha', ru: '✅ Да' },
  no: { en: '❌ No', uz: '❌ Yo\'q', ru: '❌ Нет' },
  confirm_delete: { en: '⚠️ Are you sure you want to delete?', uz: '⚠️ O\'chirishni tasdiqlaysizmi?', ru: '⚠️ Вы уверены, что хотите удалить?' },
  deleted: { en: '🗑 Deleted successfully.', uz: '🗑 Muvaffaqiyatli o\'chirildi.', ru: '🗑 Успешно удалено.' },
  created: { en: '✅ Created successfully.', uz: '✅ Muvaffaqiyatli yaratildi.', ru: '✅ Успешно создано.' },
  updated: { en: '✅ Updated successfully.', uz: '✅ Muvaffaqiyatli yangilandi.', ru: '✅ Успешно обновлено.' },
  invalid_input: { en: '❌ Invalid input. Please try again.', uz: '❌ Noto\'g\'ri kiritish. Qaytadan urinib ko\'ring.', ru: '❌ Неверный ввод. Попробуйте снова.' },
  not_found: { en: '❌ Not found.', uz: '❌ Topilmadi.', ru: '❌ Не найдено.' },
  error: { en: '❌ An error occurred. Please try again.', uz: '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.', ru: '❌ Произошла ошибка. Попробуйте снова.' },
  select_action: { en: 'Select an action:', uz: 'Amalni tanlang:', ru: 'Выберите действие:' },
  enter_name: { en: 'Enter name:', uz: 'Nomini kiriting:', ru: 'Введите название:' },
  enter_description: { en: 'Enter description (or /skip):', uz: 'Tavsif kiriting (yoki /skip):', ru: 'Введите описание (или /skip):' },
  enter_phone: { en: 'Enter phone (or /skip):', uz: 'Telefon kiriting (yoki /skip):', ru: 'Введите телефон (или /skip):' },
  enter_address: { en: 'Enter address (or /skip):', uz: 'Manzil kiriting (yoki /skip):', ru: 'Введите адрес (или /skip):' },
  enter_notes: { en: 'Enter notes (or /skip):', uz: 'Izoh kiriting (yoki /skip):', ru: 'Введите заметки (или /skip):' },
  skip: { en: '/skip', uz: '/skip', ru: '/skip' },
  page_info: { en: 'Page {page}/{total}', uz: 'Sahifa {page}/{total}', ru: 'Стр. {page}/{total}' },
  add: { en: '➕ Add', uz: '➕ Qo\'shish', ru: '➕ Добавить' },
  edit: { en: '✏️ Edit', uz: '✏️ Tahrirlash', ru: '✏️ Изменить' },
  delete_btn: { en: '🗑 Delete', uz: '🗑 O\'chirish', ru: '🗑 Удалить' },
  search: { en: '🔍 Search', uz: '🔍 Qidirish', ru: '🔍 Qidiruv' },
  refresh: { en: '🔄 Refresh', uz: '🔄 Yangilash', ru: '🔄 Обновить' },

  // ─── Language ─────────────────────────────────────────────────────
  choose_language: { en: '🌐 Choose language:', uz: '🌐 Tilni tanlang:', ru: '🌐 Выберите язык:' },
  language_set: { en: '✅ Language set to English.', uz: '✅ Til o\'zbek tiliga o\'zgartirildi.', ru: '✅ Язык изменен на русский.' },

  // ─── Auth ─────────────────────────────────────────────────────────
  not_logged_in: { en: '🔒 You are not logged in. Use /login to authenticate.', uz: '🔒 Siz tizimga kirmagansiz. /login buyrug\'ini ishlating.', ru: '🔒 Вы не авторизованы. Используйте /login.' },
  already_logged_in: { en: '✅ You are already logged in. Use /logout to switch.', uz: '✅ Siz allaqachon tizimdasiz. /logout orqali almashtirishingiz mumkin.', ru: '✅ Вы уже авторизованы. Используйте /logout для смены.' },
  login_prompt: {
    en: '📱 Please share your phone number to log in.\n\nYou can:\n• Tap the button below to share your contact\n• Type your phone number (e.g. +998901234567)',
    uz: '📱 Kirish uchun telefon raqamingizni yuboring.\n\nSiz:\n• Pastdagi tugmani bosib kontaktni ulashishingiz\n• Telefon raqamingizni yozishingiz mumkin (+998901234567)',
    ru: '📱 Отправьте номер телефона для входа.\n\nВы можете:\n• Нажать кнопку ниже для отправки контакта\n• Ввести номер телефона (+998901234567)',
  },
  share_phone: { en: '📱 Share Phone Number', uz: '📱 Telefon raqamni yuborish', ru: '📱 Отправить номер телефона' },
  login_failed: {
    en: '❌ No account found with this phone number.\nMake sure you\'re using the phone from your POS account.',
    uz: '❌ Bu telefon raqam bilan hisob topilmadi.\nPOS tizimidagi telefon raqamingizni ishlating.',
    ru: '❌ Аккаунт с этим номером не найден.\nУбедитесь, что используете телефон из POS системы.',
  },
  login_success: {
    en: '✅ Welcome, *{name}*!\n\n🏢 Tenant: *{tenant}*\n📞 Phone: {phone}',
    uz: '✅ Xush kelibsiz, *{name}*!\n\n🏢 Tashkilot: *{tenant}*\n📞 Telefon: {phone}',
    ru: '✅ Добро пожаловать, *{name}*!\n\n🏢 Организация: *{tenant}*\n📞 Телефон: {phone}',
  },
  logged_out: { en: '👋 Logged out. Use /login to sign in again.', uz: '👋 Tizimdan chiqdingiz. /login orqali qayta kiring.', ru: '👋 Вы вышли. Используйте /login для входа.' },

  // ─── Start / Welcome ──────────────────────────────────────────────
  welcome_auth: { en: '👋 Welcome back! Use the menu to manage your POS.', uz: '👋 Xush kelibsiz! Menyudan POS tizimini boshqaring.', ru: '👋 С возвращением! Используйте меню для управления POS.' },
  welcome_new: {
    en: '👋 Welcome to POS Bot!\n\nManage your Point of Sale from Telegram.\n\n🔐 Use /login to authenticate.\n🌐 Use /lang to change language.',
    uz: '👋 POS Botga xush kelibsiz!\n\nTelegram orqali savdo nuqtangizni boshqaring.\n\n🔐 /login — tizimga kirish\n🌐 /lang — tilni o\'zgartirish',
    ru: '👋 Добро пожаловать в POS бот!\n\nУправляйте точкой продаж через Telegram.\n\n🔐 /login — авторизация\n🌐 /lang — сменить язык',
  },

  // ─── Main Menu Buttons ────────────────────────────────────────────
  btn_dashboard: { en: '📊 Dashboard', uz: '📊 Boshqaruv', ru: '📊 Панель' },
  btn_pos: { en: '🛒 POS Sale', uz: '🛒 Sotish', ru: '🛒 Продажа' },
  btn_products: { en: '📦 Products', uz: '📦 Mahsulotlar', ru: '📦 Товары' },
  btn_inventory: { en: '📋 Inventory', uz: '📋 Ombor', ru: '📋 Склад' },
  btn_clients: { en: '👥 Clients', uz: '👥 Mijozlar', ru: '👥 Клиенты' },
  btn_sales: { en: '📈 Sales', uz: '📈 Sotuvlar', ru: '📈 Продажи' },
  btn_finance: { en: '💰 Finance', uz: '💰 Moliya', ru: '💰 Финансы' },
  btn_debts: { en: '💸 Debts', uz: '💸 Qarzlar', ru: '💸 Долги' },
  btn_branches: { en: '🏢 Branches', uz: '🏢 Filiallar', ru: '🏢 Филиалы' },
  btn_categories: { en: '📂 Categories', uz: '📂 Kategoriyalar', ru: '📂 Категории' },
  btn_transactions: { en: '📒 Transactions', uz: '📒 Tranzaksiyalar', ru: '📒 Транзакции' },
  btn_settings: { en: '⚙️ Settings', uz: '⚙️ Sozlamalar', ru: '⚙️ Настройки' },
  btn_help: { en: '❓ Help', uz: '❓ Yordam', ru: '❓ Помощь' },

  // ─── Dashboard ────────────────────────────────────────────────────
  dashboard_title: { en: '📊 *Today\'s Dashboard*', uz: '📊 *Bugungi ko\'rsatkichlar*', ru: '📊 *Панель за сегодня*' },
  sales_label: { en: '🛒 *Sales*', uz: '🛒 *Sotuvlar*', ru: '🛒 *Продажи*' },
  sales_count: { en: 'Sales', uz: 'Sotuvlar', ru: 'Продажи' },
  revenue: { en: 'Revenue', uz: 'Tushum', ru: 'Выручка' },
  paid: { en: 'Paid', uz: 'To\'langan', ru: 'Оплачено' },
  outstanding: { en: 'Outstanding', uz: 'Qoldiq', ru: 'Задолженность' },
  finance_label: { en: '💰 *Finance*', uz: '💰 *Moliya*', ru: '💰 *Финансы*' },
  total_income: { en: 'Total Income', uz: 'Jami daromad', ru: 'Общий доход' },
  expenses: { en: 'Expenses', uz: 'Xarajatlar', ru: 'Расходы' },
  net_profit: { en: 'Net Profit', uz: 'Sof foyda', ru: 'Чистая прибыль' },
  debts_label: { en: '💸 *Debts*', uz: '💸 *Qarzlar*', ru: '💸 *Долги*' },
  total_debt: { en: 'Total Debt', uz: 'Jami qarz', ru: 'Общий долг' },
  pending: { en: 'Pending', uz: 'Kutilmoqda', ru: 'Ожидает' },
  partial: { en: 'Partial', uz: 'Qisman', ru: 'Частично' },

  // ─── Sales Report ─────────────────────────────────────────────────
  sales_report_today: { en: '📈 *Sales Report (Today)*', uz: '📈 *Sotuv hisoboti (Bugun)*', ru: '📈 *Отчет продаж (Сегодня)*' },
  sales_report_week: { en: '📈 *Sales Report (Last 7 Days)*', uz: '📈 *Sotuv hisoboti (7 kun)*', ru: '📈 *Отчет продаж (7 дней)*' },
  sales_report_month: { en: '📈 *Sales Report (This Month)*', uz: '📈 *Sotuv hisoboti (Bu oy)*', ru: '📈 *Отчет продаж (Этот месяц)*' },
  total_sales: { en: 'Total Sales', uz: 'Jami sotuvlar', ru: 'Всего продаж' },
  total_amount: { en: 'Total Amount', uz: 'Jami summa', ru: 'Общая сумма' },
  seller_profit: { en: 'Seller Profit', uz: 'Sotuvchi foydasi', ru: 'Прибыль продавца' },
  this_week: { en: '📅 This Week', uz: '📅 Bu hafta', ru: '📅 Эта неделя' },
  this_month: { en: '📅 This Month', uz: '📅 Bu oy', ru: '📅 Этот месяц' },

  // ─── Financial ────────────────────────────────────────────────────
  financial_today: { en: '💰 *Financial Summary (Today)*', uz: '💰 *Moliyaviy hisobot (Bugun)*', ru: '💰 *Финансовый отчёт (Сегодня)*' },
  financial_week: { en: '💰 *Financial Summary (Last 7 Days)*', uz: '💰 *Moliyaviy hisobot (7 kun)*', ru: '💰 *Финансовый отчёт (7 дней)*' },
  financial_month: { en: '💰 *Financial Summary (This Month)*', uz: '💰 *Moliyaviy hisobot (Bu oy)*', ru: '💰 *Финансовый отчёт (Этот месяц)*' },
  sales_revenue: { en: 'Sales Revenue', uz: 'Sotuv tushumi', ru: 'Выручка с продаж' },
  other_income: { en: 'Other Income', uz: 'Boshqa daromad', ru: 'Прочий доход' },

  // ─── Top Products / Sellers ───────────────────────────────────────
  top_products_title: { en: '🏆 *Top Products*', uz: '🏆 *Eng ko\'p sotilganlar*', ru: '🏆 *Топ товары*' },
  top_sellers_title: { en: '👥 *Top Sellers*', uz: '👥 *Eng yaxshi sotuvchilar*', ru: '👥 *Топ продавцы*' },
  no_data: { en: 'No data available yet.', uz: 'Hali ma\'lumot yo\'q.', ru: 'Данных пока нет.' },

  // ─── Products ─────────────────────────────────────────────────────
  products_title: { en: '📦 *Products*', uz: '📦 *Mahsulotlar*', ru: '📦 *Товары*' },
  products_empty: { en: 'No products found.', uz: 'Mahsulotlar topilmadi.', ru: 'Товары не найдены.' },
  product_detail: { en: '📦 *Product Detail*', uz: '📦 *Mahsulot tafsiloti*', ru: '📦 *Детали товара*' },
  product_name: { en: 'Name', uz: 'Nomi', ru: 'Название' },
  product_price: { en: 'Price', uz: 'Narx', ru: 'Цена' },
  cost_price: { en: 'Cost Price', uz: 'Tan narx', ru: 'Себестоимость' },
  selling_price: { en: 'Selling Price', uz: 'Sotish narx', ru: 'Цена продажи' },
  product_sku: { en: 'SKU', uz: 'SKU', ru: 'Артикул' },
  product_barcode: { en: 'Barcode', uz: 'Shtrixkod', ru: 'Штрихкод' },
  enter_selling_price: { en: 'Enter selling price:', uz: 'Sotish narxini kiriting:', ru: 'Введите цену продажи:' },
  enter_cost_price: { en: 'Enter cost price (or /skip):', uz: 'Tan narxini kiriting (yoki /skip):', ru: 'Введите себестоимость (или /skip):' },
  select_category: { en: 'Select category (or /skip):', uz: 'Kategoriya tanlang (yoki /skip):', ru: 'Выберите категорию (или /skip):' },
  search_products: { en: '🔍 Enter product name to search:', uz: '🔍 Qidirish uchun mahsulot nomini kiriting:', ru: '🔍 Введите название товара для поиска:' },

  // ─── Inventory ────────────────────────────────────────────────────
  inventory_title: { en: '📋 *Inventory*', uz: '📋 *Ombor*', ru: '📋 *Склад*' },
  inventory_empty: { en: 'Inventory is empty.', uz: 'Ombor bo\'sh.', ru: 'Склад пуст.' },
  low_stock_title: { en: '⚠️ *Low Stock Alert*', uz: '⚠️ *Kam qoldiq ogohlantirish*', ru: '⚠️ *Мало на складе*' },
  low_stock_ok: { en: '✅ No low stock items!', uz: '✅ Kam qoldiqli mahsulotlar yo\'q!', ru: '✅ Нет товаров с низким остатком!' },
  stock: { en: 'Stock', uz: 'Qoldiq', ru: 'Остаток' },
  min_stock: { en: 'Min', uz: 'Min', ru: 'Мин' },
  enter_quantity: { en: 'Enter quantity:', uz: 'Miqdorni kiriting:', ru: 'Введите количество:' },
  enter_min_quantity: { en: 'Enter min quantity (or /skip):', uz: 'Min miqdorni kiriting (yoki /skip):', ru: 'Мин. количество (или /skip):' },
  select_product: { en: 'Select product:', uz: 'Mahsulotni tanlang:', ru: 'Выберите товар:' },

  // ─── Clients ──────────────────────────────────────────────────────
  clients_title: { en: '👥 *Clients*', uz: '👥 *Mijozlar*', ru: '👥 *Клиенты*' },
  clients_empty: { en: 'No clients found.', uz: 'Mijozlar topilmadi.', ru: 'Клиенты не найдены.' },
  client_detail: { en: '👤 *Client Detail*', uz: '👤 *Mijoz tafsiloti*', ru: '👤 *Детали клиента*' },
  enter_fullname: { en: 'Enter full name:', uz: 'To\'liq ismni kiriting:', ru: 'Введите ФИО:' },

  // ─── Branches ─────────────────────────────────────────────────────
  branches_title: { en: '🏢 *Branches*', uz: '🏢 *Filiallar*', ru: '🏢 *Филиалы*' },
  branches_empty: { en: 'No branches found.', uz: 'Filiallar topilmadi.', ru: 'Филиалы не найдены.' },
  branch_detail: { en: '🏢 *Branch Detail*', uz: '🏢 *Filial tafsiloti*', ru: '🏢 *Детали филиала*' },
  select_branch: { en: 'Select branch:', uz: 'Filialni tanlang:', ru: 'Выберите филиал:' },

  // ─── Categories ───────────────────────────────────────────────────
  categories_title: { en: '📂 *Categories*', uz: '📂 *Kategoriyalar*', ru: '📂 *Категории*' },
  categories_empty: { en: 'No categories found.', uz: 'Kategoriyalar topilmadi.', ru: 'Категории не найдены.' },

  // ─── Transactions ─────────────────────────────────────────────────
  transactions_title: { en: '📒 *Transactions*', uz: '📒 *Tranzaksiyalar*', ru: '📒 *Транзакции*' },
  transactions_empty: { en: 'No transactions found.', uz: 'Tranzaksiyalar topilmadi.', ru: 'Транзакции не найдены.' },
  income_only: { en: '📥 Income', uz: '📥 Daromad', ru: '📥 Доход' },
  expense_only: { en: '📤 Expense', uz: '📤 Xarajat', ru: '📤 Расход' },
  enter_amount: { en: 'Enter amount:', uz: 'Summani kiriting:', ru: 'Введите сумму:' },
  select_type: { en: 'Select type:', uz: 'Turni tanlang:', ru: 'Выберите тип:' },

  // ─── Debts ────────────────────────────────────────────────────────
  debts_title: { en: '💸 *Debt Summary*', uz: '💸 *Qarzlar hisoboti*', ru: '💸 *Сводка долгов*' },
  debts_empty: { en: 'No debts found.', uz: 'Qarzlar topilmadi.', ru: 'Долги не найдены.' },
  client_balances_title: { en: '👥 *Client Balances*', uz: '👥 *Mijozlar balansi*', ru: '👥 *Балансы клиентов*' },
  aging: { en: 'Aging', uz: 'Muddati', ru: 'Сроки' },
  total_unpaid: { en: 'Total Unpaid Sales', uz: 'To\'lanmagan sotuvlar', ru: 'Неоплаченные продажи' },

  // ─── POS Sale ─────────────────────────────────────────────────────
  pos_title: { en: '🛒 *New Sale*', uz: '🛒 *Yangi sotuv*', ru: '🛒 *Новая продажа*' },
  pos_cart_empty: { en: 'Cart is empty. Add products below.', uz: 'Savat bo\'sh. Mahsulot qo\'shing.', ru: 'Корзина пуста. Добавьте товары.' },
  pos_cart: { en: '🛒 *Cart*', uz: '🛒 *Savat*', ru: '🛒 *Корзина*' },
  pos_add_product: { en: '➕ Add Product', uz: '➕ Mahsulot qo\'shish', ru: '➕ Добавить товар' },
  pos_clear_cart: { en: '🗑 Clear Cart', uz: '🗑 Savatni tozalash', ru: '🗑 Очистить корзину' },
  pos_checkout: { en: '💳 Checkout', uz: '💳 To\'lash', ru: '💳 Оформить' },
  pos_enter_qty: { en: 'Enter quantity for *{product}*:', uz: '*{product}* uchun miqdor kiriting:', ru: 'Введите кол-во для *{product}*:' },
  pos_item_added: { en: '✅ Added to cart.', uz: '✅ Savatga qo\'shildi.', ru: '✅ Добавлено в корзину.' },
  pos_total: { en: 'Total', uz: 'Jami', ru: 'Итого' },
  pos_select_payment: { en: 'Select payment method:', uz: 'To\'lov turini tanlang:', ru: 'Выберите способ оплаты:' },
  pos_enter_paid: { en: 'Enter paid amount:', uz: 'To\'langan summani kiriting:', ru: 'Введите оплаченную сумму:' },
  pos_sale_created: { en: '✅ Sale created! Total: *{total}*', uz: '✅ Sotuv yaratildi! Jami: *{total}*', ru: '✅ Продажа создана! Итого: *{total}*' },
  pos_select_client: { en: 'Select client (or /skip):', uz: 'Mijozni tanlang (yoki /skip):', ru: 'Выберите клиента (или /skip):' },
  cash: { en: '💵 Cash', uz: '💵 Naqd', ru: '💵 Наличные' },
  card: { en: '💳 Card', uz: '💳 Karta', ru: '💳 Карта' },
  transfer: { en: '🏦 Transfer', uz: '🏦 O\'tkazma', ru: '🏦 Перевод' },

  // ─── Recent Sales ─────────────────────────────────────────────────
  recent_sales_title: { en: '🛒 *Recent Sales*', uz: '🛒 *So\'nggi sotuvlar*', ru: '🛒 *Недавние продажи*' },
  recent_sales_empty: { en: 'No sales found.', uz: 'Sotuvlar topilmadi.', ru: 'Продажи не найдены.' },

  // ─── Settings ─────────────────────────────────────────────────────
  settings_title: { en: '⚙️ *Settings*', uz: '⚙️ *Sozlamalar*', ru: '⚙️ *Настройки*' },
  change_language: { en: '🌐 Change Language', uz: '🌐 Tilni o\'zgartirish', ru: '🌐 Сменить язык' },
  logout_btn: { en: '🚪 Logout', uz: '🚪 Chiqish', ru: '🚪 Выход' },

  // ─── Help ─────────────────────────────────────────────────────────
  help_text: {
    en: '📖 *POS Bot Help*\n\nUse the keyboard menu or commands:\n\n/dashboard — Overview\n/pos — New sale\n/products — Manage products\n/inventory — Stock management\n/clients — Manage clients\n/branches — Manage branches\n/categories — Manage categories\n/transactions — Manage transactions\n/debts — View debts\n/sales\\_report — Sales report\n/financial — Financial report\n/lang — Change language\n/logout — Log out',
    uz: '📖 *POS Bot Yordam*\n\nKlavatura menyusidan yoki buyruqlardan foydalaning:\n\n/dashboard — Boshqaruv paneli\n/pos — Yangi sotuv\n/products — Mahsulotlar\n/inventory — Ombor boshqaruvi\n/clients — Mijozlar\n/branches — Filiallar\n/categories — Kategoriyalar\n/transactions — Tranzaksiyalar\n/debts — Qarzlar\n/sales\\_report — Sotuv hisoboti\n/financial — Moliyaviy hisobot\n/lang — Tilni o\'zgartirish\n/logout — Chiqish',
    ru: '📖 *Помощь POS бота*\n\nИспользуйте меню или команды:\n\n/dashboard — Панель управления\n/pos — Новая продажа\n/products — Управление товарами\n/inventory — Складской учёт\n/clients — Клиенты\n/branches — Филиалы\n/categories — Категории\n/transactions — Транзакции\n/debts — Долги\n/sales\\_report — Отчёт продаж\n/financial — Финансовый отчёт\n/lang — Сменить язык\n/logout — Выход',
  },
} as const;

export type TranslationKey = keyof typeof t;

export function i18n(key: TranslationKey, lang: Lang = 'en', params?: Record<string, string | number>): string {
  const entry = t[key];
  if (!entry) return key;
  let text = (entry as any)[lang] ?? (entry as any).en ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export default t;
