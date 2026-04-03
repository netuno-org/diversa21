# Diversa21

A rede social dedicada para pessoas com trissomia.

Uma solução baseada no [ReAuthKit](https://github.com/netuno-org/reauthkit), autenticação, edição de perfil e área reservada utilizando:

- [Netuno](https://www.netuno.org/)
- [JWT](https://jwt.io/)
- [ReactJS](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Ant Design](https://ant.design/)

## Instalação

#### Netuno

[Siga os passos de instalação do Netuno aqui.](https://doc.netuno.org/pt/docs/get-started/installation)

#### Diversa21 App

Clone este projeto nas `apps` do Netuno:

- `(Raíz do Netuno)/apps/diversa21`

```shell
cd netuno/apps
git clone https://github.com/netuno-org/diversa21.git
```

Depois instale as dependências do Website, no diretório `diversa21/website/` execute o `bun install`:

```shell
cd diversa21/website
bun install
```

## Configuração

> Todo o processo a seguir descrito é destinado a ambientes de desenvolvimento Linux com algumas notas também destinadas a ambientes Microsoft Windows.

1. Copie a configuração de exemplo executando no diretório da raiz da aplicação:

    * `cp config/sample.json config/_development.json` (para o ambiente de desenvolvimento local e de testes)

    * `cp config/sample.json config/_production.json` (para o ambiente de produção)

    Ajuste o arquivo `_development.json` ou `_production_.json` de acordo com o seu ambiente.

2. Vai ter de configurar obrigatoriamente uma ligação SMTP para a funcionalidade de recuperação de palavra-passe funcionar corretamente, [saiba como fazê-lo aqui.](https://doc.netuno.org/pt/docs/academy/server/services/sending-emails)

3. Vai ter de configurar, também, obrigatoriamente uma ligação de base de dados do tipo PostgreSQL para esta aplicação funcionar corretamente, [saiba como fazê-lo aqui.](https://doc.netuno.org/pt/docs/academy/server/database/psql)

4. Onde se encontra a configuração `auth.jwt.secret` com o valor `ThisSecretMustContains32Chars!!!`, coloque um código secreto e aleatório por ser o que assegura a segurança das credênciais dos usuários, a chave secreta tem que ter 32 caracteres. [Geração de códigos seguros recomendado.](https://passwordsgenerator.net/)

5. Valide e configure o prefixo do endereço dos serviços no Netuno utilizado pelo website, em `settings.api.endpoint` com o valor `http://localhost:9000/services/` que é o valor padrão para o desenvolvimento local.

6. Para compilar o website e publicar online, é preciso criar a versão de produção otimizada:
    - Linux e Mac: Execute `bash build.sh` na pasta do `website`.
    - Windows: Execute o arquivo `build.bat` na pasta do `website`.

## Execução

No diretório da raiz do Netuno execute

```shell
./netuno server app=diversa21
```

Fará com que o servidor de backend e fronted iniciem.

Para iniciar o `website` execute na pasta `netuno/apps/diversa21/website`:

```shell
bun run dev
```

Se quiser executar o `bun` integrado com o terminal do Netuno no mesmo processo, habilite os `commands` na configuração da aplicação.
