from rest_framework import generics, permissions
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintAdminSerializer


class ComplaintCreateView(generics.CreateAPIView):
    """Customer: Raise a complaint."""
    serializer_class = ComplaintSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ComplaintListView(generics.ListAPIView):
    """Customer: List own complaints."""
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user)


class ComplaintDetailView(generics.RetrieveAPIView):
    """Customer: View complaint detail."""
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user)


# ─── Admin ────────────────────────────────────────────────────

class AdminComplaintListView(generics.ListAPIView):
    """Admin: List all complaints."""
    queryset = Complaint.objects.all()
    serializer_class = ComplaintAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'complaint_type']


class AdminComplaintUpdateView(generics.UpdateAPIView):
    """Admin: Update complaint status and response."""
    queryset = Complaint.objects.all()
    serializer_class = ComplaintAdminSerializer
    permission_classes = [permissions.IsAdminUser]
