import LegalPage from "../Legal/LegalPage";

const sections = [
  {
    title: "Termos e Condições",
    content: [
      "Bem-vindo à diversa21. Ao utilizar a plataforma, você concorda com os termos descritos nestas condições.",
      "A plataforma destina-se a apoiar a colaboração entre membros e instituições, com uso responsável e em conformidade com as políticas de privacidade.",
      "O uso do serviço requer respeito às regras de conduta, proibição de conteúdo ofensivo e o cumprimento das instruções de publicação.",
    ],
  },
  {
    title: "Acessos e Responsabilidades",
    content: [
      "Você é responsável pela veracidade dos dados fornecidos e pelo uso seguro de suas credenciais.",
      "A diversa21 pode suspender ou encerrar o acesso em caso de uso indevido ou violação destes termos.",
    ],
  },
  {
    title: "Atualizações",
    content: [
      "Estes Termos e Condições podem ser atualizados periodicamente. O uso contínuo da plataforma após modificações implica aceitação das novas versões.",
    ],
  },
];

function TermsPage() {
  return <LegalPage title="Termos e Condições" sections={sections} />;
}

export default TermsPage;
