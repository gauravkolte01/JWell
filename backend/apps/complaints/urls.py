from django.urls import path
from . import views

urlpatterns = [
    path('', views.ComplaintListView.as_view(), name='complaint-list'),
    path('create/', views.ComplaintCreateView.as_view(), name='complaint-create'),
    path('<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint-detail'),
    # Admin
    path('admin/', views.AdminComplaintListView.as_view(), name='admin-complaint-list'),
    path('admin/<int:pk>/', views.AdminComplaintUpdateView.as_view(), name='admin-complaint-update'),
]
