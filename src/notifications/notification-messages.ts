type Language = 'uz' | 'en' | 'ru';

interface SaleNotification {
  title: string;
  body: (sellerName: string, itemsList: string, totalPrice: string) => string;
}

interface LowStockSingleNotification {
  title: string;
  body: (productName: string, quantity: number) => string;
}

interface LowStockMultiNotification {
  title: string;
  body: (count: number, itemsList: string) => string;
}

interface LowStockItemFormat {
  format: (productName: string, quantity: number) => string;
}

const saleMessages: Record<Language, SaleNotification> = {
  en: {
    title: '🛒 New Sale',
    body: (seller, items, total) => `${seller} sold: ${items} — Total: ${total}`,
  },
  uz: {
    title: '🛒 Yangi sotuv',
    body: (seller, items, total) => `${seller} sotdi: ${items} — Jami: ${total}`,
  },
  ru: {
    title: '🛒 Новая продажа',
    body: (seller, items, total) => `${seller} продал: ${items} — Итого: ${total}`,
  },
};

const lowStockMessages: Record<Language, {
  title: string;
  single: (productName: string, quantity: number) => string;
  multi: (count: number, itemsList: string) => string;
  itemFormat: (productName: string, quantity: number) => string;
}> = {
  en: {
    title: '⚠️ Low Stock Alert',
    single: (name, qty) => `${name} is running low — only ${qty} left`,
    multi: (count, items) => `${count} products are running low:\n${items}`,
    itemFormat: (name, qty) => `${name}: ${qty} left`,
  },
  uz: {
    title: '⚠️ Kam qoldiq',
    single: (name, qty) => `${name} kam qoldi — faqat ${qty} ta qoldi`,
    multi: (count, items) => `${count} ta mahsulot kam qoldi:\n${items}`,
    itemFormat: (name, qty) => `${name}: ${qty} ta qoldi`,
  },
  ru: {
    title: '⚠️ Мало на складе',
    single: (name, qty) => `${name} заканчивается — осталось только ${qty}`,
    multi: (count, items) => `${count} товаров заканчиваются:\n${items}`,
    itemFormat: (name, qty) => `${name}: осталось ${qty}`,
  },
};

export function getSaleMessage(lang: string | null | undefined) {
  return saleMessages[(lang as Language) ?? 'en'] ?? saleMessages.en;
}

export function getLowStockMessage(lang: string | null | undefined) {
  return lowStockMessages[(lang as Language) ?? 'en'] ?? lowStockMessages.en;
}
