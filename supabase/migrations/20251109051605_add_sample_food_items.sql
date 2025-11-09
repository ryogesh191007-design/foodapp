/*
  # Add Sample Food Items

  1. Purpose
    - Populate the food_items table with sample menu items
    - Include various categories: Breakfast, Lunch, Snacks, Beverages
    - Use stock photos from Pexels for images

  2. Categories
    - Breakfast items (Sandwiches, Parathas)
    - Lunch items (Rice dishes, Curries)
    - Snacks (Samosas, Pakoras)
    - Beverages (Tea, Coffee, Juices)

  3. Notes
    - All items are set as available by default
    - Prices are in Indian Rupees
    - Images are from Pexels stock photo library
*/

INSERT INTO food_items (name, description, price, image_url, category, is_available) VALUES
  ('Veg Sandwich', 'Fresh vegetables with cheese and mint chutney', 40, 'https://images.pexels.com/photos/1600727/pexels-photo-1600727.jpeg?auto=compress&cs=tinysrgb&w=800', 'Breakfast', true),
  ('Aloo Paratha', 'Stuffed potato paratha with butter and pickle', 50, 'https://images.pexels.com/photos/5419336/pexels-photo-5419336.jpeg?auto=compress&cs=tinysrgb&w=800', 'Breakfast', true),
  ('Paneer Paratha', 'Cottage cheese stuffed paratha with curd', 60, 'https://images.pexels.com/photos/5419336/pexels-photo-5419336.jpeg?auto=compress&cs=tinysrgb&w=800', 'Breakfast', true),
  
  ('Veg Biryani', 'Aromatic basmati rice with mixed vegetables', 80, 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lunch', true),
  ('Dal Rice', 'Yellow dal with steamed rice and pickle', 60, 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lunch', true),
  ('Chole Bhature', 'Spicy chickpea curry with deep fried bread', 70, 'https://images.pexels.com/photos/6086352/pexels-photo-6086352.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lunch', true),
  ('Rajma Rice', 'Red kidney beans curry with steamed rice', 70, 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lunch', true),
  
  ('Samosa', 'Crispy fried pastry with spiced potato filling', 20, 'https://images.pexels.com/photos/11532159/pexels-photo-11532159.jpeg?auto=compress&cs=tinysrgb&w=800', 'Snacks', true),
  ('Pakora Plate', 'Mixed vegetable fritters with chutney', 30, 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800', 'Snacks', true),
  ('Vada Pav', 'Spiced potato dumpling in a bread bun', 25, 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800', 'Snacks', true),
  ('Bread Pakora', 'Bread slices stuffed with potato and fried', 30, 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800', 'Snacks', true),
  
  ('Masala Chai', 'Traditional Indian spiced tea', 15, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beverages', true),
  ('Coffee', 'Hot brewed coffee with milk', 20, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beverages', true),
  ('Cold Coffee', 'Chilled coffee with ice cream', 40, 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beverages', true),
  ('Mango Juice', 'Fresh mango juice with pulp', 35, 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beverages', true),
  ('Lassi', 'Sweet yogurt drink', 30, 'https://images.pexels.com/photos/6069095/pexels-photo-6069095.jpeg?auto=compress&cs=tinysrgb&w=800', 'Beverages', true)
ON CONFLICT DO NOTHING;