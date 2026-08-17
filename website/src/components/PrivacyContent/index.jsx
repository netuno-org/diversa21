import React from "react";
import { Typography } from "antd";

import "./index.less"; 

const { Title, Paragraph } = Typography;

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

export default function PrivacyContent() {
  return (
    <div className="legal-content">
      {sections.map((section, index) => (
        <div key={index} className="legal-content__section">
          <Title level={4}>
            {section.title}
          </Title>
          {section.content.map((text, i) => (
            <Paragraph key={i}>
              {text}
            </Paragraph>
          ))}
        </div>
      ))}
    </div>
  );
}