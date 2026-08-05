import { Typography } from "antd";
import { Link } from "react-router-dom";
import "./index.less";

const { Title, Paragraph } = Typography;

function LegalPage({ title, sections }) {
  return (
    <section className="legal-page">
      <div className="legal-page__wrapper">
        <Title level={2}>{title}</Title>
        {sections.map((section) => (
          <div key={section.title} className="legal-page__section">
            <Title level={4}>{section.title}</Title>
            {section.content.map((paragraph, index) => (
              <Paragraph key={index}>{paragraph}</Paragraph>
            ))}
          </div>
        ))}
        <Paragraph className="legal-page__note">
          Pode consultar a outra política aqui: <Link to="/privacy">Política de Privacidade</Link> ou <Link to="/terms">Termos e Condições</Link>.
        </Paragraph>
      </div>
    </section>
  );
}

export default LegalPage;
