# Site index · format 1
Structure and the names of what each page offers. Values that change often — prices, hours, phone,
address — and body copy are deliberately not recorded here; read the page itself for those.

## index.html → /
title: VEGA Mexican Cuisine | Tacos Westchester – Hartsdale, Westchester NY
purpose: The landing page — the whole restaurant on one page, carrying every menu, the events calendar, press, gallery, reviews and FAQ.
sections:
- hero "EAT. DRINK. FIESTA – VEGA Mexican Restaurant" — the tagline and the ordering call to action
- `#about` "About Us" — the restaurant's story
- `#menu` "Explore Our Menus" — every menu on the site, in four tabbed groups named Weekly Specials, Happy Hour, Dinner Menu and Dessert, holding the category blocks below
- `#menu` Weekly Specials — the recurring nightly promotions: Gentlemen's Night Monday, Wine Wednesday, Taco Tuesday, Ladies Night Thursday
- `#menu` Happy Hour — the happy-hour window with its Bites and Drinks lists: Wings, Beef Nacho, Avocado Fritters, Ceviche Tostada, Empanada, Draft Beer, Bottle Beer, House Wine, House Margarita, Sangria
- `#menu` Small Plates — 11 priced items: WINGS OF FIRE, LOADED NACHOS, AVOCADO FRITTERS, CHICKEN FLAUTAS, MEXICAN STREET CORN, STREET SIDE GUACAMOLE, CANCUN CALAMARI, SHRIMP CEVICHE, TOSTONES, EMPANADA, COCO LOCO SHRIMP
- `#menu` Soup — 3 priced items: CHICKEN TORTILLA, BEEF SOUP, BLACK BEAN
- `#menu` Salad — 2 priced items: AVOCADO, TACO SHELL
- `#menu` Classics — 6 priced items, each with a protein price list: TACOS, FAJITA, BURRITO, ENCHILADA, QUESADILLA, CHIMICHANGA
- `#menu` Signature — 5 priced items: CHIPOTLE CHICKEN, CHURRASCO, CARNITAS, SALMON YUCATAN, SHRIMP DIABLA
- `#menu` Kids — 3 priced items: CHICKEN FINGERS, CHEESE QUESADILLA, GROUND BEEF CHEESE TACO
- `#menu` Sides — 6 priced items: GUACAMOLE, GRILLED VEGETABLES, HOMEMADE CHIPS & SALSA, FRIED PLANTAIN, RICE, BEANS
- `#menu` Dessert — 4 items: Churros, Mexican Choco Tres Leche, Fried Ice Crème, Flan
- `#menu` Cordials — 4 pours: Kahlua, Grand Marnier, Baileys, Sambuca
- `#menu` Hot Drinks — 6 items: Coffee, Espresso, Cappuccino, Tea, Double Espresso, Mexican Coffee
- `#press` "Press & Awards" — press mentions and awards, shown as images with no text
- `#gallery` "Gallery" — photographs of the food and the room
- `#reviews` "What Our Guests Say" — guest review quotes
- `#faq` "Frequently Asked Questions" — an accordion covering: reservations, vegetarian or gluten-free, parking, large parties or private events
- `#order-now` "ORDER NOW" — the ordering call to action
- `#events` "Events" — the events block, switchable between a calendar and a list
- `#evt-tab-calendar` — the tab button that shows the calendar view
- `#evt-tab-list` — the tab button that shows the list view
- `#evt-view-calendar` — the calendar view, with its own previous, label, today and next controls
- `#evt-view-list` — the list view and its empty-state message
- `#evt-modal` — the pop-up that opens when an event is clicked, with its image, category, title, date, location, summary, full description and action link
- `#newsletter` "Join Our Newsletter" — the newsletter sign-up
also: Every menu category on this page lives inside the single #menu section and has no id of its own, so a change to one category can only be located by its heading text or its dish names.
also: The events calendar, list and modal are filled by script at page load, so nothing in the markup names any event. An event's own wording cannot be edited on this page.
also: Six dishes are written twice on this site — Avocado Fritters, Cancun Calamari, Shrimp Ceviche, Mexican Street Corn, Churros and Wings of Fire all appear here and again on catering.html, with different descriptions. Renaming one means finding both.

## catering.html → /catering
title: Mexican Catering Westchester & Hartsdale, NY | VEGA Mexican Cuisine
purpose: The catering menu and the catering enquiry form.
sections:
- "Catering by VEGA" — the page hero and the half-tray and full-tray serving sizes
- `#catering-menu` "Appetizers" — the catering menu, in the seven category blocks below
- `#catering-menu` Appetizers — 11 items: California Nachos, Taquitos, Wings of Fire, Cancun Calamari, Shrimp Ceviche, Tableside Guacamole, Avocado Fritters, Avocado Salad, Mexican Street Corn, Shrimp al Ajillo, Charred Cauliflower
- `#catering-menu` Desserts — 4 items: Apple Taco, Chocolate Mousse, Vanilla Flan, Churros
- `#catering-menu` Entrées — 12 items: Tinga Chicken, Lemon Chipotle Chicken, Carnitas, Cochinita Pibil, Churrasco, Carne Asada, Salmon Yucatán, Mixed Seafood Paella, Shrimp Chipotle, Shrimp Diabla, Chile Rellenos, Arroz con Pollo
- `#catering-menu` Classics — 6 formats each offered with a choice of protein: Fajita, Quesadilla, Burrito, Taco, Chimichanga, Enchilada
- `#catering-menu` Sides and Sauces — the accompaniments offered with a tray
- `#catering-menu` In-House Party Packages and Live Counter (Outdoor) — the packaged catering options
- `#catering-form` "Request Catering Information" — the catering enquiry form
- `#full_name` — the form's name input
- `#email` — the form's email input
- `#phone` — the form's phone input
- `#event_date` — the form's event date input
- `#guest_count` — the form's guest count input
- `#message` — the form's message textarea
also: The catering categories have no ids of their own; only the #catering-menu wrapper does, so a change to one category is located by its heading text.

## hiring.html → /hiring
title: Careers at VEGA Mexican Cuisine | Hartsdale & Westchester, NY
purpose: The careers page — the roles being hired for and a short application form.
sections:
- "WE ARE HIRING!" — the page hero
- Positions — the roles open: Manager, Server, Bartender, Buss Person, Cooks, Dishwasher
- the application form — a message field and a submit button
also: This page carries no ids at all, so every change here is located by its heading or its wording. It is also the only page with no shared section markers.

## shared (every page)
The header, navigation, mobile menu and footer are propagated from index.html to every other page by
`shell_propagation`. A change to any of them is made on index.html alone and copied automatically.
