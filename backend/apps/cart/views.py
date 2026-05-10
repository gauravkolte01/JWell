from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from apps.products.models import Product
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer


class CartView(APIView):
    """View the current user's cart."""
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    """Add a product to cart."""
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if product.stock_quantity < quantity:
            return Response({'error': 'Insufficient stock.'}, status=400)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock_quantity:
                return Response({'error': 'Insufficient stock.'}, status=400)
            cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class UpdateCartItemView(APIView):
    """Update cart item quantity."""
    def put(self, request, pk):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cart_item = CartItem.objects.get(pk=pk, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=404)

        quantity = serializer.validated_data['quantity']
        if quantity > cart_item.product.stock_quantity:
            return Response({'error': 'Insufficient stock.'}, status=400)

        cart_item.quantity = quantity
        cart_item.save()

        cart = cart_item.cart
        return Response(CartSerializer(cart).data)


class RemoveCartItemView(APIView):
    """Remove an item from cart."""
    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.get(pk=pk, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=404)

        cart = cart_item.cart
        cart_item.delete()
        return Response(CartSerializer(cart).data)


class ClearCartView(APIView):
    """Clear all items from cart."""
    def delete(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response(CartSerializer(cart).data)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=404)
