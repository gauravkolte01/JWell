from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    order_id_display = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user', 'admin_response')


class ComplaintAdminSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user', 'order', 'message', 'complaint_type')
