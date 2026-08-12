import { useState } from "react";
import { Modal, Checkbox, Button, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import _service from "@netuno/service-client";
import globalNotification from "../../common/globalNotification.js";

import "./index.less";

const { Paragraph } = Typography;

function LegalAcceptanceModal({ visible, onAccepted }) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    if (!agreedTerms || !agreedPrivacy) {
      return;
    }
    setLoading(true);
    _service({
      method: 'POST',
      url: 'people/me/accept-terms',
      success: (response) => {
        setLoading(false);
        if (response.json.result) {
          onAccepted && onAccepted(response.json.acceptedTermsAt || new Date().toISOString());
        } else {
          globalNotification.warning({
            title: 'Aceite dos Termos',
            description: response.json.error || 'Não foi possível confirmar o aceite.',
          });
        }
      },
      fail: (e) => {
        setLoading(false);
        console.error('Aceite dos Termos', e);
        globalNotification.serviceFail({
          title: 'Aceite dos Termos',
          description: 'Ocorreu um erro ao confirmar o aceite. Tente novamente mais tarde.',
        });
      }
    });
  };

  return (
    <Modal
      title="Aceite dos Termos e Condições"
      open={visible}
      closable={false}
      maskClosable={false}
      maskStyle={{ backgroundColor: '#ffffff', opacity: 1 }}
      footer={[
        <Button
          key="accept"
          type="primary"
          loading={loading}
          disabled={!agreedTerms || !agreedPrivacy}
          onClick={handleAccept}
          className="legal-acceptance-modal__accept-button"
        >
          Aceitar e Continuar
        </Button>
      ]}
      className="legal-acceptance-modal"
    >
      <Space direction="vertical" size="middle" className="legal-acceptance-modal__content">
        <Paragraph>
          Para continuar a usar a plataforma, é necessário aceitar:
        </Paragraph>
        <Checkbox
          checked={agreedTerms}
          onChange={(event) => setAgreedTerms(event.target.checked)}
        >
          Li e aceito os <Link to="/terms">Termos e Condições</Link>.
        </Checkbox>
        <Checkbox
          checked={agreedPrivacy}
          onChange={(event) => setAgreedPrivacy(event.target.checked)}
        >
          Li e aceito a <Link to="/privacy">Política de Privacidade</Link>.
        </Checkbox>
      </Space>
    </Modal>
  );
}

export default LegalAcceptanceModal;