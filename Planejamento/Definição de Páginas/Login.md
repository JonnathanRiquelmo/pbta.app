# Login — pbta.app

- Rota: `/login`
- Acesso: Público
- Propósito
  - Autenticar via Google e redirecionar para `dashboard`
- Layout
  - Card central com logo, texto e `GoogleLoginButton`
- Componentes
  - `Card`, `Button`, `GoogleLoginButton`, `Loading`
- Dados (Firestore)
  - Verificação de mestre via coleção `masters`
- Ações
  - `SignInWithGoogle`; detectar modo `PLAYER`/`MASTER`
- Offline
  - Desabilitar login; exibir aviso
- Analytics & Performance
  - `page_view_login`, `auth_success`, `auth_failure`; trace `auth_flow`
- Testes
  - Botão chama provider; redirecionamento correto por modo