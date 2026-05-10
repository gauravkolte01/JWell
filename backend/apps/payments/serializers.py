from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class CreateCheckoutSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
