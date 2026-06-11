# SafeHome Mobile

Aplicativo mobile em `React Native + Expo + TypeScript` para o ecossistema **SafeHome**.
Ele conversa diretamente com a API que voce ja deixou rodando em `http://localhost:3333/api/v1`.

## O que o app entrega

- Login e cadastro de familiar responsavel
- Setup inicial da residencia monitorada
- Dashboard com status de sensores, botoes, ultima atividade e alertas
- Tela de alertas com reconhecimento e resolucao
- Tela de atividade com logs e relatorios
- Gerenciamento de sensores e botoes de ajuda
- Configuracao de monitoramento, modo dormir e gateways
- Notificacoes locais para alertas criticos
- Identidade visual pronta para apresentacao

## Stack

- `Expo`
- `React Native`
- `TypeScript`
- `React Navigation`
- `TanStack Query`
- `React Hook Form`
- `Zod`
- `AsyncStorage`
- `Expo Notifications`

## Estrutura

```text
src/
  api/
  components/common/
  config/
  contexts/
  hooks/
  navigation/
  screens/
    auth/
    app/
  services/
  types/
  utils/
```

## Como rodar

### Modo apresentacao offline

O modo demo pode ser ativado para abrir o aplicativo sem login e sem API real.

Isso acontece por causa da variavel:

```env
EXPO_PUBLIC_DEMO_MODE=true
```

Nesse modo o app:

- abre sem tela de login
- injeta uma sessao demo automaticamente
- usa dados mockados locais
- permite navegar, editar alertas e gerenciar dispositivos localmente

### Modo integrado com API real

Por padrao, use o backend real configurando o `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP:3333/api/v1
```

1. Garanta que a API backend esteja rodando em `http://localhost:3333`.

2. Instale as dependencias:

```bash
npm install
```

3. Rode o typecheck:

```bash
npm run typecheck
```

4. Suba o Expo:

```bash
npm run start
```

Se preferir abrir por tunel:

```bash
npm run start:tunnel
```

## Conexao com a API

O app tenta resolver a API automaticamente:

- usa `EXPO_PUBLIC_API_BASE_URL` se estiver definido
- tenta aproveitar o host do Metro quando voce abre no Expo Go
- faz fallback para `10.0.2.2` no Android Emulator
- usa `localhost` em simuladores locais

Se precisar fixar manualmente, copie `.env.example` para `.env` e ajuste:

```env
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:3333/api/v1
```

Para celular real, o ideal e usar o IP da maquina que esta rodando a API e o Metro, na mesma rede Wi-Fi.

## Credenciais demo

- E-mail: `demo@safehome.local`
- Senha: `SafeHome@123`

No modo apresentacao offline o app nem pede essas credenciais, porque entra direto.

## Fluxo sugerido para apresentar

1. Entrar com a conta demo.
2. Abrir `Inicio` para mostrar ultima atividade, status dos dispositivos e timeline.
3. Abrir `Alertas` para mostrar o fluxo de reconhecimento e resolucao.
4. Abrir `Atividade` para mostrar logs e depois alternar para `Relatorio`.
5. Abrir `Dispositivos` para mostrar renomeacao, cadastro e desativacao logica.
6. Abrir `Ajustes` para mostrar modo dormir, limites, gateways e rotacao de token.

## Integracao com o backend existente

Este app foi montado para consumir estes grupos de endpoints da API:

- `/auth`
- `/households`
- `/alerts`
- `/households/:id/dashboard`
- `/households/:id/events`
- `/households/:id/reports/activity`
- `/households/:id/sensors`
- `/households/:id/help-buttons`
- `/households/:id/gateways`

## Validacoes feitas

- `npm run typecheck`
- `npx expo-doctor`
- `npx expo config --type public`

## Licenca

O codigo deste projeto esta disponivel sob a licenca MIT. Consulte `LICENSE` e
`THIRD_PARTY_NOTICES.md` para os termos aplicaveis.

## Observacao importante para amanha

Se voce apresentar em um celular real:

- deixe a API Node rodando na maquina
- rode o Expo na mesma maquina
- use a mesma rede Wi-Fi no celular
- se a deteccao automatica nao funcionar, configure o IP em `.env`

Se quiser, no proximo passo eu posso fazer tambem um script de simulacao IoT para gerar eventos automaticamente e deixar a demo se mexendo sozinha durante a apresentacao.
