-- Real menu content confirmed by Selen/Turan (Sept 2026).
-- English names/descriptions are DRAFT translations - review in admin panel and edit freely.
-- Run this AFTER schema.sql, in the Supabase SQL editor.

-- ============ CATEGORIES ============
insert into public.categories (name_tr, name_en, sort_order) values
  ('Atıştırmalıklar', 'Snacks', 1),
  ('Burgerler', 'Burgers', 2),
  ('Fırından Pideler', 'Pide (Oven-Baked)', 3),
  ('Kırmızı Etler', 'Red Meat', 4),
  ('Beyaz Etler', 'Chicken', 5),
  ('Salatalar', 'Salads', 6),
  ('Tatlılar', 'Desserts', 7),
  ('Makarnalar', 'Pasta', 8),
  ('Pizzalar', 'Pizza', 9),
  ('Soğuk İçecekler', 'Cold Drinks', 10),
  ('Sıcak İçecekler', 'Coffee & Hot Drinks', 11),
  ('Alkollü İçecekler', 'Beer & Wine', 12);

-- ============ ATIŞTIRMALIKLAR / SNACKS ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Patates Cips', 'Potato Chips', 175, 1),
  ('Sigara Böreği', 'Cheese Rolls (Sigara Böreği)', 175, 2),
  ('Kaşarlı Tost', 'Toasted Cheese Sandwich', 150, 3),
  ('Karışık Tost', 'Mixed Toasted Sandwich', 175, 4),
  ('Simit Tost', 'Simit Toast', 125, 5),
  ('Beyaz Peynirli Domatesli Tost', 'White Cheese & Tomato Toast', 150, 6),
  ('Combo Tabağı', 'Combo Plate', 350, 7),
  ('Peynir', 'Cheese Plate', 125, 8),
  ('Karpuz Tabağı', 'Watermelon Plate', 125, 9),
  ('Halka Soğan', 'Onion Rings', 175, 10),
  ('Karışık Çerez Tabağı', 'Mixed Nuts Plate', 325, 11)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Atıştırmalıklar';

