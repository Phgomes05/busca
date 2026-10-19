# Busca CEP & CNPJ

Versão inicial de um site estático para consultar CEP, consultar CNPJ e comparar dois CEPs.

## Como executar no VS Code

1. Extraia o arquivo ZIP.
2. Abra a pasta `Busca_CEP_CNPJ` no Visual Studio Code.
3. Instale a extensão **Live Server**, se ainda não estiver instalada.
4. Abra `index.html`.
5. Clique em **Go Live** no canto inferior direito.

O site abrirá em um endereço local, geralmente parecido com `http://127.0.0.1:5500`. Isso serve para testar no seu computador; **não publica o site na internet**.

## Funcionalidades incluídas

- Consulta de CEP via ViaCEP.
- Consulta de CNPJ via BrasilAPI.
- Comparação de CEP cadastrado e CEP encontrado.
- Interface responsiva, com paleta azul-marinho, preto e branco.
- Mensagens de erro e aviso sobre limitações das fontes.

## APIs usadas

- CEP: `https://viacep.com.br/ws/{CEP}/json/`
- CNPJ: `https://minhareceita.org/{CNPJ}`

As APIs são serviços externos. Podem ficar indisponíveis, impor limites ou retornar dados que não estejam atualizados. O site não valida oficialmente a situação de uma empresa e não consegue confirmar sozinho uma mudança histórica de CEP. Para detectar alterações históricas, será necessário guardar consultas anteriores ou usar uma fonte histórica confiável.

## Como publicar gratuitamente

Uma opção é o **GitHub Pages** para publicar arquivos estáticos:
1. Crie ou entre em uma conta no GitHub.
2. Crie um repositório público, por exemplo `busca-cep-cnpj`.
3. Envie os arquivos `index.html`, `style.css`, `script.js` e `README.md` para a raiz do repositório.
4. Abra **Settings > Pages**.
5. Em **Build and deployment**, selecione a publicação pela branch `main` e a pasta `/ (root)`, e salve.
6. Aguarde a publicação e abra o endereço que o GitHub Pages mostrar.

A hospedagem pode ser gratuita dentro das condições e limites do GitHub Pages. Como o repositório público fica visível, não coloque dados privados, senhas ou chaves de API nele. O projeto atual não exige chave de API.

## Observações

- A versão inicial aceita CNPJs numéricos de 14 dígitos. Se precisar suportar CNPJs alfanuméricos, será necessário atualizar a validação e as integrações conforme o padrão aplicável.
- Não use uma divergência como prova definitiva de fraude ou mudança de endereço. Confira a fonte oficial antes de alterar cadastros.


## Alteração da fonte de CNPJ
A consulta de CNPJ foi alterada para a API Minha Receita (`https://minhareceita.org/{CNPJ}`). Ela é um serviço externo e também pode ficar indisponível ou retornar dados desatualizados. Documentação: https://docs.minhareceita.org/como-usar/
