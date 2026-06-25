# SafeHome IoT Mobile

Aplicativo mobile do **SafeHome IoT**, desenvolvido com Expo, React Native e
TypeScript.

Ele e a interface usada pelo responsavel para acompanhar a residencia, ver
alertas, consultar eventos e gerenciar sensores, botoes e gateway.

## O que este repositorio faz

- Login e cadastro de usuario.
- Criacao e selecao da residencia monitorada.
- Dashboard com status geral.
- Tela de alertas com reconhecimento e resolucao.
- Historico de atividades.
- Relatorios de atividade.
- Cadastro e edicao de sensores.
- Cadastro e edicao de botoes de ajuda.
- Visualizacao e rotacao de token do gateway.
- Modo demo offline para apresentacao sem API real.

## Como o app funciona

1. O app abre e verifica se existe uma sessao salva no AsyncStorage.
2. Se nao existir sessao, mostra login/cadastro.
3. Depois do login, busca as residencias do usuario na API.
4. O usuario escolhe ou cria uma residencia.
5. O app consulta dashboard, eventos, alertas e dispositivos.
6. Algumas telas atualizam os dados automaticamente usando TanStack Query.
7. Em modo demo, o app usa dados mockados locais e nao precisa da API.

## Requisitos

### Obrigatorios

- Node.js 20 ou superior.
- npm.
- Expo CLI via `npx expo`.
- Celular com Expo Go ou emulador Android/iOS.

### Para Android no computador

- Android Studio.
- Android SDK instalado.
- Um emulador configurado.

### Para iOS

- macOS.
- Xcode.
- iOS Simulator.

No Windows e no Linux, o caminho mais simples e usar Expo Go em um celular real
ou Android Emulator.

## Estrutura de pastas

```text
safehome-iot-mobile/
  assets/               icones e imagens do Expo
  src/
    api/                chamadas HTTP para a API
    components/common/  componentes reutilizaveis
    config/             configuracoes do app
    contexts/           AuthContext e HouseholdContext
    hooks/              hooks de contexto
    navigation/         navegacao do app
    screens/
      app/              telas internas autenticadas
      auth/             login e cadastro
    services/           storage, notificacoes e mock
    types/              tipos da API
    utils/              formatacao, rede e insights
  app.json              configuracao Expo
  package.json          scripts e dependencias
```

## Configuracao inicial no Windows

Abra o PowerShell dentro da pasta `safehome-iot-mobile` e rode:

```powershell
npm install
Copy-Item .env.example .env
npm run typecheck
npm run start
```

Depois:

1. Instale o app **Expo Go** no celular.
2. Deixe celular e computador na mesma rede Wi-Fi.
3. Escaneie o QR Code mostrado pelo Expo.

## Configuracao inicial no Linux

Abra o terminal dentro da pasta `safehome-iot-mobile` e rode:

```bash
npm install
cp .env.example .env
npm run typecheck
npm run start
```

Depois:

1. Instale o app **Expo Go** no celular.
2. Deixe celular e computador na mesma rede Wi-Fi.
3. Escaneie o QR Code mostrado pelo Expo.

## Variaveis de ambiente

Crie `.env` copiando `.env.example`.

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:3333/api/v1
```

Campos:

- `EXPO_PUBLIC_DEMO_MODE`: quando `true`, o app roda com dados locais.
- `EXPO_PUBLIC_API_BASE_URL`: endereco da API que o app deve consumir.

## Como descobrir o IP local da API

Quando usar celular real, `localhost` nao funciona, porque `localhost` no
celular aponta para o proprio celular, nao para o computador.

### Windows

No PowerShell:

```powershell
ipconfig
```

Procure o `IPv4 Address` da rede Wi-Fi. Exemplo:

```text
192.168.0.25
```

No `.env` do mobile:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:3333/api/v1
```

### Linux

No terminal:

```bash
ip addr
```

Ou:

```bash
hostname -I
```

Use o IP da rede local:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:3333/api/v1
```

## Rodando integrado com a API

1. Entre no repositorio `safehome-iot-api`.
2. Suba o banco.
3. Rode migrations e seed.
4. Inicie a API com `npm run dev`.
5. Confirme que a API responde em:

```text
http://localhost:3333/api/v1/health
```

6. Entre neste repositorio mobile.
7. Configure `.env` apontando para a API.
8. Inicie o Expo:

```bash
npm run start
```

## Rodando em modo demo offline

Use esse modo quando quiser apresentar o app sem depender da API.

No `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=true
```

Depois rode:

```bash
npm run start
```

Nesse modo:

- nao precisa login real;
- nao precisa API;
- os dados ficam mockados no proprio app;
- e possivel navegar pelas telas principais.

## Comandos disponiveis

| Comando | O que faz |
| --- | --- |
| `npm run start` | inicia o Expo |
| `npm run android` | inicia no Android |
| `npm run ios` | inicia no iOS |
| `npm run web` | inicia no navegador |
| `npm run start:tunnel` | inicia usando tunnel |
| `npm run typecheck` | valida TypeScript |
| `npm run check` | roda typecheck |
| `npm test` | roda validacoes automatizadas |

## Quando usar tunnel

Se o celular nao consegue abrir o app pela rede local, use:

```bash
npm run start:tunnel
```

Esse modo costuma ser mais lento, mas ajuda quando a rede bloqueia conexoes
locais.

## Credenciais demo

Se a API foi populada com `npm run db:seed`, use:

- E-mail: `demo@safehome.local`
- Senha: `SafeHome@123`

## Fluxo recomendado para testar

1. Rode a API.
2. Rode o mobile.
3. Faca login com a conta demo.
4. Abra a tela inicial.
5. Confira dashboard e alertas.
6. Abra dispositivos.
7. Confira sensores, botoes e gateways.
8. Gere eventos pelo hardware ou por uma ferramenta HTTP.
9. Volte ao app e veja se os dados aparecem.

## Problemas comuns

### O app nao conecta na API no celular

Verifique:

- celular e computador estao na mesma rede Wi-Fi;
- a API esta rodando;
- o IP em `EXPO_PUBLIC_API_BASE_URL` e o IP do computador;
- a URL termina com `/api/v1`;
- o firewall do computador nao esta bloqueando a porta `3333`.

### `localhost` nao funciona no celular

Use o IP local do computador:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:3333/api/v1
```

### Android Emulator nao acessa `localhost`

Use:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3333/api/v1
```

### Mudou o `.env`, mas o app continua usando valor antigo

Pare o Expo e inicie limpando cache:

```bash
npx expo start -c
```

### Erro de dependencias Expo

Rode:

```bash
npx expo install --check
npx expo-doctor
```

## Validacao antes de entregar

Rode:

```bash
npm test
```

Esse script executa typecheck, verificacao de dependencias Expo, Expo Doctor e
exportacao Android de validacao.

## Licenca

Projeto sob licenca MIT. Veja `LICENSE` e `THIRD_PARTY_NOTICES.md`.