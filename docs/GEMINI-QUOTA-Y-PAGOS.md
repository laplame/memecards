# Cuota de Gemini y por qué no aparece en Payments

Cuando ves **"Cuota de Gemini agotada"** (429) pero en la sección **Payments** no aparece nada, es normal. Resumen de cómo funciona y dónde revisar.

## Por qué Payments puede estar vacío

- En el **plan gratuito** no hay cobros: solo hay **límites de uso** (requests por minuto/día, tokens, etc.).
- Al superar el límite, la API responde **429** y **no se genera ninguna factura**: te bloquean por cuota, no por falta de pago.
- Por eso en **Payments / Billing** no verás “exceso de uso” ni cargos cuando solo usas el tier gratuito.

## Dónde revisar uso y cuotas (no Payments)

1. **Google AI Studio – Uso y límites**
   - Entra en: [Google AI Studio](https://aistudio.google.com/)
   - Menú lateral: **Dashboard → Usage and Billing** (o **Usage**).
   - Ahí ves **uso** y **límites por modelo** (RPM, tokens, requests/día).
   - Enlace directo a límites: [AI Studio – Rate limits](https://aistudio.google.com/usage?timeRange=last-28-days&tab=rate-limit).

2. **Google Cloud Console** (si tu API key está asociada a un proyecto de GCP)
   - [APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard)
   - [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) (para ver la API key y el proyecto).
   - [APIs & Services → Enabled APIs](https://console.cloud.google.com/apis/library): confirma que **Generative Language API** está habilitada.
   - Para cuotas por API: [IAM & Admin → Quotas](https://console.cloud.google.com/iam-admin/quotas) y filtra por “Generative Language” o “generativelanguage”.

En **Payments** solo verás movimiento cuando tengas **facturación activa** y hagas uso de un plan de pago; el “límite excedido” del free tier no se refleja ahí.

## Si el error dice "limit: 0"

Si en el 429 aparece algo como **limit: 0** para el modelo `gemini-2.5-flash-preview-image`:

- Puede que ese **modelo** no tenga cuota asignada en tu proyecto o región en el tier gratuito.
- Qué hacer:
  1. Revisar en AI Studio (o en GCP Quotas) las cuotas de **Generative Language API** y del modelo de **imagen**.
  2. Activar facturación (Payments) y usar un plan de pago si necesitas más cuota; con facturación suelen asignarse límites mayores.
  3. Probar de nuevo pasados unos minutos (o al día siguiente si el límite es diario).

## Activar facturación para más cuota

Si quieres más solicitudes y no depender del free tier:

1. [Google AI Studio → API keys](https://aistudio.google.com/api-keys)
2. **Set up Billing** en tu proyecto y vincular una cuenta de facturación (Google Cloud).
3. Con facturación activa tendrás límites más altos y el uso sí puede aparecer en **Billing/Payments** cuando genere coste.

Referencias útiles:

- [Gemini API – Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Gemini API – Billing](https://ai.google.dev/gemini-api/docs/billing)
