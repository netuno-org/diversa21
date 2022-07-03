# Diversa21

A rede social dedicada para pessoas com trissomia.

Uma solução baseada no boilerplate [ReAuthKit](https://github.com/netuno-org/reauthkit), autenticação, edição de perfil e área reservada utilizando [Netuno](https://www.netuno.org/), [JWT](https://jwt.io/), [ReactJS](https://reactjs.org/), [Redux](https://redux.js.org/) e [Ant Design](https://ant.design/).

## Instalação

#### Netuno

[Siga os passos aqui](https://doc.netuno.org/docs/pt-PT/installation/)

#### Diversa21 App

Clone este projeto para `(Netuno Root directory)/apps/diversa21/`.

Depois instale as dependências NPM no diretório `diversa21/website/` excutando:

- `npm install --force`

## Configuração

> Todo o processo a seguir descrito é destinado a ambientes de desenvolvimento Linux com algumas notas também destinadas a ambientes Microsoft Windows.

1. Copie a configuração de amostra da aplicação executando (no diretório da raiz da aplicação):

    * `cp config/sample.json config/_development.json` (para um ambiente de desenvolvimento local/de testes)

    * `cp config/sample.json config/_production.json` (para um ambiente de produção)

    e ajuste o ficheiro `_development.json` e/ou o `_production_.json` de acordo com o seu ambiente de desenvolvimento.

2. Vai ter de configurar obrigatoriamente uma ligação SMTP para a funcionalidade de recuperação de palavra-passe funcionar corretamente, [saiba como fazê-lo aqui.](https://doc.netuno.org/docs/pt-PT/academy/server/services/sending-emails/)

3. Vai ter de configurar, também, obrigatoriamente uma ligação de base de dados do tipo PostgreSQL para esta aplicação funcionar corretamente, [saiba como fazê-lo aqui.](https://doc.netuno.org/docs/pt-PT/academy/server/database/psql/)

4. Onde se encontra `JWTRandomSecureSecret` coloque um código secreto o mais aleatório visto ser isto que assegura a segurança das credenciais dos utiilzadores, como por exemplo: `#J&Az+7(8d+k/9q]` . [Geração de códigos seguros recomendado.](https://passwordsgenerator.net/)

5. Também vai ter de configurar a amostra de configuração do website localizada no diretório `website/src/config/`:

    1. Altere a configuração presente em `_development_config.json` e `_production_config.json` para ambientes de desenvolvimento/de testes e de produção respetivamente.

    2. Dentro do mesmo diretório execute `cp _development_config.json config.json` a fim de criar o ficheiro de configuração necessário baseado na configuração de desenvolvimento.

    > Para criar uma versão de produção otimizada basta executar `bash build.sh` no diretório `(diretório raíz da aplicação)/website/` que irá momentaneamente substituir o ficheiro `config.json` com a configuração baseada no ficheiro de produção e que ao terminar reverterá para a configuração presente no ficheiro de configuração de ambiente de desenvolvimento/de testes.

    > Também se encontra o ficheiro `build.bat` presente em `(diretório raíz da aplicação)/website/` destinado a ambientes de desenvolvimento em Microsoft Windows.

## Execução

No diretório da raiz do Netuno execute

`./netuno server app=diversa21`

que fará com que o servidor de backend e fronted iniciem.
