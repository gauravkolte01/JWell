"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product
from apps.suppliers.models import Supplier
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample jewellery data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@jwell.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'phone': '+91-9876543210',
                'address': 'Mumbai, India',
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('  ✓ Admin user created (admin / admin123)'))

        # Create supplier users
        suppliers_data = [
            {'username': 'supplier1', 'name': 'Royal Gold Suppliers', 'contact': '+91-9876500001', 'address': 'Jaipur, Rajasthan'},
            {'username': 'supplier2', 'name': 'Diamond Palace Wholesale', 'contact': '+91-9876500002', 'address': 'Surat, Gujarat'},
            {'username': 'supplier3', 'name': 'Silver Craft Industries', 'contact': '+91-9876500003', 'address': 'Kolkata, West Bengal'},
        ]

        for s in suppliers_data:
            user, created = User.objects.get_or_create(
                username=s['username'],
                defaults={
                    'email': f"{s['username']}@jwell.com",
                    'first_name': s['name'].split()[0],
                    'last_name': s['name'].split()[-1],
                    'role': 'supplier',
                    'phone': s['contact'],
                    'address': s['address'],
                }
            )
            if created:
                user.set_password('supplier123')
                user.save()

            Supplier.objects.get_or_create(
                user=user,
                defaults={
                    'name': s['name'],
                    'contact': s['contact'],
                    'email': f"{s['username']}@jwell.com",
                    'address': s['address'],
                }
            )

        self.stdout.write(self.style.SUCCESS('  ✓ Suppliers created'))

        # Create customer
        customer, created = User.objects.get_or_create(
            username='customer1',
            defaults={
                'email': 'customer@jwell.com',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': 'customer',
                'phone': '+91-9876543211',
                'address': '123 MG Road, Delhi, India',
            }
        )
        if created:
            customer.set_password('customer123')
            customer.save()
            self.stdout.write(self.style.SUCCESS('  ✓ Customer user created (customer1 / customer123)'))

        # Create categories
        categories_data = [
            {'name': 'Necklaces', 'description': 'Elegant necklaces crafted with precious metals and gemstones'},
            {'name': 'Rings', 'description': 'Stunning rings for engagements, weddings, and everyday wear'},
            {'name': 'Earrings', 'description': 'Beautiful earrings from studs to chandeliers'},
            {'name': 'Bracelets', 'description': 'Exquisite bracelets and bangles in gold, silver, and platinum'},
            {'name': 'Pendants', 'description': 'Charming pendants with intricate designs'},
            {'name': 'Anklets', 'description': 'Traditional and modern anklets'},
        ]

        categories = {}
        for c in categories_data:
            cat, _ = Category.objects.get_or_create(name=c['name'], defaults={'description': c['description']})
            categories[c['name']] = cat

        self.stdout.write(self.style.SUCCESS('  ✓ Categories created'))

        # Create products
        supplier1 = Supplier.objects.get(name='Royal Gold Suppliers')
        supplier2 = Supplier.objects.get(name='Diamond Palace Wholesale')
        supplier3 = Supplier.objects.get(name='Silver Craft Industries')

        products_data = [
            # Necklaces
            {'name': 'Royal Gold Kundan Necklace', 'category': 'Necklaces', 'supplier': supplier1, 'price': Decimal('45999.00'), 'stock': 15, 'discount': 10, 'material': '22K Gold', 'weight': '25g', 'featured': True, 'description': 'A stunning 22K gold Kundan necklace featuring intricate craftsmanship with hand-set precious stones. Perfect for bridal wear and special occasions.'},
            {'name': 'Diamond Solitaire Pendant Necklace', 'category': 'Necklaces', 'supplier': supplier2, 'price': Decimal('89999.00'), 'stock': 8, 'discount': 5, 'material': '18K White Gold', 'weight': '12g', 'featured': True, 'description': 'Elegant 18K white gold necklace with a brilliant-cut 1-carat diamond solitaire pendant. A timeless piece of luxury.'},
            {'name': 'Pearl String Necklace', 'category': 'Necklaces', 'supplier': supplier3, 'price': Decimal('12999.00'), 'stock': 25, 'discount': 0, 'material': 'Sterling Silver', 'weight': '18g', 'featured': False, 'description': 'Classic freshwater pearl string necklace with sterling silver clasp. Elegant simplicity for everyday grace.'},
            {'name': 'Temple Gold Choker', 'category': 'Necklaces', 'supplier': supplier1, 'price': Decimal('67500.00'), 'stock': 10, 'discount': 15, 'material': '22K Gold', 'weight': '35g', 'featured': True, 'description': 'Traditional South Indian temple jewellery choker necklace with Lakshmi pendant and intricate gold work.'},
            {'name': 'Rose Gold Chain Necklace', 'category': 'Necklaces', 'supplier': supplier1, 'price': Decimal('8999.00'), 'stock': 30, 'discount': 0, 'material': '14K Rose Gold', 'weight': '8g', 'featured': False, 'description': 'Delicate 14K rose gold chain necklace with minimalist design. Perfect for layering or standalone elegance.'},

            # Rings
            {'name': 'Diamond Engagement Ring', 'category': 'Rings', 'supplier': supplier2, 'price': Decimal('125000.00'), 'stock': 5, 'discount': 0, 'material': 'Platinum', 'weight': '6g', 'featured': True, 'description': 'Breathtaking platinum engagement ring featuring a 2-carat round brilliant diamond with halo setting. GIA certified.'},
            {'name': 'Gold Antique Cocktail Ring', 'category': 'Rings', 'supplier': supplier1, 'price': Decimal('18500.00'), 'stock': 20, 'discount': 10, 'material': '22K Gold', 'weight': '8g', 'featured': False, 'description': 'Beautifully crafted antique-style cocktail ring in 22K gold with ruby and emerald accent stones.'},
            {'name': 'Silver Band Ring Set', 'category': 'Rings', 'supplier': supplier3, 'price': Decimal('3499.00'), 'stock': 50, 'discount': 20, 'material': 'Sterling Silver', 'weight': '10g', 'featured': False, 'description': 'Set of 3 stackable sterling silver band rings with different textures. Modern minimalist design.'},
            {'name': 'Sapphire Eternity Band', 'category': 'Rings', 'supplier': supplier2, 'price': Decimal('42000.00'), 'stock': 12, 'discount': 5, 'material': '18K Gold', 'weight': '5g', 'featured': True, 'description': 'Stunning eternity band in 18K gold with channel-set blue sapphires. A symbol of eternal love.'},
            {'name': 'Polki Diamond Ring', 'category': 'Rings', 'supplier': supplier1, 'price': Decimal('35999.00'), 'stock': 8, 'discount': 0, 'material': '22K Gold', 'weight': '7g', 'featured': False, 'description': 'Exquisite polki diamond ring set in 22K gold with traditional Indian craftsmanship and meenakari enamel work.'},

            # Earrings
            {'name': 'Diamond Stud Earrings', 'category': 'Earrings', 'supplier': supplier2, 'price': Decimal('55000.00'), 'stock': 15, 'discount': 10, 'material': '18K White Gold', 'weight': '4g', 'featured': True, 'description': 'Classic diamond stud earrings in 18K white gold. Each earring features a 0.5-carat brilliant-cut diamond.'},
            {'name': 'Gold Jhumka Earrings', 'category': 'Earrings', 'supplier': supplier1, 'price': Decimal('22999.00'), 'stock': 20, 'discount': 0, 'material': '22K Gold', 'weight': '15g', 'featured': True, 'description': 'Traditional Indian Jhumka earrings in 22K gold with pearl drops and intricate filigree work. Bridal collection.'},
            {'name': 'Silver Hoop Earrings', 'category': 'Earrings', 'supplier': supplier3, 'price': Decimal('2999.00'), 'stock': 40, 'discount': 15, 'material': 'Sterling Silver', 'weight': '6g', 'featured': False, 'description': 'Elegant sterling silver hoop earrings with a polished finish. Versatile style for any occasion.'},
            {'name': 'Emerald Drop Earrings', 'category': 'Earrings', 'supplier': supplier2, 'price': Decimal('38500.00'), 'stock': 10, 'discount': 5, 'material': '18K Gold', 'weight': '8g', 'featured': False, 'description': 'Luxurious drop earrings featuring natural emeralds surrounded by diamond halos in 18K gold setting.'},
            {'name': 'Pearl Cluster Earrings', 'category': 'Earrings', 'supplier': supplier3, 'price': Decimal('6999.00'), 'stock': 25, 'discount': 0, 'material': 'Sterling Silver', 'weight': '5g', 'featured': False, 'description': 'Graceful pearl cluster earrings set in sterling silver. A beautiful blend of classic and contemporary.'},

            # Bracelets
            {'name': 'Diamond Tennis Bracelet', 'category': 'Bracelets', 'supplier': supplier2, 'price': Decimal('95000.00'), 'stock': 6, 'discount': 0, 'material': '18K White Gold', 'weight': '15g', 'featured': True, 'description': 'Spectacular diamond tennis bracelet in 18K white gold with 5 carats of round brilliant diamonds. Red carpet worthy.'},
            {'name': 'Gold Kada Bangle', 'category': 'Bracelets', 'supplier': supplier1, 'price': Decimal('32000.00'), 'stock': 18, 'discount': 10, 'material': '22K Gold', 'weight': '20g', 'featured': False, 'description': 'Traditional 22K gold Kada bangle with intricate carved patterns. A timeless piece of Indian jewellery.'},
            {'name': 'Silver Charm Bracelet', 'category': 'Bracelets', 'supplier': supplier3, 'price': Decimal('4999.00'), 'stock': 35, 'discount': 25, 'material': 'Sterling Silver', 'weight': '12g', 'featured': False, 'description': 'Sterling silver charm bracelet with 5 removable charms. Customize your story with additional charms.'},
            {'name': 'Ruby Gold Bangle Set', 'category': 'Bracelets', 'supplier': supplier1, 'price': Decimal('78500.00'), 'stock': 4, 'discount': 5, 'material': '22K Gold', 'weight': '40g', 'featured': True, 'description': 'Set of 2 exquisite 22K gold bangles studded with natural rubies and diamonds. Bridal luxury collection.'},
            {'name': 'Rose Gold Cuff Bracelet', 'category': 'Bracelets', 'supplier': supplier1, 'price': Decimal('15999.00'), 'stock': 22, 'discount': 0, 'material': '14K Rose Gold', 'weight': '18g', 'featured': False, 'description': 'Modern open cuff bracelet in 14K rose gold with brushed finish. Adjustable fit for comfortable wear.'},

            # Pendants
            {'name': 'Ganesh Gold Pendant', 'category': 'Pendants', 'supplier': supplier1, 'price': Decimal('15999.00'), 'stock': 30, 'discount': 0, 'material': '22K Gold', 'weight': '5g', 'featured': False, 'description': 'Beautifully crafted Lord Ganesh pendant in 22K gold. A symbol of wisdom and prosperity.'},
            {'name': 'Heart Diamond Pendant', 'category': 'Pendants', 'supplier': supplier2, 'price': Decimal('28999.00'), 'stock': 12, 'discount': 10, 'material': '18K White Gold', 'weight': '4g', 'featured': True, 'description': 'Romantic heart-shaped pendant with diamond pavé in 18K white gold. The perfect gift of love.'},
            {'name': 'Evil Eye Silver Pendant', 'category': 'Pendants', 'supplier': supplier3, 'price': Decimal('1999.00'), 'stock': 45, 'discount': 0, 'material': 'Sterling Silver', 'weight': '3g', 'featured': False, 'description': 'Trendy evil eye pendant in sterling silver with blue enamel and cubic zirconia. Protection meets style.'},
            {'name': 'Om Gold Pendant', 'category': 'Pendants', 'supplier': supplier1, 'price': Decimal('12500.00'), 'stock': 20, 'discount': 5, 'material': '22K Gold', 'weight': '4g', 'featured': False, 'description': 'Sacred Om pendant in 22K gold with diamond accent. A spiritual masterpiece of fine craftsmanship.'},
            {'name': 'Tanzanite Teardrop Pendant', 'category': 'Pendants', 'supplier': supplier2, 'price': Decimal('52000.00'), 'stock': 7, 'discount': 0, 'material': '18K Gold', 'weight': '6g', 'featured': True, 'description': 'Rare tanzanite teardrop pendant in 18K gold with diamond surround. A one-of-a-kind treasure.'},

            # Anklets
            {'name': 'Gold Payal Anklet', 'category': 'Anklets', 'supplier': supplier1, 'price': Decimal('18999.00'), 'stock': 15, 'discount': 10, 'material': '22K Gold', 'weight': '12g', 'featured': False, 'description': 'Traditional Indian payal anklet in 22K gold with tiny bells. Musical elegance for your feet.'},
            {'name': 'Silver Anklet with Charms', 'category': 'Anklets', 'supplier': supplier3, 'price': Decimal('2499.00'), 'stock': 40, 'discount': 0, 'material': 'Sterling Silver', 'weight': '8g', 'featured': False, 'description': 'Delicate sterling silver anklet with dangling heart and star charms. Beach-ready bohemian style.'},
            {'name': 'Diamond Studded Anklet', 'category': 'Anklets', 'supplier': supplier2, 'price': Decimal('35000.00'), 'stock': 5, 'discount': 5, 'material': '18K Gold', 'weight': '10g', 'featured': True, 'description': 'Luxurious 18K gold anklet with bezel-set diamonds throughout. Statement luxury for your ankles.'},
        ]

        for p in products_data:
            Product.objects.get_or_create(
                name=p['name'],
                defaults={
                    'description': p['description'],
                    'category': categories[p['category']],
                    'supplier': p['supplier'],
                    'price': p['price'],
                    'stock_quantity': p['stock'],
                    'discount': Decimal(str(p['discount'])),
                    'material': p['material'],
                    'weight': p['weight'],
                    'is_featured': p['featured'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(products_data)} products created'))
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write(self.style.WARNING('\nDefault credentials:'))
        self.stdout.write('  Admin:    admin / admin123')
        self.stdout.write('  Supplier: supplier1 / supplier123')
        self.stdout.write('  Customer: customer1 / customer123')
