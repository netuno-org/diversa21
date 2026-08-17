import { Typography } from "antd";
import "./index.less";

const { Title } = Typography;

function LegalPage({ title, children }) {
  return (
    <section className="legal-page">
      <div className="legal-page__wrapper">
        
        <div className="legal-page__header">
          <Title level={2} style={{ marginBottom: 0 }}>{title}</Title>
        </div>

        <div className="legal-page__section">
          {children}
        </div>

      </div>
    </section>
  );
}

export default LegalPage;