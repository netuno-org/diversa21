import LegalPage from "../Legal/LegalPage";

const sections = [
  {
    title: "Política de Privacidade",
    content: [
      "A diversa21 respeita a sua privacidade e trata seus dados pessoais com segurança e transparência.",
      "Os dados fornecidos são usados para autenticação, relacionamento entre membros e para oferecer funcionalidades da plataforma.",
    ],
  },
  {
    title: "Dados Coletados",
    content: [
      "Coletamos informações como nome, e-mail, instituição, cidade e dados de perfil para proporcionar a experiência completa do serviço.",
      "Podemos utilizar dados de atividade para fins legais, de comunicação e de melhoria da plataforma.",
    ],
  },
  {
    title: "Direitos do Usuário",
    content: [
      "Você pode revisar e atualizar seus dados pessoais a qualquer momento no seu perfil.",
      "O aceite desta política permite que a diversa21 processe seus dados de acordo com as finalidades descritas.",
    ],
  },
];

function PrivacyPage() {
  return <LegalPage title="Política de Privacidade" sections={sections} />;
}

export default PrivacyPage;
