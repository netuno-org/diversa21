import { Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import "./index.less";

const { Title, Paragraph } = Typography;

function LegalPage({ title, sections }) {
  const navigate = useNavigate();

  return (
    <section className="legal-page">
      <div className="legal-page__wrapper">
        
        <div className="legal-page__header">
          <Title level={2}>{title}</Title>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            className="legal-page__back-button"
          >
            Voltar
          </Button>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="legal-page__section">
            <Title level={4}>{section.title}</Title>
            {section.content.map((paragraph, index) => (
              <Paragraph key={index}>{paragraph}</Paragraph>
            ))}
          </div>
        ))}
        
        <div className="legal-page__footer">
          <Paragraph className="legal-page__note">
            Pode consultar a outra política aqui: <Link to="/privacy">Política de Privacidade</Link> ou <Link to="/terms">Termos e Condições</Link>.
          </Paragraph>
        </div>

      </div>
    </section>
  );
}

export default LegalPage;