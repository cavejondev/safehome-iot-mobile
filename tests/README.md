# Testes e validacao do SafeHome Mobile

Esta pasta documenta os testes do aplicativo mobile.

## Execucao rapida

Execute todos os testes tecnicos automaticos com:

```bash
npm test
```

O comando verifica:

- compilacao e tipos do TypeScript;
- compatibilidade das dependencias com a versao do Expo;
- integridade da configuracao do projeto Expo;
- geracao do bundle Android.

O resultado deve terminar sem erros. O bundle criado em
`dist/test-validation` serve apenas como evidencia de que o aplicativo pode ser
empacotado e esta ignorado pelo Git.

## Teste manual rapido

Os comportamentos visuais e a integracao real com a API precisam ser observados
em um celular ou emulador. Eles foram agrupados em um unico roteiro no arquivo
[`PLANO_E_RESULTADOS.md`](./PLANO_E_RESULTADOS.md).

Durante uma unica navegacao pelo aplicativo, marque cada resultado como:

- `OK`: comportamento ocorreu como esperado;
- `FALHOU`: comportamento diferente do esperado;
- `NAO EXECUTADO`: teste ainda nao realizado.

Se necessario, salve prints na pasta `evidencias` usando nomes como
`TM-01-dashboard.png`.
