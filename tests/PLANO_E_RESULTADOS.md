# Plano e resultados de testes - SafeHome Mobile

## Identificacao

| Campo                   | Preenchimento           |
| ----------------------- | ----------------------- |
| Versao avaliada         | 1.0.1                   |
| Responsavel             | Gabriel Rodrigo Cavejon |
| Data da execucao manual | 11/06/2026              |

## Objetivo

Validar que o aplicativo inicia corretamente, permite navegar pelos principais
recursos e se comunica com a API SafeHome quando configurado para o modo real.

## Ambiente

- Aplicativo: Expo SDK 54.
- API: endereco definido em `EXPO_PUBLIC_API_BASE_URL`.
- Modo demo: definido em `EXPO_PUBLIC_DEMO_MODE`.
- Celular e API na mesma rede quando o modo real for utilizado.

## Testes automaticos

Execute:

```bash
npm test
```

| ID    | Verificacao       | Resultado esperado                    | Resultado obtido                                      | Status |
| ----- | ----------------- | ------------------------------------- | ----------------------------------------------------- | ------ |
| TA-01 | TypeScript        | Nenhum erro de tipagem                | `tsc --noEmit` concluido sem erros em 11/06/2026      | OK     |
| TA-02 | Dependencias Expo | Dependencias compativeis com o SDK 54 | Dependencias atualizadas e compativeis em 11/06/2026  | OK     |
| TA-03 | Expo Doctor       | Todas as verificacoes aprovadas       | 18 de 18 verificacoes aprovadas em 11/06/2026         | OK     |
| TA-04 | Bundle Android    | Bundle gerado sem erros               | Bundle Android gerado com 1.405 modulos em 11/06/2026 | OK     |

## Teste manual em uma unica navegacao

Execute o aplicativo e percorra as telas na ordem abaixo. Todo o roteiro pode ser
feito em poucos minutos.

| ID    | Acao                                  | Resultado esperado                                                 | Resultado obtido                                                   | Status |
| ----- | ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------ |
| TM-01 | Abrir o aplicativo e entrar           | App inicia e apresenta login ou entra automaticamente no modo demo | Aplicativo entrou normal                                           | OK     |
| TM-02 | Abrir a tela Inicio                   | Dashboard exibe status, atividade e dispositivos sem travar        | Deshboard iniciado com todos os dados OK                           | OK     |
| TM-03 | Abrir Dispositivos e Ajustes          | Telas carregam e formularios podem ser abertos                     | Todos abrem corretamente                                           | OK     |
| TM-04 | Testar sem acesso a API, no modo real | App informa indisponibilidade sem fechar inesperadamente           | App informa indisponibilidade tanto dentro do app e em notificação | OK     |

## Resumo da execucao

| Campo                        | Preenchimento                                         |
| ---------------------------- | ----------------------------------------------------- |
| Testes automaticos aprovados | 4 de 4                                                |
| Testes manuais aprovados     | 4 de 4                                                |
| Falhas encontradas           | Nenhuma falha nos testes automaticos e testes manuais |
| Resultado final              | TODOS OS TESTES OK                                    |

## Teste de carga

O teste de carga concorrente nao se aplica diretamente ao aplicativo mobile,
pois cada instalacao representa normalmente um unico usuario. A capacidade de
atender varios celulares simultaneamente deve ser medida no repositorio da API.
No mobile, a geracao bem-sucedida do bundle Android foi utilizada como
validacao tecnica de empacotamento.

## Observacoes

TUDO OK