-- ============ BURGERLER / BURGERS (fries included) ============
insert into public.products (category_id, name_tr, name_en, price, includes_fries, sort_order)
select id, v.name_tr, v.name_en, v.price, true, v.sort_order
from public.categories, (values
  ('Hamburger', 'Hamburger', 300, 1),
  ('Cheeseburger', 'Cheeseburger', 325, 2),
  ('Bonfile Burger', 'Beef Tenderloin Burger', 400, 3),
  ('Köfte Burger', 'Meatball Burger', 300, 4),
  ('Tavuk Burger', 'Chicken Burger', 225, 5)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Burgerler';

-- ============ FIRINDAN PİDELER / PIDE ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Lahmacun', 'Lahmacun (Turkish Flatbread)', 350, 1),
  ('Kaşarlı Pide', 'Cheese Pide', 300, 2),
  ('Kıymalı Kaşarlı Pide', 'Minced Meat & Cheese Pide', 350, 3)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Fırından Pideler';

-- ============ KIRMIZI ETLER / RED MEAT (fries included) ============
insert into public.products (category_id, name_tr, name_en, price, includes_fries, sort_order)
select id, v.name_tr, v.name_en, v.price, true, v.sort_order
from public.categories, (values
  ('Bonfile Izgara', 'Grilled Beef Tenderloin', 650, 1),
  ('Cheddar Soslu Bonfile', 'Beef Tenderloin in Cheddar Sauce', 650, 2),
  ('Demiglace Soslu Bonfile', 'Beef Tenderloin in Demiglace Sauce', 650, 3),
  ('Mexico Soslu Bonfile', 'Beef Tenderloin in Mexican Sauce', 650, 4),
  ('Et Çökertme', 'Çökertme Beef', 650, 5),
  ('Et Şinitzel', 'Beef Schnitzel', 650, 6),
  ('Ispanaklı Bonfile', 'Beef Tenderloin with Spinach', 650, 7),
  ('Etli Wrap', 'Beef Wrap', 500, 8),
  ('Izgara Köfte', 'Grilled Meatballs', 400, 9),
  ('Cheddarlı Izgara Köfte', 'Grilled Meatballs with Cheddar', 450, 10),
  ('Manisa Kebap', 'Manisa Kebab', 600, 11)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Kırmızı Etler';

-- ============ BEYAZ ETLER / CHICKEN (fries included) ============
-- Note: Çıtır Tavuk lives here only (removed duplicate that was also in Atıştırmalıklar)
insert into public.products (category_id, name_tr, name_en, price, includes_fries, sort_order)
select id, v.name_tr, v.name_en, v.price, true, v.sort_order
from public.categories, (values
  ('Piliç Izgara', 'Grilled Chicken', 300, 1),
  ('Tavuk Şinitzel', 'Chicken Schnitzel', 300, 2),
  ('Ispanaklı Tavuk', 'Chicken with Spinach', 300, 3),
  ('Köri Soslu Tavuk', 'Chicken in Curry Sauce', 300, 4),
  ('Çıtır Tavuk', 'Crispy Chicken', 300, 5),
  ('Mexico Soslu Tavuk', 'Chicken in Mexican Sauce', 300, 6),
  ('Avcı Usulü Tavuk', 'Hunter-Style Chicken', 300, 7),
  ('Tavuk Wrap', 'Chicken Wrap', 250, 8),
  ('Sebzeli Wrap', 'Vegetable Wrap', 300, 9)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Beyaz Etler';

-- ============ SALATALAR / SALADS ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Bonfile Salata', 'Beef Tenderloin Salad', 550, 1),
  ('Izgara Tavuk Salata', 'Grilled Chicken Salad', 300, 2),
  ('Hellim Salata', 'Halloumi Salad', 300, 3),
  ('Soya Soslu Tavuk Salata', 'Chicken Salad with Soy Sauce', 300, 4),
  ('Greek Salata', 'Greek Salad', 300, 5),
  ('Ton Balıklı Salata', 'Tuna Salad', 300, 6)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Salatalar';

-- ============ TATLILAR / DESSERTS (includes Dondurma) ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Magnum', 'Magnum Ice Cream', 140, 1),
  ('Brownie', 'Brownie', 150, 2)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Tatlılar';

-- ============ MAKARNALAR / PASTA ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Tavuklu Mantarlı Penne', 'Penne with Chicken & Mushroom', 300, 1),
  ('Penne Arrabbiata', 'Penne Arrabbiata', 300, 2),
  ('Etli Penne', 'Penne with Beef', 450, 3),
  ('Bonfile Tagliatelle', 'Tagliatelle with Beef Tenderloin', 450, 4),
  ('Yoğurtlu Mantı', 'Turkish Dumplings with Yogurt', 275, 5)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Makarnalar';

-- ============ PİZZALAR / PIZZA ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Margherita', 'Margherita', 275, 1),
  ('Karışık Pizza', 'Mixed Pizza', 300, 2),
  ('Vejetaryen Pizza', 'Vegetarian Pizza', 300, 3),
  ('Etli Pizza', 'Beef Pizza', 550, 4),
  ('Tavuklu Pizza', 'Chicken Pizza', 300, 5)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Pizzalar';

-- ============ SOĞUK İÇECEKLER / COLD DRINKS ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Su', 'Water', 25, 1),
  ('Soda', 'Soda', 35, 2),
  ('Meyveli Soda', 'Fruit Soda', 60, 3),
  ('Red Bull', 'Red Bull', 120, 4),
  ('Coca-Cola', 'Coca-Cola', 80, 5),
  ('Coca-Cola Zero', 'Coca-Cola Zero', 80, 6),
  ('Fanta', 'Fanta', 80, 7),
  ('Gazoz', 'Turkish Lemonade (Gazoz)', 60, 8),
  ('Lipton Ice Tea Limon', 'Lipton Ice Tea Lemon', 80, 9),
  ('Lipton Ice Tea Şeftali', 'Lipton Ice Tea Peach', 80, 10),
  ('Churchill', 'Churchill', 80, 11),
  ('Ayran', 'Ayran', 60, 12),
  ('Soğuk Kahve', 'Iced Coffee', 120, 13)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Soğuk İçecekler';

-- ============ SICAK İÇECEKLER / HOT DRINKS ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Çay', 'Turkish Tea', 25, 1),
  ('Türk Kahvesi', 'Turkish Coffee', 80, 2),
  ('Filtre Kahve', 'Filter Coffee', 120, 3),
  ('Nescafé', 'Nescafé', 50, 4),
  ('Latte', 'Latte', 130, 5)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Sıcak İçecekler';

-- ============ ALKOLLÜ İÇECEKLER / BEER & WINE ============
insert into public.products (category_id, name_tr, name_en, price, sort_order)
select id, v.name_tr, v.name_en, v.price, v.sort_order
from public.categories, (values
  ('Efes', 'Efes Beer', 170, 1),
  ('Efes Malt', 'Efes Malt', 170, 2),
  ('Miller', 'Miller', 190, 3),
  ('Corona', 'Corona', 220, 4),
  ('Bomonti', 'Bomonti', 190, 5),
  ('Carlsberg', 'Carlsberg', 190, 6),
  ('Sarafin Chardonnay 75 cl', 'Sarafin Chardonnay 75 cl', 2500, 7),
  ('İsabey Beyaz 75 cl', 'İsabey White Wine 75 cl', 800, 8),
  ('İsabey Kırmızı 75 cl', 'İsabey Red Wine 75 cl', 800, 9),
  ('İsabey Rosé', 'İsabey Rosé', 800, 10),
  ('Sarafin Fumé Blanc', 'Sarafin Fumé Blanc', 2600, 11)
) as v(name_tr, name_en, price, sort_order)
where categories.name_tr = 'Alkollü İçecekler';
