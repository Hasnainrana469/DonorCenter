from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

def api_root(request):
    return JsonResponse({
        'message': 'Blood Donor Connect API',
        'version': '1.0.0',
        'docs': '/api/docs/',
        'frontend': 'http://localhost:3000',
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/auth/', include('accounts.urls')),
    path('api/donors/', include('donors.urls')),
    path('api/requests/', include('requests_app.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/blood-stock/', include('blood_stock.urls')),
    path('api/chat/', include('chat.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
